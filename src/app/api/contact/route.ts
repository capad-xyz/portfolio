import { NextRequest } from "next/server";

export const runtime = "edge";

const FROM = "Portfolio <contact@capad.fyi>";
const TO = "connect@capad.fyi";

const buckets = new Map<string, { count: number; resetAt: number }>();
const LIMIT = 5;
const WINDOW_MS = 60 * 60 * 1000;

function rateLimit(ip: string) {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (b.count >= LIMIT) return false;
  b.count += 1;
  return true;
}

function clean(s: unknown, max: number) {
  return typeof s === "string" ? s.trim().slice(0, max) : "";
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("cf-connecting-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  if (!rateLimit(ip)) {
    return Response.json({ error: "Too many messages. Try again later." }, { status: 429 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }

  if (clean(body.website, 1).length > 0) {
    return Response.json({ ok: true });
  }

  const name = clean(body.name, 120);
  const email = clean(body.email, 254);
  const message = clean(body.message, 4000);

  if (!name || !email || !message) {
    return Response.json({ error: "Name, email, and message are required." }, { status: 400 });
  }
  if (!EMAIL_RE.test(email)) {
    return Response.json({ error: "That email doesn't look right." }, { status: 400 });
  }

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.error("RESEND_API_KEY missing");
    return Response.json({ error: "Mail service not configured." }, { status: 500 });
  }

  const subject = `Portfolio message from ${name}`;
  const text =
    `New message via capad.fyi\n\n` +
    `From: ${name} <${email}>\n` +
    `IP:   ${ip}\n` +
    `\n--- message ---\n${message}\n`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: TO,
      subject,
      text,
      reply_to: email,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Resend error", res.status, detail);
    const isDev = process.env.NODE_ENV !== "production";
    return Response.json(
      {
        error: "Couldn't send. Try email directly.",
        ...(isDev && { devDetail: `${res.status} ${detail}` }),
      },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
