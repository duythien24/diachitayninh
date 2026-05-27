"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  getCurrentAdmin,
  hashAdminPassword,
  isMissingAdminUsersTable,
  verifyCurrentAdminPassword
} from "@/lib/admin-users";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isDuplicateUsernameError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("duplicate") || normalized.includes("admin_users_username_key");
}

function adminClient() {
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    redirect("/admin/accounts?status=missing-env");
  }
  return supabase;
}

async function requireSuperAdmin() {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin || currentAdmin.role !== "super_admin") {
    redirect("/admin/accounts?status=forbidden");
  }
  return currentAdmin;
}

export async function createAdminUserAction(formData: FormData) {
  await requireSuperAdmin();
  const supabase = adminClient();
  const username = textValue(formData, "username");
  const password = textValue(formData, "password");

  if (!username) {
    redirect("/admin/accounts?status=missing-username");
  }

  if (password.length < 6) {
    redirect("/admin/accounts?status=password-too-short");
  }

  const { error } = await supabase.from("admin_users").insert({
    username,
    password_hash: await hashAdminPassword(password),
    role: "document_manager"
  });

  if (error) {
    if (isMissingAdminUsersTable(error.message)) {
      redirect("/admin/accounts?status=missing-table");
    }
    if (isDuplicateUsernameError(error.message)) {
      redirect("/admin/accounts?status=username-exists");
    }
    redirect("/admin/accounts?status=create-failed");
  }

  revalidatePath("/admin/accounts");
  redirect("/admin/accounts?status=created");
}

export async function changeCurrentAdminPasswordAction(formData: FormData) {
  const supabase = adminClient();
  const currentAdmin = await getCurrentAdmin();
  const oldPassword = textValue(formData, "old_password");
  const newPassword = textValue(formData, "new_password");
  const confirmPassword = textValue(formData, "confirm_password");

  if (!currentAdmin) {
    redirect("/admin/login");
  }

  if (newPassword.length < 6) {
    redirect("/admin/accounts?status=password-too-short");
  }

  if (newPassword !== confirmPassword) {
    redirect("/admin/accounts?status=password-mismatch");
  }

  if (!(await verifyCurrentAdminPassword(currentAdmin, oldPassword))) {
    redirect("/admin/accounts?status=wrong-password");
  }

  const passwordHash = await hashAdminPassword(newPassword);
  const update = currentAdmin.userId
    ? supabase.from("admin_users").update({ password_hash: passwordHash }).eq("id", currentAdmin.userId)
    : supabase.from("admin_users").upsert(
        {
          username: currentAdmin.username,
          password_hash: passwordHash,
          role: "super_admin"
        },
        { onConflict: "username" }
      );

  const { error } = await update;

  if (error) {
    if (isMissingAdminUsersTable(error.message)) {
      redirect("/admin/accounts?status=missing-table");
    }
    redirect("/admin/accounts?status=password-failed");
  }

  revalidatePath("/admin/accounts");
  redirect("/admin/accounts?status=password-updated");
}

export async function deleteAdminUserAction(userId: string) {
  const currentAdmin = await requireSuperAdmin();
  if (currentAdmin.userId === userId) {
    redirect("/admin/accounts?status=cannot-delete-self");
  }

  const supabase = adminClient();
  const { error } = await supabase.from("admin_users").delete().eq("id", userId);

  if (error) {
    if (isMissingAdminUsersTable(error.message)) {
      redirect("/admin/accounts?status=missing-table");
    }
    redirect("/admin/accounts?status=delete-failed");
  }

  revalidatePath("/admin/accounts");
  redirect("/admin/accounts?status=deleted");
}
