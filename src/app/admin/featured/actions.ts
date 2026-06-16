"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { writeAuditLog } from "@/lib/audit-log";
import { getCurrentAdmin } from "@/lib/admin-users";
import { getSupabaseAdminClient } from "@/lib/supabase-server";

function textValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function statusForFeaturedError(message?: string) {
  if (
    message?.includes("featured_documents") &&
    (message.includes("Could not find the table") || message.includes("does not exist") || message.includes("schema cache"))
  ) {
    return "missing-table";
  }

  return "error";
}

async function requireAdminClient() {
  const currentAdmin = await getCurrentAdmin();
  if (!currentAdmin) {
    redirect("/admin/login");
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    redirect("/admin/featured?status=missing-env");
  }

  return { supabase, currentAdmin };
}

function revalidateFeaturedPaths() {
  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/admin/featured");
  revalidatePath("/admin/audit");
}

export async function addFeaturedDocumentAction(formData: FormData) {
  const { supabase } = await requireAdminClient();
  const documentId = textValue(formData, "document_id");

  if (!documentId) {
    redirect("/admin/featured?status=missing-document");
  }

  const { data: maxRow, error: maxError } = await supabase
    .from("featured_documents")
    .select("position")
    .eq("is_active", true)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) {
    redirect(`/admin/featured?status=${statusForFeaturedError(maxError.message)}`);
  }

  const nextPosition = Number(maxRow?.position || 0) + 1;
  const { error } = await supabase.from("featured_documents").upsert(
    {
      document_id: documentId,
      position: nextPosition,
      is_active: true,
      updated_at: new Date().toISOString()
    },
    { onConflict: "document_id" }
  );

  if (error) {
    redirect(`/admin/featured?status=${statusForFeaturedError(error.message)}`);
  }

  await writeAuditLog({
    action: "featured_document.add",
    entityType: "featured_document",
    entityId: documentId,
    metadata: { position: nextPosition }
  });

  revalidateFeaturedPaths();
  redirect("/admin/featured?status=added");
}

export async function updateFeaturedDocumentsAction(formData: FormData) {
  const { supabase } = await requireAdminClient();
  const documentIds = formData.getAll("document_id").filter((value): value is string => typeof value === "string" && value.trim().length > 0);

  for (const documentId of documentIds) {
    const position = Number(textValue(formData, `position_${documentId}`)) || 1;
    const note = textValue(formData, `note_${documentId}`);

    const { error } = await supabase
      .from("featured_documents")
      .update({
        position,
        note: note || null,
        updated_at: new Date().toISOString()
      })
      .eq("document_id", documentId);

    if (error) {
      redirect(`/admin/featured?status=${statusForFeaturedError(error.message)}`);
    }
  }

  await writeAuditLog({
    action: "featured_document.update",
    entityType: "featured_document",
    metadata: { documentIds }
  });

  revalidateFeaturedPaths();
  redirect("/admin/featured?status=updated");
}

export async function removeFeaturedDocumentAction(documentId: string) {
  const { supabase } = await requireAdminClient();

  const { error } = await supabase.from("featured_documents").delete().eq("document_id", documentId);

  if (error) {
    redirect(`/admin/featured?status=${statusForFeaturedError(error.message)}`);
  }

  await writeAuditLog({
    action: "featured_document.remove",
    entityType: "featured_document",
    entityId: documentId
  });

  revalidateFeaturedPaths();
  redirect("/admin/featured?status=removed");
}
