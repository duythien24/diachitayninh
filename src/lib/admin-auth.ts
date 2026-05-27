export const adminSessionCookie = "diachitayninh_admin";

function adminUsername() {
  return process.env.ADMIN_USERNAME || "admin";
}

function adminSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(value: string) {
  const secret = adminSecret();

  if (!secret) {
    return "";
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToHex(signature);
}

export async function createAdminSessionValue() {
  const username = adminUsername();
  const signature = await sign(username);
  return `${username}.${signature}`;
}

export async function isValidAdminSession(value?: string) {
  if (!value || !adminSecret()) {
    return false;
  }

  const expected = await createAdminSessionValue();
  return value === expected;
}

export function isValidAdminLogin(username: string, password: string) {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  return Boolean(configuredPassword && username === adminUsername() && password === configuredPassword);
}

export function safeAdminNextPath(value?: string | null) {
  if (!value?.startsWith("/admin") || value.startsWith("/admin/login")) {
    return "/admin";
  }

  return value;
}
