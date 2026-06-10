/* =============================================================
   Luna Arts Academy of Wilmington — Forms Worker
   Receives JSON form posts from the website and emails them via
   Resend to the correct inbox. No secrets live in this file:
   RESEND_API_KEY is a Worker secret (wrangler secret put RESEND_API_KEY).
   ============================================================= */

// Origins allowed to POST to this Worker.
const ALLOWED_ORIGINS = [
  "https://lunaartsacademy.org",
  "https://www.lunaartsacademy.org",
  "https://lunaartacademy.org",       // old domain, during transition
  "https://www.lunaartacademy.org",
  "http://localhost:3000",
  "http://127.0.0.1:5500",            // VS Code Live Server, for local testing
];

// form type -> destination inbox + a human label for the subject line.
const ROUTES = {
  contact:    { to: "info@lunaartsacademy.org",        label: "Contact message" },
  newsletter: { to: "info@lunaartsacademy.org",        label: "Newsletter signup" },
  rsvp:       { to: "info@lunaartsacademy.org",        label: "Event RSVP" },
  volunteer:  { to: "info@lunaartsacademy.org",        label: "Volunteer interest" },
  instructor: { to: "alejalafaro@lunaartsacademy.org", label: "Instructor application" },
  board:      { to: "alejalafaro@lunaartsacademy.org", label: "Board interest" },
  partner:    { to: "mark@lunaartsacademy.org",        label: "Community partnership" },
};

const FROM = "Luna Arts Academy <noreply@lunaartsacademy.org>";

function corsHeaders(origin) {
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Vary": "Origin",
  };
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
}

// Build a readable HTML + text body from arbitrary submitted fields.
function renderBody(label, fields) {
  const rows = Object.entries(fields)
    .map(([k, v]) => {
      const val = Array.isArray(v) ? v.join(", ") : v;
      return `<tr><td style="padding:6px 14px 6px 0;color:#6B2D8C;font-weight:600;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(val)}</td></tr>`;
    })
    .join("");
  const html = `<div style="font-family:system-ui,Segoe UI,Arial,sans-serif;color:#2A1538">
    <h2 style="margin:0 0 12px">${escapeHtml(label)}</h2>
    <table style="border-collapse:collapse;font-size:15px">${rows}</table>
    <p style="margin-top:18px;color:#7a6a55;font-size:12px">Sent from the Luna Arts Academy website.</p>
  </div>`;
  const text = `${label}\n\n` +
    Object.entries(fields).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`).join("\n");
  return { html, text };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin);

    if (request.method === "OPTIONS") return new Response(null, { headers: cors });
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405, headers: cors });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    // Honeypot: real users never fill this. Pretend success and drop.
    if (body._gotcha) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    const formType = String(body.formType || "contact").toLowerCase();
    const route = ROUTES[formType] || ROUTES.contact;

    // Strip control fields; everything else becomes the email body.
    const { formType: _ft, _gotcha, ...rawFields } = body;
    const fields = {};
    for (const [k, v] of Object.entries(rawFields)) {
      if (v === undefined || v === null || v === "") continue;
      // basic length guard
      fields[k] = typeof v === "string" ? v.slice(0, 5000) : v;
    }

    // Light validation: an email is expected on every form.
    const submitterEmail = fields.email || fields.Email;

    const { html, text } = renderBody(route.label, fields);
    const subjectName = fields.name || fields.Name || submitterEmail || "Website visitor";
    const payload = {
      from: FROM,
      to: [route.to],
      subject: `${route.label} — ${subjectName}`,
      html,
      text,
    };
    if (submitterEmail && /.+@.+\..+/.test(submitterEmail)) payload.reply_to = submitterEmail;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${(env.RESEND_API_KEY || "").trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Resend error:", res.status, err);
      return new Response(JSON.stringify({ error: "Could not send. Please email us directly." }), {
        status: 502, headers: { ...cors, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...cors, "Content-Type": "application/json" },
    });
  },
};
