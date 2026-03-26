import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { Loader } from "@/components/loader";
import { HeroSection } from "@/components/sections/hero-section";
import { PerformanceSection } from "@/components/sections/performance-section";
import { PowerSection } from "@/components/sections/power-section";
import { AutofocusSection } from "@/components/sections/autofocus-section";
import { ExploreSection } from "@/components/sections/explore-section";
import { ExitControls } from "@/components/exit-controls";

// Three.js viewer must be client-side only
const ThreeViewer = dynamic(() => import("@/components/three-viewer"), {
  ssr: false,
});

export default function Home() {
  return (
    <>
      <Loader />
      <Header />

      <HeroSection />
      <PerformanceSection />
      <PowerSection />
      <AutofocusSection />
      <ExploreSection />

      <ExitControls />
      <ThreeViewer />
    </>
  );
}
