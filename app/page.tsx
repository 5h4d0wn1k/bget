import Hero from "@/components/home/Hero";
import Ledger from "@/components/home/Ledger";
import Marquee from "@/components/home/Marquee";
import {
  ClosingCta,
  DisciplinesSection,
  LoopSection,
  NorthStarSection,
  ProblemsTeaser,
  VisionSection,
} from "@/components/home/Sections";

/**
 * BGET home — The Cover & The Ledger.
 * Inherits root metadata (default brand title); deliberately exports none.
 */
export default function HomePage() {
  return (
    <>
      <Hero />
      <Ledger />
      <Marquee />
      <VisionSection />
      <DisciplinesSection />
      <LoopSection />
      <ProblemsTeaser />
      <NorthStarSection />
      <ClosingCta />
    </>
  );
}