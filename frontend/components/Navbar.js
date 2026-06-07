"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/#dishes", label: "The Wazwan" },
  { href: "/#restaurants", label: "Restaurants" },
  { href: "/#tips", label: "Guide" },
  { href: "/restaurants", label: "Plan Visit" }
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[var(--border)] bg-[rgba(250,246,238,0.92)] text-[var(--walnut)] backdrop-blur">
      <div className="page-shell flex items-center justify-between gap-4 py-4">
        <Link
          href="/"
          className="font-accent text-2xl font-light uppercase leading-[0.9] tracking-[0.12em] text-black"
        >
          <span className="block">Wazwan</span>
          <span className="block">Way</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-[0.83rem] font-medium uppercase tracking-[0.08em] ${
                pathname === item.href
                  ? "text-[var(--crimson)]"
                  : "text-[var(--walnut-mid)] hover:text-[var(--crimson)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden text-sm text-[var(--muted)] sm:inline">
                {user.name}
              </span>
              <button
                type="button"
                onClick={logout}
                className="rounded-md border border-[var(--border)] px-4 py-2 text-sm text-[var(--walnut)] transition hover:bg-[var(--cream-dark)]"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-[var(--walnut-mid)] hover:text-[var(--crimson)]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-[var(--crimson)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--crimson-light)]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="page-shell overflow-x-auto pb-4 md:hidden">
        <nav className="flex min-w-max items-center gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-2 text-sm ${
                pathname === item.href
                  ? "bg-[var(--crimson)] text-white"
                  : "text-[var(--walnut-mid)]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
