import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { BookOpenCheck, LockKeyhole, LogIn } from "lucide-react";

import {
  adminSessionCookie,
  createAdminSessionValue,
  isValidAdminLogin,
  safeAdminNextPath
} from "@/lib/admin-auth";

async function loginAction(formData: FormData) {
  "use server";

  const username = String(formData.get("username") || "");
  const password = String(formData.get("password") || "");
  const nextPath = safeAdminNextPath(String(formData.get("next") || "/admin"));

  if (!isValidAdminLogin(username, password)) {
    redirect(`/admin/login?error=1&next=${encodeURIComponent(nextPath)}`);
  }

  const cookieStore = await cookies();
  cookieStore.set(adminSessionCookie, await createAdminSessionValue(), {
    httpOnly: true,
    maxAge: 60 * 60 * 8,
    path: "/admin",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production"
  });

  redirect(nextPath);
}

export default async function AdminLoginPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const params = await searchParams;
  const nextPath = safeAdminNextPath(params.next);

  return (
    <main className="min-h-[calc(100vh-73px)] bg-paper">
      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-4 py-10 lg:grid-cols-[1fr_420px]">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2 rounded bg-palm/10 px-3 py-1 text-sm font-semibold text-palm">
            <BookOpenCheck className="h-4 w-4" aria-hidden="true" />
            Khu quản trị
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Đăng nhập quản trị tài liệu
          </h1>
          <p className="mt-4 text-base leading-7 text-ink/68">
            Dành cho cán bộ thư viện cập nhật tài liệu địa chí, báo chí địa phương và tệp PDF đọc online.
          </p>
        </div>

        <form action={loginAction} className="rounded border border-ink/10 bg-white p-6 shadow-soft">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded bg-palm text-white">
              <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-ink">Tài khoản quản trị</h2>
              <p className="mt-1 text-sm text-ink/55">Nhập thông tin đã được cấp.</p>
            </div>
          </div>

          {params.error ? (
            <div className="mt-5 rounded border border-lacquer/20 bg-lacquer/8 p-3 text-sm font-medium text-lacquer">
              Tài khoản hoặc mật khẩu chưa đúng.
            </div>
          ) : null}

          <input type="hidden" name="next" value={nextPath} />

          <label className="mt-6 grid gap-2 text-sm font-semibold text-ink">
            Tên đăng nhập
            <input
              name="username"
              autoComplete="username"
              className="rounded border border-ink/12 px-3 py-3 font-normal outline-none transition focus:border-palm"
              required
            />
          </label>

          <label className="mt-4 grid gap-2 text-sm font-semibold text-ink">
            Mật khẩu
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              className="rounded border border-ink/12 px-3 py-3 font-normal outline-none transition focus:border-palm"
              required
            />
          </label>

          <button
            type="submit"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded bg-palm px-4 py-3 text-sm font-semibold text-white transition hover:bg-palm/90"
          >
            <LogIn className="h-4 w-4" aria-hidden="true" />
            Đăng nhập
          </button>
        </form>
      </section>
    </main>
  );
}
