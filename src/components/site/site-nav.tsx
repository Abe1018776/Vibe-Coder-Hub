import Link from "next/link";
import { getCurrentProfile } from "@/lib/current-user";
import { Logo } from "./logo";
import { NavLinks } from "./nav-links";
import { UserMenu } from "./user-menu";
import { MobileMenu } from "./mobile-menu";

export async function SiteNav() {
  const profile = await getCurrentProfile();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas/85 backdrop-blur supports-[backdrop-filter]:bg-canvas/75">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-4 px-4 md:px-6">
        <Logo />
        <NavLinks />
        <div className="flex items-center gap-2">
          {profile ? (
            <div className="hidden md:block">
              <UserMenu
                profile={{
                  handle: profile.handle,
                  name: profile.name,
                  avatar_url: profile.avatar_url,
                }}
              />
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden h-9 items-center rounded-[10px] bg-teal-600 px-4 text-sm font-medium text-white transition-transform active:scale-[0.98] md:inline-flex"
            >
              Sign in
            </Link>
          )}
          <MobileMenu
            profile={profile ? { handle: profile.handle, name: profile.name } : null}
          />
        </div>
      </div>
    </header>
  );
}
