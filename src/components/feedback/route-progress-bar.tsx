"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export function RouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const progressKey = `${pathname}?${searchParams.toString()}`;

  useEffect(() => {
    setActive(true);

    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setActive(false);
    }, 520);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [progressKey]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-1 overflow-hidden">
      <div
        className={`h-full bg-[linear-gradient(90deg,var(--color-accent),var(--color-primary),var(--color-accent))] shadow-[0_0_20px_rgba(34,199,214,0.55)] transition-all duration-500 ease-out ${active ? "w-full opacity-100" : "w-0 opacity-0"}`}
      />
    </div>
  );
}
