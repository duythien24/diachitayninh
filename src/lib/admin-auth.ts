export const adminSessionCookie = "diachitayninh_admin";
export const adminSessionMaxAge = 60 * 60 * 8;

type AdminSessionPayload = {
  username: string;
  iat: number;
  exp: number;
};

export function adminUsername() {
  return process.env.ADMIN_USERNAME || "admin";
}

export function adminPassword() {
  return process.env.ADMIN_PASSWORD || "";
}

function adminSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function bytesToHex(bytes: ArrayBuffer) {
  return Array.from(new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

function base64UrlEncode(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new TextDecoder().decode(bytes);
}

async function sign(value: string) {
  const secret = adminSecret();

  if (!secret) {
    return "";
  }

  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await globalThis.crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return bytesToHex(signature);
}

export async function createAdminSessionValue(username = adminUsername()) {
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      username,
      iat: now,
      exp: now + adminSessionMaxAge
    } satisfies AdminSessionPayload)
  );
  const signature = await sign(payload);
  return `${payload}.${signature}`;
}

export async function isValidAdminSession(value?: string) {
  if (!value || !adminSecret()) {
    return false;
  }

  const separator = value.lastIndexOf(".");
  if (separator <= 0) {
    return false;
  }

  const payloadValue = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const expectedSignature = await sign(payloadValue);

  if (!constantTimeEqual(signature, expectedSignature)) {
    return false;
  }

  const payload = parseAdminSessionValue(value);
  if (!payload) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return payload.exp > now && payload.iat <= now;
}

export function parseAdminSessionValue(value?: string) {
  if (!value) {
    return null;
  }

  const separator = value.lastIndexOf(".");
  if (separator <= 0) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(value.slice(0, separator))) as Partial<AdminSessionPayload>;

    if (
      typeof payload.username !== "string" ||
      typeof payload.iat !== "number" ||
      typeof payload.exp !== "number" ||
      payload.username.trim().length === 0
    ) {
      return null;
    }

    return {
      username: payload.username,
      iat: payload.iat,
      exp: payload.exp
    };
  } catch {
    return null;
  }
}

export function isValidEnvAdminLogin(username: string, password: string) {
  return Boolean(adminPassword() && username === adminUsername() && password === adminPassword());
}

export function safeAdminNextPath(value?: string | null) {
  if (!value?.startsWith("/admin") || value.startsWith("/admin/login")) {
    return "/admin";
  }

  return value;
}
