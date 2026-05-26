import { LoaderCircle } from "lucide-react";

export default function AdminDocumentsLoading() {
  return (
    <main className="mx-auto grid min-h-[50vh] w-full max-w-3xl place-items-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 rounded border border-ink/10 bg-white px-4 py-3 text-sm font-semibold text-ink/68 shadow-sm">
        <LoaderCircle className="h-4 w-4 animate-spin text-palm" aria-hidden="true" />
        Đang tải khu quản trị
      </div>
    </main>
  );
}
