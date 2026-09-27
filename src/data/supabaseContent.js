import { initialData } from "./mockData";
import { supabase } from "../lib/supabase";
import { loadWebsiteImages } from "./websiteImages";

const tables = {
  services: "services",
  team: "team_members",
  hours: "clinic_hours",
  announcements: "announcements",
};

const configuredClient = () => {
  if (!supabase)
    throw new Error(
      "Supabase is not configured. Add your project URL and publishable key to .env, then restart Vite.",
    );
  return supabase;
};

const sortByOrder = (items) =>
  [...items].sort(
    (a, b) =>
      (a.display_order ?? a.sort_order ?? 0) -
      (b.display_order ?? b.sort_order ?? 0),
  );
const fallback = (key) => JSON.parse(JSON.stringify(initialData[key]));

const mapService = (row) => ({
  id: row.id,
  title: row.name ?? "",
  description: row.description ?? "",
  is_visible: row.is_visible ?? true,
  sort_order: row.sort_order,
});
const mapTeam = (row) => ({
  id: row.id,
  name: row.name ?? "",
  role: row.role ?? "",
  bio: row.bio ?? "",
  photo_url: row.photo_url ?? "",
  initials: initialsFor(row.name),
  is_visible: row.is_visible ?? true,
  sort_order: row.sort_order,
});
const mapHours = (row) => ({
  id: row.id,
  day: row.day_label ?? "",
  hours: row.is_closed ? "Closed" : formatHours(row.open_time, row.close_time),
  is_closed: row.is_closed ?? false,
  sort_order: row.sort_order,
});
const mapAnnouncement = (row) => ({
  id: row.id,
  title: row.title ?? "",
  body: row.message ?? "",
  date: displayDate(row.created_at),
  is_visible: row.is_visible ?? true,
});
const mapContact = (row) => {
  const [address = "", city = ""] = (row.address ?? "").split("\n");
  return { phone: row.phone ?? "", email: row.email ?? "", address, city };
};
const initialsFor = (name = "") =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
const displayDate = (value) =>
  value
    ? new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(
        new Date(value),
      )
    : "";
const formatTime = (value) => {
  if (!value) return "";
  const [rawHours, minutes = "00"] = value.split(":");
  const hours = Number(rawHours);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${hours % 12 || 12}:${minutes} ${suffix}`;
};
const formatHours = (openTime, closeTime) =>
  openTime && closeTime
    ? `${formatTime(openTime)} – ${formatTime(closeTime)}`
    : "Please call";
const toDatabaseTime = (value) => {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = match[2] ?? "00";
  const period = match[3]?.toUpperCase();
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${String(hours).padStart(2, "0")}:${minutes}:00`;
};
const hoursPayload = (item, index) => {
  const isClosed = item.is_closed || /^closed$/i.test(item.hours.trim());
  const [openText = "", closeText = ""] = item.hours.split(/\s*[–—-]\s*/);
  return {
    day_label: item.day,
    open_time: isClosed ? null : toDatabaseTime(openText),
    close_time: isClosed ? null : toDatabaseTime(closeText),
    is_closed: isClosed,
    sort_order: item.sort_order ?? index,
  };
};

const collectionReaders = {
  services: mapService,
  team: mapTeam,
  hours: mapHours,
  announcements: mapAnnouncement,
};

export async function loadWebsiteContent() {
  const client = configuredClient();
  const [services, team, hours, announcements, contact, images] =
    await Promise.all([
      client.from("services").select("*"),
      client.from("team_members").select("*"),
      client.from("clinic_hours").select("*"),
      client.from("announcements").select("*"),
      client.from("contact_details").select("*").limit(1),
      loadWebsiteImages().catch((error) => {
        console.error(
          "Unable to load website images from Supabase Storage:",
          error,
        );
        return fallback("images");
      }),
    ]);
  const responses = [services, team, hours, announcements, contact];
  const error = responses.find((response) => response.error)?.error;
  if (error) throw error;

  const asCollection = (response, key) => {
    const rows = response.data ?? [];
    return rows.length
      ? sortByOrder(rows.map(collectionReaders[key]))
      : fallback(key);
  };
  const contactRow = contact.data?.[0];
  return {
    ...initialData,
    services: asCollection(services, "services"),
    team: asCollection(team, "team"),
    hours: asCollection(hours, "hours"),
    announcements: asCollection(announcements, "announcements"),
    images,
    contact: contactRow
      ? { ...initialData.contact, ...mapContact(contactRow) }
      : fallback("contact"),
  };
}

const payloads = {
  services: (item, index) => ({
    name: item.title,
    description: item.description,
    is_visible: item.is_visible ?? true,
    sort_order: item.sort_order ?? index,
  }),
  team: (item, index) => ({
    name: item.name,
    role: item.role,
    bio: item.bio || null,
    is_visible: item.is_visible ?? true,
    sort_order: item.sort_order ?? index,
  }),
  hours: hoursPayload,
  announcements: (item) => ({
    title: item.title,
    message: item.body,
    is_visible: item.is_visible ?? true,
  }),
};

export async function saveCollection(key, items) {
  const client = configuredClient();
  const table = tables[key];
  const { data: existing, error: existingError } = await client
    .from(table)
    .select("id");
  if (existingError) throw existingError;
  const existingIds = new Set((existing ?? []).map((item) => item.id));
  const submittedIds = new Set(
    items.map((item) => item.id).filter((id) => existingIds.has(id)),
  );
  const deletedIds = [...existingIds].filter((id) => !submittedIds.has(id));

  if (deletedIds.length) {
    const { error } = await client.from(table).delete().in("id", deletedIds);
    if (error) throw error;
  }
  for (const [index, item] of items.entries()) {
    const payload = payloads[key](item, index);
    const response = existingIds.has(item.id)
      ? await client.from(table).update(payload).eq("id", item.id)
      : await client.from(table).insert(payload);
    if (response.error) throw response.error;
  }
  return loadWebsiteContent();
}

export async function saveContact(contact) {
  const client = configuredClient();
  const { data: existing, error: readError } = await client
    .from("contact_details")
    .select("id")
    .limit(1);
  if (readError) throw readError;
  const payload = {
    phone: contact.phone,
    email: contact.email,
    address: [contact.address, contact.city].filter(Boolean).join("\n"),
  };
  const response = existing?.[0]
    ? await client
        .from("contact_details")
        .update(payload)
        .eq("id", existing[0].id)
    : await client.from("contact_details").insert(payload);
  if (response.error) throw response.error;
  return loadWebsiteContent();
}

export async function saveWebsiteSection(key, value) {
  return key === "contact" ? saveContact(value) : saveCollection(key, value);
}

export async function saveTeamMemberPhoto(memberId, photoUrl) {
  const client = configuredClient();
  const { data, error } = await client
    .from("team_members")
    .update({ photo_url: photoUrl })
    .eq("id", memberId)
    .select("id, photo_url")
    .maybeSingle();
  if (error) throw error;
  if (!data)
    throw new Error("Save this team profile before uploading a portrait.");
  return loadWebsiteContent();
}

export function getTodayHours(hours, date = new Date()) {
  const day = date.getDay();
  const matchingDay =
    day >= 1 && day <= 5
      ? hours.find(
          (item) => /monday/i.test(item.day) && /friday/i.test(item.day),
        )
      : day === 6
        ? hours.find((item) => /saturday/i.test(item.day))
        : hours.find((item) => /sunday/i.test(item.day));

  return (
    matchingDay ?? hours[0] ?? { day: "Today", hours: "Please call for hours" }
  );
}
