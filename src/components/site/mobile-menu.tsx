"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/site";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

type MenuProfile = { handle: string; name: string } | null;

export function MobileMenu({ profile }: { profile: MenuProfile }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-ink hover:bg-secondary"
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <>
          <button
            aria-hidden
            tabIndex={-1}
            onClick={close}
            className="fixed inset-0 top-14 z-30 cursor-default bg-black/5"
          />
          <div className="fixed inset-x-0 top-14 z-40 border-b border-border bg-surface p-4 shadow-lg shadow-black/[0.04]">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={close}
                  className="rounded-lg px-3 py-2.5 text-[15px] text-ink hover:bg-secondary"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/gigs"
                onClick={close}
                className="rounded-lg px-3 py-2.5 text-[15px] text-ink hover:bg-secondary"
              >
                Gigs
              </Link>

              <div className="my-2 h-px bg-border" />

              {profile ? (
                <>
                  <Link
                    href={`/u/${profile.handle}`}
                    onClick={close}
                    className="rounded-lg px-3 py-2.5 text-[15px] text-ink hover:bg-secondary"
                  >
                    Your profile
                  </Link>
                  <Link
                    href="/settings/profile"
                    onClick={close}
                    className="rounded-lg px-3 py-2.5 text-[15px] text-ink hover:bg-secondary"
                  >
                    Edit profile
                  </Link>
                  <form action={signOut}>
                    <button
                      type="submit"
                      className="w-full rounded-lg px-3 py-2.5 text-left text-[15px] text-ink hover:bg-secondary"
                    >
                      Sign out
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={close}
                  className={cn(
                    "mt-1 inline-flex h-11 items-center justify-center rounded-[10px] bg-teal-600 px-4",
                    "text-[15px] font-medium text-white",
                  )}
                >
                  Sign in
                </Link>
              )}
            </nav>
          </div>
        </>
      )}
    </div>
  );
}
