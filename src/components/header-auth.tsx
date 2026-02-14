"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/app/actions/auth";

type SessionUser = {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function HeaderAuth({ user }: { user: SessionUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  const displayName = user.name || user.email || "Account";

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className="gap-2"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="size-6 rounded-full" />
        ) : (
          <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
            {displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <span className="max-w-[120px] truncate text-muted-foreground md:max-w-[180px]">
          {displayName}
        </span>
      </Button>
      {open && (
        <div
          className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-md border bg-background py-1 shadow-lg"
          role="menu"
        >
          <Link
            href="/account/bookmarks"
            className="block px-3 py-2 text-sm hover:bg-muted"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            My bookmarks
          </Link>
          <Link
            href="/account/played"
            className="block px-3 py-2 text-sm hover:bg-muted"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            My played
          </Link>
          <Link
            href="/account/favorites"
            className="block px-3 py-2 text-sm hover:bg-muted"
            role="menuitem"
            onClick={() => setOpen(false)}
          >
            My favorites
          </Link>
          <hr className="my-1 border-border" />
          <form action={signOutAction} className="block">
            <button
              type="submit"
              className="w-full px-3 py-2 text-left text-sm hover:bg-muted"
              role="menuitem"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export function HeaderAuthLinks() {
  return (
    <div className="flex items-center gap-3">
      <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
        Log in
      </Link>
      <Button asChild size="sm">
        <Link href="/signup">Sign up</Link>
      </Button>
    </div>
  );
}
