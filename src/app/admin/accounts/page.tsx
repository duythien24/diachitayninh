import { KeyRound, ShieldCheck, Trash2, UserPlus, Users } from "lucide-react";

import {
  changeAdminPasswordAction,
  createAdminUserAction,
  deleteAdminUserAction
} from "@/app/admin/accounts/actions";
import { PageShell, SectionHeader } from "@/components/page-shell";
import { getAdminUsers } from "@/lib/admin-users";

function statusMessage(status?: string) {
  if (status === "created") return "Đã tạo tài khoản quản trị.";
  if (status === "password-updated") return "Đã đổi mật khẩu.";
  if (status === "deleted") return "Đã xóa tài khoản.";
  if (status === "missing-env") return "Chưa cấu hình Supabase service role nên chưa thể lưu tài khoản.";
  return null;
}

export default async function AdminAccountsPage({
  searchParams
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const [params, result] = await Promise.all([searchParams, getAdminUsers()]);
  const message = statusMessage(params.status);

  return (
    <PageShell>
      <SectionHeader
        eyebrow="Quản trị"
        title="Tài khoản và mật khẩu"
        description="Tạo tài khoản quản trị, đổi mật khẩu hoặc xóa tài khoản không còn sử dụng."
      />

      {message ? (
        <div className="mt-6 rounded border border-palm/20 bg-palm/8 p-4 text-sm font-medium text-palm">
          {message}
        </div>
      ) : null}

      {result.error ? (
        <div className="mt-6 rounded border border-lacquer/20 bg-lacquer/8 p-4 text-sm leading-6 text-lacquer">
          Chưa đọc được bảng tài khoản quản trị: {result.error}. Hãy chạy file SQL tạo bảng admin_users trong Supabase.
        </div>
      ) : null}

      <section className="mt-8 grid gap-6 lg:grid-cols-[420px_1fr]">
        <form action={createAdminUserAction} className="rounded border border-ink/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded bg-palm text-white">
              <UserPlus className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-ink">Tạo tài khoản</h2>
              <p className="mt-1 text-sm text-ink/55">Dùng cho cán bộ được phân quyền quản trị.</p>
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

          <label className="mt-4 grid gap-2 text-sm font-semibold text-ink">
            Mật khẩu
            <input
              name="password"
              required
              minLength={6}
              type="password"
              autoComplete="new-password"
              className="rounded border border-ink/12 px-3 py-3 font-normal outline-none transition focus:border-palm"
              placeholder="Tối thiểu 6 ký tự"
            />
          </label>

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
          >
            <UserPlus className="h-4 w-4" aria-hidden="true" />
            Thêm tài khoản
          </button>
        </form>

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

          {result.users.length > 0 ? (
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
                          Cập nhật: {new Date(user.updatedAt).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    </div>

                    <form action={deleteAdminUserAction.bind(null, user.id)}>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded border border-lacquer/20 px-3 py-2 text-sm font-semibold text-lacquer transition hover:bg-lacquer/8"
                      >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                        Xóa
                      </button>
                    </form>
                  </div>

                  <form action={changeAdminPasswordAction.bind(null, user.id)} className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <label className="min-w-0 flex-1">
                      <span className="sr-only">Mật khẩu mới cho {user.username}</span>
                      <input
                        name="new_password"
                        type="password"
                        minLength={6}
                        required
                        autoComplete="new-password"
                        className="w-full rounded border border-ink/12 px-3 py-2.5 text-sm outline-none transition focus:border-palm"
                        placeholder="Nhập mật khẩu mới"
                      />
                    </label>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded border border-ink/12 px-3 py-2.5 text-sm font-semibold text-ink transition hover:bg-paper"
                    >
                      <KeyRound className="h-4 w-4" aria-hidden="true" />
                      Đổi mật khẩu
                    </button>
                  </form>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded border border-dashed border-ink/18 bg-paper p-5 text-sm leading-6 text-ink/62">
              Chưa có tài khoản nào trong bảng admin_users. Tài khoản trong biến môi trường vẫn có thể đăng nhập để tạo tài khoản đầu tiên; sau khi tạo, mỗi tài khoản sẽ có nút Xóa và Đổi mật khẩu.
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
