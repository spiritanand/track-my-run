import TrackRuns from "@/app/TrackRuns";
import { AuroraBackground } from "@/components/ui/aurora-background";

export default function Home() {
  return (
    <main className="min-h-screen">
      <AuroraBackground>
        <h1 className="z-10 scroll-m-20 text-sm font-bold tracking-tight text-center text-white">
          TRACKMYRUN
        </h1>
        <TrackRuns />
      </AuroraBackground>
    </main>
  );
}
