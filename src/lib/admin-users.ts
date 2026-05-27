import "server-only";

import { isValidEnvAdminLogin } from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

const passwordIterations = 120000;

export type AdminUser = {
  id: string;
  username: string;
  createdAt: string;
  updatedAt: string;
};

type AdminUserRow = {
  id: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

function bytesToHex(bytes: ArrayBuffer | Uint8Array) {
  return Array.from(bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function hexToBytes(value: string) {
  const bytes = new Uint8Array(value.length / 2);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function constantTimeEqual(left: string, right: string) {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations: number) {
  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: saltBuffer,
      iterations
    },
    key,
    256
  );
  return bytesToHex(hash);
}

export async function hashAdminPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt, passwordIterations);
  return `pbkdf2_sha256$${passwordIterations}$${bytesToHex(salt)}$${hash}`;
}

export async function verifyAdminPassword(password: string, storedHash: string) {
  const [algorithm, iterationsValue, saltValue, hashValue] = storedHash.split("$");
  const iterations = Number(iterationsValue);

  if (algorithm !== "pbkdf2_sha256" || !Number.isFinite(iterations) || !saltValue || !hashValue) {
    return false;
  }

  const hash = await derivePasswordHash(password, hexToBytes(saltValue), iterations);
  return constantTimeEqual(hash, hashValue);
}

function mapAdminUser(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    username: row.username,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function getAdminUsers() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { users: [] as AdminUser[], error: "Chưa cấu hình Supabase service role." };
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("id,username,password_hash,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { users: [] as AdminUser[], error: error.message };
  }

  return { users: data.map((row) => mapAdminUser(row as AdminUserRow)), error: null };
}

export async function verifyAdminLogin(username: string, password: string) {
  const normalizedUsername = username.trim();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { data, error } = await supabase
      .from("admin_users")
      .select("username,password_hash")
      .eq("username", normalizedUsername)
      .maybeSingle();

    if (!error && data && (await verifyAdminPassword(password, (data as Pick<AdminUserRow, "password_hash">).password_hash))) {
      return normalizedUsername;
    }
  }

  return isValidEnvAdminLogin(normalizedUsername, password) ? normalizedUsername : null;
}
