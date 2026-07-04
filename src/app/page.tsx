import { MvpBanner, Nav } from "@/components/Nav";
import { MapaEvacuacao } from "@/components/MapaEvacuacao";

export default function PaginaMapa() {
  return (
    <div className="flex min-h-dvh flex-col pb-20">
      <header className="border-b border-slate-700 bg-slate-900 px-4 py-3">
        <h1 className="text-lg font-bold text-white">Rota Segura MZ</h1>
        <p className="text-xs text-slate-400">Mapa · Abrigos · Evacuação — Beira</p>
      </header>
      <MvpBanner />
      <main className="flex flex-1 flex-col">
        <MapaEvacuacao />
      </main>
      <Nav />
    </div>
  );
}
