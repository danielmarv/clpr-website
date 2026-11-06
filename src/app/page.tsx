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
import { getRepos } from "@/lib/github";

// The overview; the explainer under /plumbing/ carries the detail.
export default async function HomePage() {
  const repos = await getRepos();
  const stars = repos && Object.fromEntries(repos.map((repo) => [repo.name, repo.stars]));
  return (
    <SiteMotion>
      <ProtocolField />
      <SiteHeader />
      {/* Decorative glows may reach past the edge; clip (unlike hidden) keeps the pinned story working. */}
      <main id="main" className="relative z-10 overflow-x-clip">
        <Hero repos={repos} />
        <Story />
        <Comparison />
        <UseCases />
        <Extensibility />
        <Repositories stars={stars} />
        <GetInvolved />
      </main>
      <SiteFooter />
    </SiteMotion>
  );
}
