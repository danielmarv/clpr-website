import { Comparison } from "@/components/Comparison";
import { Extensibility } from "@/components/Extensibility";
import { GetInvolved } from "@/components/GetInvolved";
import { Hero } from "@/components/Hero";
import { ProtocolField } from "@/components/ProtocolField";
import { Repositories } from "@/components/Repositories";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteMotion } from "@/components/SiteMotion";
import { Story } from "@/components/Story";
import { UseCases } from "@/components/UseCases";

// The overview; the explainer under /plumbing/ carries the detail.
export default function HomePage() {
  return (
    <SiteMotion>
      <ProtocolField />
      <SiteHeader />
      {/* Decorative glows may reach past the edge; clip (unlike hidden) keeps the pinned story working. */}
      <main id="main" className="relative z-10 overflow-x-clip">
        <Hero />
        <Story />
        <Comparison />
        <UseCases />
        <Extensibility />
        <Repositories />
        <GetInvolved />
      </main>
      <SiteFooter />
    </SiteMotion>
  );
}
