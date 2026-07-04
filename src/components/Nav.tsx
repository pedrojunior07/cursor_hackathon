"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Mapa", icon: "map" },
  { href: "/abrigos", label: "Lista", icon: "list_alt" },
  { href: "/ussd", label: "USSD", icon: "dialpad" },
  { href: "/sms", label: "SMS", icon: "sms" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around border-t-2 border-outline-variant bg-surface px-2 py-2">
      {links.map((l) => {
        const activo = l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={`flex h-touch-target-min w-1/4 flex-col items-center justify-center transition-all ${
              activo
                ? "rounded-full bg-secondary-container px-4 py-1 text-on-secondary-container"
                : "text-on-surface-variant hover:bg-surface-container-high"
            }`}
          >
            <span
              className={`material-symbols-outlined text-[24px] ${activo ? "fill-icon" : ""}`}
            >
              {l.icon}
            </span>
            <span className={`text-label-lg font-sans ${activo ? "font-bold" : ""}`}>
              {l.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export function MvpBanner() {
  return (
    <div className="flex items-center justify-center gap-2 border-b-2 border-outline-variant bg-surface-container-high px-4 py-2 text-center text-label-lg text-on-surface-variant">
      <span className="material-symbols-outlined text-[16px]">info</span>
      <span>
        <strong>MVP — Dados simulados (Beira)</strong> · USSD{" "}
        <code className="rounded bg-surface-container-highest px-1">*384*7#</code> · SMS{" "}
        <code className="rounded bg-surface-container-highest px-1">3847</code>
      </span>
    </div>
  );
}
