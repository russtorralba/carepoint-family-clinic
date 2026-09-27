import { supabase } from "../lib/supabase";
import { initialData } from "./mockData";

const BUCKET = "website-images";
const allowedTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const configuredClient = () => {
  if (!supabase)
    throw new Error(
      "Supabase is not configured. Add your project URL and publishable key to .env, then restart Vite.",
    );
  return supabase;
};

const fallbackImages = () => JSON.parse(JSON.stringify(initialData.images));
const fallbackSlot = (slot) =>
  fallbackImages().find((image) => image.slot === slot);
const newestFirst = (files) =>
  [...files].sort((a, b) => {
    const aDate = new Date(a.created_at ?? a.updated_at ?? 0).getTime();
    const bDate = new Date(b.created_at ?? b.updated_at ?? 0).getTime();
    return bDate - aDate || b.name.localeCompare(a.name);
  });

export async function loadWebsiteImage(slot) {
  const client = configuredClient();
  const { data, error } = await client.storage.from(BUCKET).list(slot, {
    limit: 100,
  });
  if (error) {
    console.error(`Unable to list website-images/${slot}:`, error);
    throw new Error(`Unable to load the ${slot} image: ${error.message}`);
  }
  const file = newestFirst(data ?? []).find((item) => item.name);
  if (!file) return fallbackSlot(slot);
  const path = `${slot}/${file.name}`;
  const { data: publicUrl } = client.storage.from(BUCKET).getPublicUrl(path);
  return { ...fallbackSlot(slot), path, url: publicUrl.publicUrl };
}

export async function loadWebsiteImages() {
  return Promise.all(
    fallbackImages().map((image) => loadWebsiteImage(image.slot)),
  );
}

export async function uploadWebsiteImage(slot, file) {
  const client = configuredClient();
  if (!allowedTypes[file.type])
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Choose an image smaller than 5 MB.");

  const { data: previousFiles, error: listError } = await client.storage
    .from(BUCKET)
    .list(slot);
  if (listError) {
    console.error(`Unable to list existing website-images/${slot}:`, listError);
    throw new Error(
      `Unable to replace the ${slot} image: ${listError.message}`,
    );
  }

  const uniqueName = `${slot}-${Date.now()}-${crypto.randomUUID()}.${allowedTypes[file.type]}`;
  const path = `${slot}/${uniqueName}`;
  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      contentType: file.type,
      upsert: false,
    });
  if (uploadError) throw uploadError;

  const oldPaths = (previousFiles ?? []).map((item) => `${slot}/${item.name}`);
  if (oldPaths.length) {
    const { error: removeError } = await client.storage
      .from(BUCKET)
      .remove(oldPaths);
    if (removeError) {
      console.error(
        `Uploaded ${path}, but could not remove the prior ${slot} image:`,
        removeError,
      );
    }
  }
  return loadWebsiteImage(slot);
}

export async function uploadTeamMemberPhoto(memberId, file) {
  const client = configuredClient();
  if (!allowedTypes[file.type])
    throw new Error("Choose a JPEG, PNG, or WebP image.");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Choose an image smaller than 5 MB.");

  const uniqueName = `portrait-${Date.now()}-${crypto.randomUUID()}.${allowedTypes[file.type]}`;
  const path = `team-members/${memberId}/${uniqueName}`;
  const { error } = await client.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  const { data: publicUrl } = client.storage.from(BUCKET).getPublicUrl(path);
  return publicUrl.publicUrl;
}
