import "server-only";

import { cookies } from "next/headers";

import {
  adminPassword,
  adminSessionCookie,
  adminUsername,
  isValidAdminSession,
  isValidEnvAdminLogin,
  parseAdminSessionValue
} from "@/lib/admin-auth";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

const passwordIterations = 120000;

export type AdminRole = "super_admin" | "document_manager";

export type AdminUser = {
  id: string;
  username: string;
  role: AdminRole;
  createdAt: string;
  updatedAt: string;
};

export type CurrentAdmin = {
  username: string;
  role: AdminRole;
  source: "database" | "env";
  userId?: string;
};

type AdminUserRow = {
  id: string;
  username: string;
  password_hash: string;
  role: AdminRole | null;
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

function isMissingAdminUsersTable(message?: string) {
  return Boolean(
    message?.includes("admin_users") &&
      (message.includes("Could not find the table") || message.includes("does not exist") || message.includes("schema cache"))
  );
}

async function derivePasswordHash(password: string, salt: Uint8Array, iterations: number) {
  const saltBuffer = salt.buffer.slice(salt.byteOffset, salt.byteOffset + salt.byteLength) as ArrayBuffer;
  const key = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const hash = await globalThis.crypto.subtle.deriveBits(
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
  const salt = globalThis.crypto.getRandomValues(new Uint8Array(16));
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

export function adminRoleLabel(role: AdminRole) {
  return role === "super_admin" ? "Quản trị cao nhất" : "Quản lý tài liệu";
}

function mapAdminUser(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    username: row.username,
    role: row.role || "document_manager",
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function fetchAdminUserByUsername(username: string) {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { user: null as AdminUserRow | null, error: "Chưa cấu hình Supabase service role." };
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("id,username,password_hash,role,created_at,updated_at")
    .eq("username", username)
    .maybeSingle();

  if (error) {
    return { user: null, error: error.message };
  }

  return { user: data as AdminUserRow | null, error: null };
}

export async function ensureRootAdminUser() {
  const supabase = getSupabaseAdminClient();
  const rootUsername = adminUsername();
  const rootPassword = adminPassword();

  if (!supabase || !rootUsername || !rootPassword) {
    return null;
  }

  const existing = await fetchAdminUserByUsername(rootUsername);
  if (existing.error) {
    return isMissingAdminUsersTable(existing.error) ? existing.error : null;
  }

  if (existing.user) {
    if (existing.user.role !== "super_admin") {
      await supabase.from("admin_users").update({ role: "super_admin" }).eq("id", existing.user.id);
    }
    return null;
  }

  const { error } = await supabase.from("admin_users").insert({
    username: rootUsername,
    password_hash: await hashAdminPassword(rootPassword),
    role: "super_admin"
  });

  return error?.message || null;
}

export async function getAdminUsers() {
  const setupError = await ensureRootAdminUser();
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return { users: [] as AdminUser[], error: "Chưa cấu hình Supabase service role." };
  }

  const { data, error } = await supabase
    .from("admin_users")
    .select("id,username,password_hash,role,created_at,updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    return { users: [] as AdminUser[], error: error.message };
  }

  return {
    users: data.map((row) => mapAdminUser(row as AdminUserRow)),
    error: setupError
  };
}

export async function verifyAdminLogin(username: string, password: string) {
  const normalizedUsername = username.trim();
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const { user, error } = await fetchAdminUserByUsername(normalizedUsername);

    if (!error && user) {
      return (await verifyAdminPassword(password, user.password_hash))
        ? { username: normalizedUsername, role: user.role || "document_manager" }
        : null;
    }
  }

  return isValidEnvAdminLogin(normalizedUsername, password)
    ? { username: normalizedUsername, role: "super_admin" as AdminRole }
    : null;
}

export async function getCurrentAdmin(): Promise<CurrentAdmin | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get(adminSessionCookie)?.value;

  if (!(await isValidAdminSession(session))) {
    return null;
  }

  const parsed = parseAdminSessionValue(session);
  if (!parsed) {
    return null;
  }

  const { user } = await fetchAdminUserByUsername(parsed.username);
  if (user) {
    return {
      username: user.username,
      role: user.role || "document_manager",
      source: "database",
      userId: user.id
    };
  }

  if (parsed.username === adminUsername()) {
    return {
      username: parsed.username,
      role: "super_admin",
      source: "env"
    };
  }

  return {
    username: parsed.username,
    role: "document_manager",
    source: "env"
  };
}

export async function verifyCurrentAdminPassword(currentAdmin: CurrentAdmin, password: string) {
  if (currentAdmin.source === "database") {
    const { user } = await fetchAdminUserByUsername(currentAdmin.username);
    return Boolean(user && (await verifyAdminPassword(password, user.password_hash)));
  }

  return isValidEnvAdminLogin(currentAdmin.username, password);
}

export { isMissingAdminUsersTable };
