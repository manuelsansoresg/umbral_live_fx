"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigation } from "@/config/navigation";

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navegación principal" className="flex flex-wrap gap-2 lg:flex-col">
      {navigation.map(({ href, label }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`border-l-2 px-4 py-3 text-sm ${
              active
                ? "border-brand bg-white/5 text-foreground"
                : "border-transparent text-white/65 hover:bg-white/5 hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
