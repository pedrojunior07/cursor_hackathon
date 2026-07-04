"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type Props = {
  title?: string;
  /** Se definido, mostra seta "voltar" em vez do ícone de alerta */
  backHref?: string;
};

export function TopAppBar({ title = "ROTA SEGURA MZ", backHref }: Props) {
  const router = useRouter();

  return (
    <header className="fixed top-0 z-50 flex h-touch-target-min w-full items-center justify-between border-b-2 border-on-error-container bg-error px-gutter-mobile text-on-error">
      <div className="flex items-center gap-3">
        {backHref ? (
          <Link
            href={backHref}
            aria-label="Voltar"
            className="flex h-touch-target-min w-touch-target-min items-center justify-center rounded-full transition-transform hover:bg-on-error/10 active:scale-95"
            onClick={(e) => {
              if (window.history.length > 1) {
                e.preventDefault();
                router.back();
              }
            }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </Link>
        ) : (
          <span className="material-symbols-outlined text-[24px]">warning</span>
        )}
        <h1 className="font-sans text-headline-lg-mobile font-bold tracking-tight text-on-error">
          {title}
        </h1>
      </div>
      <button
        type="button"
        aria-label="Conta"
        className="flex h-touch-target-min w-touch-target-min items-center justify-center transition-transform hover:bg-on-error/10 active:scale-95"
      >
        <span className="material-symbols-outlined text-[24px]">account_circle</span>
      </button>
    </header>
  );
}
