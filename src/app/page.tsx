import { Comparison } from "@/components/Comparison";
import { Extensibility } from "@/components/Extensibility";
import { GetInvolved } from "@/components/GetInvolved";
import { Guarantees } from "@/components/Guarantees";
import { Glossary } from "@/components/Glossary";
import { Hero } from "@/components/Hero";
import { Layers } from "@/components/Layers";
import { ProtocolField } from "@/components/ProtocolField";
import { Repositories } from "@/components/Repositories";
import { Roadmap } from "@/components/Roadmap";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteMotion } from "@/components/SiteMotion";
import { Story } from "@/components/Story";
import { Walkthrough } from "@/components/Walkthrough";

export default function HomePage() {
  return (
    <SiteMotion>
      <ProtocolField />
      <SiteHeader />
      {/* Decorative glows may reach past the edge; clip (unlike hidden) keeps the pinned story working. */}
      <main id="main" className="relative z-10 overflow-x-clip">
        <Hero />
        <Story />
        <Guarantees />
        <Walkthrough />
        <Comparison />
        <Layers />
        <Extensibility />
        <Repositories />
        <Roadmap />
        <Glossary />
        <GetInvolved />
      </main>
      <SiteFooter />
    </SiteMotion>
  );
}
