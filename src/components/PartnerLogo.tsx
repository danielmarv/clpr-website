import Image from "next/image";

import { origins } from "@/content/site";
import { cn } from "@/lib/utils";

/** A partner's mark in its own colours; in the dark theme, its version for dark backgrounds. */
export function PartnerLogo({ logo, alt = logo.name }: { logo: (typeof origins.logos)[number]; alt?: string }) {
  return (
    <>
      <Image src={logo.src} alt={alt} width={logo.width} height={logo.height} className={cn(logo.className, "dark:hidden")} />
      <Image src={logo.srcDark} alt={alt} width={logo.width} height={logo.height} className={cn(logo.className, "hidden dark:block")} />
    </>
  );
}
