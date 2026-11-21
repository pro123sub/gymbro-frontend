import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F8FAFC] px-4 text-center text-slate-900">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm max-w-md w-full">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
          404 Error
        </span>
        <h2 className="mt-3 text-2xl font-extrabold text-slate-900">Page Not Found</h2>
        <p className="mt-2 text-xs text-slate-500">
          The requested page does not exist or has been moved.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-emerald-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition"
        >
          Return to Dashboard
        </Link>
      </div>
    </div>
  );
}

