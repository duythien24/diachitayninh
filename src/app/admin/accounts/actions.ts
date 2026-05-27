"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { hashAdminPassword } from "@/lib/admin-users";
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

export async function createAdminUserAction(formData: FormData) {
  const supabase = adminClient();
  const username = textValue(formData, "username");
  const password = passwordValue(formData);

  if (!username) {
    throw new Error("Tên đăng nhập là bắt buộc.");
  }

  const { error } = await supabase.from("admin_users").insert({
    username,
    password_hash: await hashAdminPassword(password)
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/accounts");
  redirect("/admin/accounts?status=created");
}

export async function changeAdminPasswordAction(userId: string, formData: FormData) {
  const supabase = adminClient();
  const password = passwordValue(formData, "new_password");

  const { error } = await supabase
    .from("admin_users")
    .update({ password_hash: await hashAdminPassword(password) })
    .eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/accounts");
  redirect("/admin/accounts?status=password-updated");
}

export async function deleteAdminUserAction(userId: string) {
  const supabase = adminClient();
  const { error } = await supabase.from("admin_users").delete().eq("id", userId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/accounts");
  redirect("/admin/accounts?status=deleted");
}
