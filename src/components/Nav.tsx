"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Mapa", icon: "🗺️" },
  { href: "/ussd", label: "USSD", icon: "📞" },
  { href: "/sms", label: "SMS", icon: "💬" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700 bg-slate-900/95 backdrop-blur safe-area-pb">
      <div className="mx-auto flex max-w-lg justify-around px-2 py-2">
        {links.map((l) => {
          const activo = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-4 py-2 text-xs transition ${
                activo
                  ? "bg-sky-600 text-white"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <span className="text-lg">{l.icon}</span>
              <span className="font-medium">{l.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function MvpBanner() {
  return (
    <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-200">
      <strong>MVP — Demonstração</strong> · Dados simulados (Beira) · USSD{" "}
      <code className="rounded bg-slate-800 px-1">*384*7#</code> · SMS{" "}
      <code className="rounded bg-slate-800 px-1">3847</code>
    </div>
  );
}
