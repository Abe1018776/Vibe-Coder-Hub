"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Sticky translucent header.
 * - Gains a hairline border once the page scrolls past the top.
 * - Hides on scroll-down and reappears on scroll-up (app-style), always visible
 *   near the very top. Wraps the (server-rendered) nav contents.
 */
export function NavShell({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    lastY.current = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      const delta = y - lastY.current;
      if (y < 72) {
        setHidden(false); // always show near the top
      } else if (delta > 6) {
        setHidden(true); // scrolling down — tuck away
      } else if (delta < -6) {
        setHidden(false); // scrolling up — bring back
      }
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur",
        "transition-[transform,background-color,border-color] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]",
        "bg-canvas/80 supports-[backdrop-filter]:bg-canvas/70",
        scrolled ? "border-border" : "border-transparent",
        hidden ? "-translate-y-full" : "translate-y-0",
      )}
    >
      {children}
    </header>
  );
}
