import { MvpBanner, Nav } from "@/components/Nav";
import { TopAppBar } from "@/components/ui/TopAppBar";
import { SimuladorSms } from "@/components/SimuladorSms";

export default function PaginaSms() {
  return (
    <div className="min-h-dvh pb-24 pt-touch-target-min">
      <TopAppBar />
      <MvpBanner />
      <div className="px-gutter-mobile pt-stack-md">
        <h2 className="text-headline-md font-sans text-on-surface">Simulador SMS</h2>
        <p className="text-body-md font-sans text-on-surface-variant">
          Encaminhador de rotas sem GPS
        </p>
      </div>
      <SimuladorSms />
      <Nav />
    </div>
  );
}
