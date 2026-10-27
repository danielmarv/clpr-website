import Link from "next/link";

import { ProtocolField } from "@/components/ProtocolField";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <ProtocolField />
      <SiteHeader />
      <main id="main" className="relative z-10">
        <div className="shell flex min-h-svh flex-col justify-center pb-24 pt-[48svh] lg:pt-32">
          <p className="font-mono text-[0.8125rem] text-signal-ink">404</p>
          <h1 className="text-headline mt-4 max-w-[13ch] text-[clamp(2.3rem,5vw,4rem)] font-light leading-[1.08] tracking-[-0.04em]">
            This page never made it across.
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg text-muted-foreground">
            The address may be mistyped, or the page may have moved. The home page links to everything on this site.
          </p>
          <Button asChild size="lg" className="mt-10 self-start">
            <Link href="/">Go to the home page</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
