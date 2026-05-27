import { KeyRound, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";

import {
  changeCurrentAdminPasswordAction,
  createAdminUserAction,
  deleteAdminUserAction
} from "@/app/admin/accounts/actions";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { PasswordField } from "@/components/password-field";
import { adminRoleLabel, getAdminUsers, getCurrentAdmin } from "@/lib/admin-users";
import { cn } from "@/lib/utils";

function statusMessage(status?: string) {
  if (status === "created") return "Đã tạo tài khoản quản lý tài liệu.";
  if (status === "password-updated") return "Đã đổi mật khẩu thành công.";
  if (status === "deleted") return "Đã xóa tài khoản.";
  if (status === "missing-env") return "Chưa cấu hình Supabase service role nên chưa thể lưu tài khoản.";
  if (status === "missing-table") return "Chưa có bảng admin_users trên Supabase. Hãy chạy file SQL tạo bảng trước.";
  if (status === "forbidden") return "Tài khoản này không có quyền quản trị tài khoản.";
  if (status === "password-mismatch") return "Mật khẩu mới nhập lại chưa khớp.";
  if (status === "password-too-short") return "Mật khẩu cần tối thiểu 6 ký tự.";
  if (status === "wrong-password") return "Mật khẩu cũ chưa đúng nên chưa thể đổi mật khẩu.";
  if (status === "env-password") return "Tài khoản gốc trong biến môi trường cần chạy SQL admin_users trước khi đổi mật khẩu trong web.";
  if (status === "missing-username") return "Vui lòng nhập tên đăng nhập.";
  if (status === "username-exists") return "Tên đăng nhập này đã tồn tại. Hãy chọn tên khác.";
  if (status === "create-failed") return "Chưa tạo được tài khoản mới. Vui lòng kiểm tra lại cấu hình Supabase.";
  if (status === "password-failed") return "Chưa đổi được mật khẩu. Vui lòng thử lại.";
  if (status === "delete-failed") return "Chưa xóa được tài khoản. Vui lòng thử lại.";
  if (status === "cannot-delete-self") return "Không thể xóa tài khoản đang đăng nhập.";
  return null;
}

function isSuccessStatus(status?: string) {
  return status === "created" || status === "password-updated" || status === "deleted";
}

export default async function AdminAccountsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [params, result, currentAdmin] = await Promise.all([searchParams, getAdminUsers(), getCurrentAdmin()]);
  const message = statusMessage(params.status);
  const success = isSuccessStatus(params.status);
  const canManageAccounts = currentAdmin?.role === "super_admin";

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Quản trị"
        title="Tài khoản và mật khẩu"
        description="Tài khoản gốc có quyền quản trị cao nhất. Tài khoản tạo mới chỉ dùng để quản lý tài liệu."
      />

      {message ? (
        <div
          className={cn(
            "mt-6 rounded border p-4 text-sm font-medium",
            success ? "border-palm/20 bg-palm/8 text-palm" : "border-lacquer/20 bg-lacquer/8 text-lacquer"
          )}
        >
          {message}
        </div>
      ) : null}

      {result.error ? (
        <div className="mt-6 rounded border border-lacquer/20 bg-lacquer/8 p-4 text-sm leading-6 text-lacquer">
          Chưa đọc được bảng tài khoản quản trị: {result.error}. Hãy chạy file SQL tạo bảng admin_users trong Supabase.
        </div>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        <div className="space-y-6">
          <div className="rounded border border-ink/10 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded bg-palm text-white">
                <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-ink">Tài khoản đang sử dụng</h2>
                <p className="mt-1 text-sm text-ink/55">
                  {currentAdmin ? adminRoleLabel(currentAdmin.role) : "Chưa xác định"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded bg-paper p-4 text-sm leading-6 text-ink/68">
              <p>
                <span className="font-semibold text-ink">Tên đăng nhập:</span>{" "}
                {currentAdmin?.username || "Không rõ"}
              </p>
              <p>
                <span className="font-semibold text-ink">Quyền:</span>{" "}
                {currentAdmin ? adminRoleLabel(currentAdmin.role) : "Không rõ"}
              </p>
            </div>

            <details className="mt-5">
              <summary className="inline-flex cursor-pointer items-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90">
                <KeyRound className="h-4 w-4" aria-hidden="true" />
                Đổi mật khẩu
              </summary>

              <form action={changeCurrentAdminPasswordAction} className="mt-5 grid gap-4">
                <label className="grid gap-2 text-sm font-semibold text-ink">
                  Tài khoản đang sử dụng
                  <input
                    value={currentAdmin?.username || ""}
                    readOnly
                    className="rounded border border-ink/12 bg-paper px-3 py-3 font-normal text-ink/70 outline-none"
                  />
                </label>
                <PasswordField name="old_password" label="Mật khẩu cũ" autoComplete="current-password" />
                <PasswordField name="new_password" label="Mật khẩu mới" minLength={6} autoComplete="new-password" />
                <PasswordField
                  name="confirm_password"
                  label="Nhập lại mật khẩu mới"
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
                >
                  <KeyRound className="h-4 w-4" aria-hidden="true" />
                  Lưu mật khẩu mới
                </button>
              </form>
            </details>
          </div>

          {canManageAccounts ? (
            <form action={createAdminUserAction} className="rounded border border-ink/10 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded bg-river text-white">
                  <UserPlus className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-xl font-semibold text-ink">Tạo tài khoản</h2>
                  <p className="mt-1 text-sm text-ink/55">Tài khoản mới chỉ có quyền quản lý tài liệu.</p>
                </div>
              </div>

              <label className="mt-6 grid gap-2 text-sm font-semibold text-ink">
                Tên đăng nhập
                <input
                  name="username"
                  required
                  autoComplete="username"
                  className="rounded border border-ink/12 px-3 py-3 font-normal outline-none transition focus:border-palm"
                  placeholder="Ví dụ: thuvien01"
                />
              </label>

              <PasswordField
                name="password"
                label="Mật khẩu"
                minLength={6}
                autoComplete="new-password"
                placeholder="Tối thiểu 6 ký tự"
                className="mt-4 grid gap-2 text-sm font-semibold text-ink"
              />

              <button
                type="submit"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
              >
                <UserPlus className="h-4 w-4" aria-hidden="true" />
                Thêm tài khoản quản lý tài liệu
              </button>
            </form>
          ) : null}
        </div>

        <div className="rounded border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded bg-river text-white">
              <Users className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-ink">Danh sách tài khoản</h2>
              <p className="mt-1 text-sm text-ink/55">{result.users.length} tài khoản đang lưu trên Supabase.</p>
            </div>
          </div>

          {canManageAccounts ? (
            result.users.length > 0 ? (
              <div className="mt-6 space-y-4">
                {result.users.map((user) => (
                  <article key={user.id} className="rounded border border-ink/10 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 place-items-center rounded bg-paper text-palm">
                          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div>
                          <h3 className="font-semibold text-ink">{user.username}</h3>
                          <p className="mt-1 text-xs text-ink/55">
                            {adminRoleLabel(user.role)} · Cập nhật: {new Date(user.updatedAt).toLocaleString("vi-VN")}
                          </p>
                        </div>
                      </div>

                      {currentAdmin?.userId !== user.id ? (
                        <form action={deleteAdminUserAction.bind(null, user.id)}>
                          <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded border border-lacquer/20 px-3 py-2 text-sm font-semibold text-lacquer transition hover:bg-lacquer/8"
                          >
                            <Trash2 className="h-4 w-4" aria-hidden="true" />
                            Xóa
                          </button>
                        </form>
                      ) : (
                        <span className="rounded bg-paper px-3 py-2 text-sm font-semibold text-ink/55">
                          Đang đăng nhập
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="mt-6 rounded border border-dashed border-ink/18 bg-paper p-5 text-sm leading-6 text-ink/62">
                Chưa có tài khoản nào trong bảng admin_users. Tài khoản gốc trong biến môi trường vẫn có thể đăng nhập để tạo tài khoản đầu tiên.
              </div>
            )
          ) : (
            <div className="mt-6 rounded border border-dashed border-ink/18 bg-paper p-5 text-sm leading-6 text-ink/62">
              Tài khoản của bạn chỉ có quyền quản lý tài liệu, không có quyền tạo hoặc xóa tài khoản khác.
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
