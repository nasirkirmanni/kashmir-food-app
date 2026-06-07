import Link from "next/link";

export default function NotFound() {
  return (
    <div className="page-shell section-space text-center">
      <h1 className="font-display text-5xl text-pine">Lost on the food trail?</h1>
      <p className="mt-4 text-slate-600">
        The page you are looking for is not here, but Kashmir has plenty of better discoveries.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex rounded-full bg-pine px-5 py-3 text-sm font-semibold text-white"
      >
        Go home
      </Link>
    </div>
  );
}
