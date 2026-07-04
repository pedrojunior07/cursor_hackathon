import { MvpBanner, Nav } from "@/components/Nav";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { MapaEvacuacao } from "@/components/MapaEvacuacao";
import { bairros } from "@/data/beira";
import { nivelRiscoLabel } from "@/lib/evacuation";

export default async function PaginaMapa({
  searchParams,
}: {
  searchParams: Promise<{ abrigo?: string }>;
}) {
  const params = await searchParams;
  const bairroCritico = bairros.find((b) => b.nivelRisco === "critico");

  return (
    <div className="flex min-h-dvh flex-col pb-24 pt-touch-target-min">
      <TopAppBar />
      <MvpBanner />
      {bairroCritico && (
        <div className="mx-gutter-mobile mt-4 animate-pulse border-2 border-on-error-container bg-error p-4 text-on-error">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined fill-icon text-[24px]">priority_high</span>
            <div>
              <h2 className="text-headline-md font-sans leading-tight">ALERTA CRÍTICO</h2>
              <p className="text-body-md font-sans opacity-90">
                Bairro {bairroCritico.nome}: {nivelRiscoLabel(bairroCritico.nivelRisco)}.
              </p>
            </div>
          </div>
        </div>
      )}
      <main className="flex flex-1 flex-col">
        <MapaEvacuacao abrigoAlvoId={params.abrigo} />
      </main>
      <Nav />
    </div>
  );
}
