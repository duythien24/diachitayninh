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

function passwordValue(formData: FormData, key = "password") {
  const value = textValue(formData, key);
  if (value.length < 6) {
    throw new Error("Mật khẩu cần tối thiểu 6 ký tự.");
  }
  return value;
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
  const password = passwordValue(formData);

  if (!username) {
    throw new Error("Tên đăng nhập là bắt buộc.");
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
    throw new Error(error.message);
  }

  revalidatePath("/admin/accounts");
  redirect("/admin/accounts?status=created");
}

export async function changeCurrentAdminPasswordAction(formData: FormData) {
  const supabase = adminClient();
  const currentAdmin = await getCurrentAdmin();
  const oldPassword = textValue(formData, "old_password");
  const newPassword = passwordValue(formData, "new_password");
  const confirmPassword = textValue(formData, "confirm_password");

  if (!currentAdmin) {
    redirect("/admin/login");
  }

  if (newPassword !== confirmPassword) {
    redirect("/admin/accounts?status=password-mismatch");
  }

  if (!(await verifyCurrentAdminPassword(currentAdmin, oldPassword))) {
    redirect("/admin/accounts?status=wrong-password");
  }

  if (!currentAdmin.userId) {
    redirect("/admin/accounts?status=env-password");
  }

  const { error } = await supabase
    .from("admin_users")
    .update({ password_hash: await hashAdminPassword(newPassword) })
    .eq("id", currentAdmin.userId);

  if (error) {
    if (isMissingAdminUsersTable(error.message)) {
      redirect("/admin/accounts?status=missing-table");
    }
    throw new Error(error.message);
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
    throw new Error(error.message);
  }

  revalidatePath("/admin/accounts");
  redirect("/admin/accounts?status=deleted");
}
