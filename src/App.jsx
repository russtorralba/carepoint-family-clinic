import { useEffect, useState } from "react";
import "./App.css";
import { initialData } from "./data/mockData";
import {
  getTodayHours,
  loadWebsiteContent,
  saveTeamMemberPhoto,
  saveWebsiteSection,
} from "./data/supabaseContent";
import {
  uploadTeamMemberPhoto,
  uploadWebsiteImage,
} from "./data/websiteImages";
import { isSupabaseConfigured, supabase } from "./lib/supabase";

const I = ({ children }) => <span className="ico">{children}</span>;
const Heading = ({ eyebrow, title, copy }) => (
  <div className="heading">
    <span className="eyebrow">{eyebrow}</span>
    <h2>{title}</h2>
    {copy && <p>{copy}</p>}
  </div>
);

function Public({ data, setAdmin, contentError, onRetry }) {
  const [menu, setMenu] = useState(false),
    [faq, setFaq] = useState(0);
  if (!data)
    return (
      <main className="public-load-state">
        <a className="brand" href="#home">
          <b>✦</b>
          <span>
            CarePoint<small>FAMILY CLINIC</small>
          </span>
        </a>
        <p>
          {contentError
            ? "Website content could not be loaded right now. Please try again."
            : "Loading website content…"}
        </p>
        {contentError && (
          <button className="save" onClick={onRetry}>
            Retry
          </button>
        )}
        <button className="load-admin" onClick={() => setAdmin(true)}>
          Admin portal
        </button>
      </main>
    );
  const nav = ["Services", "Our Team", "Hours", "About", "FAQ", "Contact"];
  const todayHours = getTodayHours(data.hours);
  const clinicClosedToday =
    todayHours.is_closed || /^closed$/i.test(todayHours.hours);
  const imageUrl = (slot) =>
    data.images.find((image) => image.slot === slot)?.url;
  const heroImage = imageUrl("hero-artwork");
  const hoursImage = imageUrl("hours-artwork");
  const isVisible = (item) => item.is_visible !== false;
  const publicServices = data.services.filter(isVisible);
  const publicTeam = data.team.filter(isVisible);
  const publicAnnouncements = data.announcements.filter(isVisible);
  return (
    <div className="public">
      <header>
        <a className="brand" href="#home">
          <b>✦</b>
          <span>
            CarePoint<small>FAMILY CLINIC</small>
          </span>
        </a>
        <nav>
          {nav.map((n) => (
            <a key={n} href={"#" + n.toLowerCase().replace(" ", "-")}>
              {n}
            </a>
          ))}
        </nav>
        <div className="headtools">
          <a href={"tel:" + data.contact.phone}>☎ {data.contact.phone}</a>
          <button onClick={() => setAdmin(true)}>Admin portal</button>
        </div>
        <button className="menubtn" onClick={() => setMenu(!menu)}>
          ☰
        </button>
      </header>
      {menu && (
        <div className="mobilenav">
          {nav.map((n) => (
            <a
              key={n}
              onClick={() => setMenu(false)}
              href={"#" + n.toLowerCase().replace(" ", "-")}
            >
              {n}
            </a>
          ))}
          <button onClick={() => setAdmin(true)}>Admin portal</button>
        </div>
      )}
      <main>
        <section id="home" className="hero">
          <div className="hero-copy">
            <span className="eyebrow light">
              COMPASSIONATE CARE, CLOSE TO HOME
            </span>
            <h1>
              Care for every chapter of <em>your life.</em>
            </h1>
            <p>
              A welcoming neighborhood clinic for everyday health, thoughtful
              guidance, and care that puts people first.
            </p>
            <div className="buttons">
              <a href="#contact" className="btn primary">
                Book an appointment →
              </a>
              <a href="#services" className="btn outline">
                Explore our care
              </a>
            </div>
            <div className="trust">
              ✦{" "}
              <span>
                <b>Same-day visits</b>
                <br />
                when you need us most
              </span>
            </div>
          </div>
          <div className={`hero-art${heroImage ? " has-uploaded-image" : ""}`}>
            {heroImage ? (
              <img className="website-art-image" src={heroImage} alt="" />
            ) : (
              <>
                <i className="sun" />
                <i className="arch one" />
                <i className="arch two" />
              </>
            )}
            <div className="open-card">
              <I>◷</I>
              <span>{clinicClosedToday ? "CLOSED TODAY" : "OPEN TODAY"}</span>
              <b>{todayHours.hours}</b>
              <small>{todayHours.day}</small>
            </div>
          </div>
        </section>
        <section id="services" className="section">
          <Heading
            eyebrow="HOW WE CAN HELP"
            title="Care that meets you where you are."
            copy="From routine wellness to life's little surprises, our team is here with practical, personal care."
          />
          <div className="services-grid">
            {publicServices.map((s, i) => (
              <article className="service" key={s.id}>
                <small>0{i + 1}</small>
                <i>{["✦", "◌", "⌁", "♡"][i]}</i>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <a href="#contact">Learn more →</a>
              </article>
            ))}
          </div>
        </section>
        <section id="our-team" className="section team">
          <div className="team-copy">
            <Heading
              eyebrow="THE PEOPLE BEHIND THE CARE"
              title="A team that takes time to listen."
              copy="Our fictional demo team brings warmth, experience, and a shared belief in accessible, unrushed care."
            />
            <a href="#contact">Meet the whole team →</a>
          </div>
          <div className="team-grid">
            {publicTeam.map((p, i) => (
              <article key={p.id}>
                <div className={"portrait p" + i}>
                  {p.photo_url ? (
                    <img className="portrait-image" src={p.photo_url} alt="" />
                  ) : (
                    p.initials
                  )}
                </div>
                <h3>{p.name}</h3>
                <p>{p.role}</p>
                {p.bio && <p className="team-bio">{p.bio}</p>}
              </article>
            ))}
          </div>
        </section>
        <section id="hours" className="hours">
          <div className="hours-art">
            {hoursImage ? (
              <img className="website-art-image" src={hoursImage} alt="" />
            ) : (
              <i />
            )}
            {!hoursImage && (
              <b>
                Care
                <br />
                starts
                <br />
                here.
              </b>
            )}
            {!hoursImage && <em>✦</em>}
          </div>
          <div>
            <Heading
              eyebrow="VISIT US"
              title="Here when you need us."
              copy="Convenient hours and a calm, friendly space for your family."
            />
            <div className="hours-list">
              {data.hours.map((x) => (
                <p key={x.id}>
                  <span>{x.day}</span>
                  <b>{x.hours}</b>
                </p>
              ))}
            </div>
            <small>
              For urgent concerns outside clinic hours, please contact your
              local emergency service.
            </small>
          </div>
        </section>
        <section id="announcements" className="announce">
          <span className="eyebrow">AT CAREPOINT</span>
          {publicAnnouncements.slice(0, 2).map((a) => (
            <p key={a.id}>
              <b>{a.title}</b> — {a.body}
            </p>
          ))}
        </section>
        <section id="about" className="section about">
          <div>
            <span className="eyebrow">OUR APPROACH</span>
            <h2>Healthcare should feel human.</h2>
          </div>
          <div>
            <p className="lead">
              CarePoint is a fictional family clinic created as a demo of what
              thoughtful, community-minded care can look like online.
            </p>
            <p>
              We believe the best care starts with a real conversation. That
              means clear answers, practical next steps, and a team that sees
              the person before the appointment slot.
            </p>
            <a href="#contact">Our story →</a>
          </div>
        </section>
        <section id="faq" className="section faq">
          <Heading eyebrow="GOOD TO KNOW" title="Questions, answered." />
          {data.faqs.map((f, i) => (
            <article className={faq === i ? "open" : ""} key={f.q}>
              <button onClick={() => setFaq(faq === i ? -1 : i)}>
                {f.q}
                <b>{faq === i ? "−" : "+"}</b>
              </button>
              {faq === i && <p>{f.a}</p>}
            </article>
          ))}
        </section>
        <section id="contact" className="contact">
          <div>
            <span className="eyebrow light">LET’S TALK</span>
            <h2>We’re here to help.</h2>
            <p>
              Have a question or ready to plan a visit? Reach out to our
              friendly demo clinic team.
            </p>
            <a href={"tel:" + data.contact.phone}>☎ {data.contact.phone}</a>
            <a href={"mailto:" + data.contact.email}>✉ {data.contact.email}</a>
          </div>
          <div className="address">
            <span className="eyebrow">FIND US</span>
            <h3>{data.contact.address}</h3>
            <p>{data.contact.city}</p>
            <div
              className="fictional-map"
              role="img"
              aria-label="Fictional neighborhood map showing CarePoint Family Clinic"
            >
              <i className="map-street street-one" />
              <i className="map-street street-two" />
              <i className="map-street street-three" />
              <i className="map-block block-one" />
              <i className="map-block block-two" />
              <i className="map-block block-three" />
              <span className="map-park">Willow Park</span>
              <span className="map-marker">
                <i>✦</i>
              </span>
              <span className="map-label">CarePoint Family Clinic</span>
              <small className="map-demo">Fictional location</small>
            </div>
          </div>
        </section>
      </main>
      <footer>
        <a className="brand" href="#home">
          <b>✦</b>
          <span>
            CarePoint<small>FAMILY CLINIC</small>
          </span>
        </a>
        <p>© 2026 CarePoint Family Clinic. Fictional demo website.</p>
        <button onClick={() => setAdmin(true)}>Admin portal</button>
      </footer>
    </div>
  );
}

const pages = [
  "Dashboard",
  "Services",
  "Team",
  "Clinic Hours",
  "Announcements",
  "Contact Details",
  "Website Images",
];
function Admin({
  data,
  contentReady,
  contentError,
  onSave,
  onUpload,
  onTeamPhotoUpload,
  onRetry,
  exit,
  onSignOut,
}) {
  const [page, setPage] = useState("Dashboard"),
    [edit, setEdit] = useState(null),
    [notice, setNotice] = useState(""),
    [uploads, setUploads] = useState({}),
    [mobileNav, setMobileNav] = useState(false);
  const config = {
    Services: [
      "services",
      "Services",
      "Manage the care offerings shown on your public website.",
    ],
    Team: [
      "team",
      "Team profiles",
      "Update the fictional care team displayed publicly.",
    ],
    "Clinic Hours": [
      "hours",
      "Clinic hours",
      "Set the weekly hours visitors see.",
    ],
    Announcements: [
      "announcements",
      "Announcements",
      "Publish timely updates for your visitors.",
    ],
    "Contact Details": [
      "contact",
      "Contact details",
      "Keep your clinic contact information current.",
    ],
    "Website Images": [
      "images",
      "Website images",
      "Choose visual treatments for key website areas.",
    ],
  };
  const save = async (key, val) => {
    try {
      await onSave(key, val);
      setEdit(null);
      setNotice("Changes saved to Supabase.");
      setTimeout(() => setNotice(""), 2200);
    } catch (error) {
      setNotice(error.message || "Unable to save changes.");
    }
  };
  const upload = async (slot, file) => {
    if (!file) return;
    setUploads((current) => ({ ...current, [slot]: "Uploading image…" }));
    try {
      await onUpload(slot, file);
      setUploads((current) => ({ ...current, [slot]: "Upload complete." }));
    } catch (error) {
      setUploads((current) => ({
        ...current,
        [slot]: error.message || "Unable to upload image.",
      }));
    }
  };
  const uploadTeamPhoto = async (file) => {
    if (!file || !edit?.item?.id) return;
    const statusKey = `team-${edit.item.id}`;
    setUploads((current) => ({
      ...current,
      [statusKey]: "Uploading portrait…",
    }));
    try {
      const member = await onTeamPhotoUpload(edit.item.id, file);
      setEdit((current) =>
        current
          ? {
              ...current,
              item: { ...current.item, photo_url: member.photo_url },
            }
          : current,
      );
      setUploads((current) => ({
        ...current,
        [statusKey]: "Upload complete.",
      }));
    } catch (error) {
      setUploads((current) => ({
        ...current,
        [statusKey]: error.message || "Unable to upload portrait.",
      }));
    }
  };
  const title = (name, desc, action) => (
    <div className="admin-title">
      <div>
        <span className="eyebrow">WEBSITE MANAGEMENT</span>
        <h1>{name}</h1>
        <p>{desc}</p>
      </div>
      {action}
    </div>
  );
  const openNewItem = (targetPage, key) => () => {
    setPage(targetPage);
    const id = Date.now();
    setEdit({
      key,
      newItem: true,
      item:
        key === "team"
          ? { id, name: "New team member", role: "Fictional profile" }
          : key === "hours"
            ? { id, day: "New hours", hours: "9:00 AM – 5:00 PM" }
            : {
                id,
                title: "New item",
                description: "Add a short description.",
                body: "Add your update.",
              },
    });
  };
  const openContactEditor = () => setPage("Contact Details");
  const getLabel = (x) => x.title || x.name || x.day;
  const editForm = () => {
    if (!edit) return null;
    let { key, item, newItem } = edit;
    const change = (k, v) => setEdit({ ...edit, item: { ...item, [k]: v } });
    const field = (label, k, type = "text") => (
      <label>
        {label}
        {type === "area" ? (
          <textarea
            value={item[k] || ""}
            onChange={(e) => change(k, e.target.value)}
          />
        ) : (
          <input
            value={item[k] || ""}
            onChange={(e) => change(k, e.target.value)}
          />
        )}
      </label>
    );
    return (
      <div className="modal-back">
        <form
          className="modal"
          onSubmit={(e) => {
            e.preventDefault();
            save(
              key,
              newItem
                ? [...data[key], item]
                : data[key].map((x) => (x.id === item.id ? item : x)),
            );
          }}
        >
          <div>
            <span className="eyebrow">EDIT CONTENT</span>
            <button type="button" onClick={() => setEdit(null)}>
              ×
            </button>
            <h2>
              {newItem ? "Add" : "Edit"}{" "}
              {key === "team"
                ? "team profile"
                : key === "hours"
                  ? "clinic hours"
                  : key.slice(0, -1)}
            </h2>
          </div>
          {key === "team" && (
            <>
              {field("Name", "name")}
              {field("Role", "role")}
              {field("Bio", "bio", "area")}
              <div className="team-photo-field">
                <span>Portrait</span>
                <div className="team-photo-preview">
                  {item.photo_url ? (
                    <img src={item.photo_url} alt="Current team portrait" />
                  ) : (
                    item.initials || "—"
                  )}
                </div>
                {newItem ? (
                  <small>
                    Save this new profile before uploading a portrait.
                  </small>
                ) : (
                  <label className="image-upload">
                    {item.photo_url ? "Replace portrait" : "Upload portrait"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        uploadTeamPhoto(event.target.files?.[0])
                      }
                    />
                  </label>
                )}
                {uploads[`team-${item.id}`] && (
                  <small className="upload-status">
                    {uploads[`team-${item.id}`]}
                  </small>
                )}
              </div>
            </>
          )}
          {key === "hours" && (
            <>
              {field("Day or range", "day")}
              {field("Opening hours", "hours")}
            </>
          )}
          {key === "services" && (
            <>
              {field("Title", "title")}
              {field("Description", "description", "area")}
            </>
          )}
          {key === "announcements" && (
            <>
              {field("Title", "title")}
              {field("Announcement text", "body", "area")}
            </>
          )}
          <div className="modal-actions">
            <button type="button" onClick={() => setEdit(null)}>
              Cancel
            </button>
            <button className="save">Save changes</button>
          </div>
        </form>
      </div>
    );
  };
  const listing = (key) => (
    <div className="content-list">
      {data[key].map((x) => (
        <article key={x.id}>
          <div
            className={
              "row-icon " + key + (key === "team" ? " team-avatar" : "")
            }
          >
            {key === "team" ? (
              x.photo_url ? (
                <img className="team-avatar-image" src={x.photo_url} alt="" />
              ) : (
                x.initials
              )
            ) : key === "hours" ? (
              "◷"
            ) : key === "announcements" ? (
              "✦"
            ) : (
              "✦"
            )}
          </div>
          <div>
            <h3>{getLabel(x)}</h3>
            <p>{x.description || x.role || x.body || x.hours}</p>
            {x.date && <small>Published · {x.date}</small>}
          </div>
          <aside>
            <button onClick={() => setEdit({ key, item: { ...x } })}>✎</button>
            <button
              onClick={() => {
                if (window.confirm("Remove this demo item?"))
                  save(
                    key,
                    data[key].filter((y) => y.id !== x.id),
                  );
              }}
            >
              ⌫
            </button>
          </aside>
        </article>
      ))}
    </div>
  );
  const content = () => {
    if (page === "Dashboard")
      return (
        <>
          <div className="admin-title">
            <div>
              <span className="eyebrow">WELCOME BACK</span>
              <h1>Good morning, CarePoint.</h1>
              <p>Here’s an overview of your demo website content.</p>
            </div>
            <button className="preview" onClick={exit}>
              View public site →
            </button>
          </div>
          <div className="stats">
            <div>
              ◒<b>{data.services.length}</b>
              <span>Services listed</span>
            </div>
            <div>
              ♧<b>{data.team.length}</b>
              <span>Team profiles</span>
            </div>
            <div>
              ✦<b>{data.announcements.length}</b>
              <span>Announcements</span>
            </div>
          </div>
          <div className="dash-grid">
            <section>
              <div className="panel-head">
                <h2>Recent announcements</h2>
                <button onClick={() => setPage("Announcements")}>Manage</button>
              </div>
              {data.announcements.map((a) => (
                <p className="ann-row" key={a.id}>
                  ✦{" "}
                  <span>
                    <b>{a.title}</b>
                    <br />
                    {a.body}
                  </span>
                </p>
              ))}
            </section>
            <section className="quick">
              <h2>Quick actions</h2>
              <button onClick={openNewItem("Services", "services")}>
                ＋ Add a service
              </button>
              <button onClick={openNewItem("Announcements", "announcements")}>
                ✦ Post an announcement
              </button>
              <button onClick={openContactEditor}>
                ✎ Edit contact details
              </button>
            </section>
          </div>
        </>
      );
    let [key, name, desc] = config[page];
    if (key === "contact") {
      const f = data.contact;
      return (
        <>
          {title(name, desc)}
          <form
            className="contact-form"
            onSubmit={(e) => {
              e.preventDefault();
              save("contact", f);
            }}
          >
            {Object.entries(f).map(([k, v]) => (
              <label key={k}>
                {k.replace(/^./, (c) => c.toUpperCase())}
                <input
                  defaultValue={v}
                  onChange={(e) => (data.contact[k] = e.target.value)}
                />
              </label>
            ))}
            <button className="save">Save contact details</button>
          </form>
        </>
      );
    }
    if (key === "images")
      return (
        <>
          {title(name, desc)}
          <div className="images">
            {data.images.map((im, i) => (
              <article key={im.name}>
                <div className={"swatch s" + i}>
                  {im.url ? <img src={im.url} alt={im.name} /> : "▧"}
                </div>
                <h3>{im.name}</h3>
                <p>{im.description}</p>
                <label className="image-upload">
                  {im.url ? "Replace image" : "Upload image"}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      upload(im.slot, event.target.files?.[0])
                    }
                  />
                </label>
                {uploads[im.slot] && (
                  <small className="upload-status">{uploads[im.slot]}</small>
                )}
              </article>
            ))}
          </div>
        </>
      );
    return (
      <>
        {title(
          name,
          desc,
          key === "hours" ? null : (
            <button className="add" onClick={openNewItem(page, key)}>
              ＋{" "}
              {key === "team"
                ? "Add profile"
                : key === "announcements"
                  ? "New announcement"
                  : "Add service"}
            </button>
          ),
        )}
        {listing(key)}
      </>
    );
  };
  return (
    <div className="admin">
      <aside className="sidebar">
        <button
          className="brand sidebar-brand"
          type="button"
          onClick={() => setPage("Dashboard")}
        >
          <b>✦</b>
          <span>
            CarePoint<small>ADMIN PORTAL</small>
          </span>
        </button>
        <small>WEBSITE MANAGEMENT</small>
        {pages.map((p, i) => (
          <button
            className={p === page ? "active" : ""}
            key={p}
            onClick={() => setPage(p)}
          >
            <I>{["◒", "✎", "♧", "◷", "✦", "☎", "▧"][i]}</I>
            {p}
          </button>
        ))}
        <div>
          <button onClick={exit}>← View public site</button>
          <button onClick={onSignOut}>⇥ Logout</button>
        </div>
      </aside>
      <main className="admin-main">
        <div className="admin-mobile">
          <b>CarePoint Admin</b>
          <button
            className="admin-menu-toggle"
            type="button"
            aria-label="Toggle admin navigation"
            aria-expanded={mobileNav}
            onClick={() => setMobileNav((open) => !open)}
          >
            ☰
          </button>
        </div>
        {mobileNav && (
          <nav className="admin-mobile-nav" aria-label="Admin navigation">
            {pages.map((p, i) => (
              <button
                className={p === page ? "active" : ""}
                key={p}
                type="button"
                onClick={() => {
                  setPage(p);
                  setMobileNav(false);
                }}
              >
                <I>{["◒", "✎", "♧", "◷", "✦", "☎", "▧"][i]}</I>
                {p}
              </button>
            ))}
            <button type="button" onClick={exit}>
              ← View public site
            </button>
            <button type="button" onClick={onSignOut}>
              ⇥ Logout
            </button>
          </nav>
        )}
        {notice && <div className="toast">✓ {notice}</div>}
        {contentError ? (
          <div className="content-load-error" role="alert">
            <p>
              Website content could not be loaded. Please retry before making
              changes.
            </p>
            <button type="button" onClick={onRetry}>
              Retry
            </button>
          </div>
        ) : contentReady ? (
          content()
        ) : (
          <p>Loading website content…</p>
        )}
      </main>
      {editForm()}
    </div>
  );
}
function AdminLogin({ onLogin, error, loading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <main className="login-page">
      <form
        className="login-card"
        onSubmit={(event) => {
          event.preventDefault();
          onLogin(email, password);
        }}
      >
        <a className="brand" href="/">
          <b>✦</b>
          <span>
            CarePoint<small>ADMIN PORTAL</small>
          </span>
        </a>
        <span className="eyebrow">SECURE ADMIN ACCESS</span>
        <h1>Welcome back.</h1>
        <p>Sign in to manage the fictional CarePoint website content.</p>
        <label>
          Email address
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        {error && <p className="login-error">{error}</p>}
        <button className="save" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
        <a className="login-back" href="/">
          ← Back to public website
        </a>
      </form>
    </main>
  );
}

export default function App() {
  const [data, setData] = useState(isSupabaseConfigured ? null : initialData);
  const [contentReady, setContentReady] = useState(!isSupabaseConfigured);
  const [contentError, setContentError] = useState("");
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [admin, setAdmin] = useState(
    location.pathname === "/admin" || location.hash === "#/admin",
  );

  const refreshWebsiteContent = async () => {
    if (!isSupabaseConfigured) return;
    setContentReady(false);
    setContentError("");
    try {
      const loadedContent = await loadWebsiteContent();
      setData(loadedContent);
      setContentReady(true);
    } catch (error) {
      console.error("Unable to load CarePoint website content:", error);
      setContentError("Website content could not be loaded.");
    }
  };

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    void Promise.resolve().then(refreshWebsiteContent);
    supabase.auth.getSession().then(({ data: authData }) => {
      setSession(authData.session);
      setAuthReady(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => setSession(nextSession),
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  const enter = () => {
    window.history.pushState({}, "", "/admin");
    setAdmin(true);
  };
  const exit = () => {
    window.history.pushState({}, "", "/");
    setAdmin(false);
  };
  const signIn = async (email, password) => {
    if (!supabase) {
      setLoginError(
        "Add your Supabase URL and publishable key to .env, then restart Vite.",
      );
      return;
    }
    setLoginLoading(true);
    setLoginError("");
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) setLoginError(error.message);
    setLoginLoading(false);
  };
  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    exit();
  };
  const saveSection = async (key, value) => {
    if (!contentReady || contentError)
      throw new Error("Website content has not loaded. Please retry.");
    const updated = await saveWebsiteSection(key, value);
    setData(updated);
  };
  const uploadImage = async (slot, file) => {
    const image = await uploadWebsiteImage(slot, file);
    setData((current) => ({
      ...current,
      images: current.images.map((item) => (item.slot === slot ? image : item)),
    }));
  };
  const uploadMemberPhoto = async (memberId, file) => {
    const photoUrl = await uploadTeamMemberPhoto(memberId, file);
    const updated = await saveTeamMemberPhoto(memberId, photoUrl);
    setData(updated);
    return updated.team.find((member) => member.id === memberId);
  };

  if (admin) {
    if (!authReady)
      return <main className="login-page">Checking your session…</main>;
    if (!session)
      return (
        <AdminLogin
          onLogin={signIn}
          error={loginError}
          loading={loginLoading}
        />
      );
    return (
      <Admin
        data={data}
        contentReady={contentReady}
        contentError={contentError}
        onSave={saveSection}
        onUpload={uploadImage}
        onTeamPhotoUpload={uploadMemberPhoto}
        onRetry={refreshWebsiteContent}
        exit={exit}
        onSignOut={signOut}
      />
    );
  }
  return (
    <Public
      data={data}
      setAdmin={enter}
      contentError={contentError}
      onRetry={refreshWebsiteContent}
    />
  );
}
