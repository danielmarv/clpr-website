import { cn } from "@/lib/utils";

/**
 * Section heading in the linear.app manner: a quiet eyebrow, a large headline
 * in fading white, and the lead either below it or beside it (`split`).
 *
 * `illustrated` keeps the right-hand side free (above the heading on phones):
 * the WebGL background draws the section's illustration into that slot.
 */
export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  split = false,
  illustrated = false,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  split?: boolean;
  illustrated?: boolean;
  className?: string;
}) {
  const heading = (
    <>
      {eyebrow && (
        <p className="mb-5 inline-flex items-center gap-2.5 text-[0.8125rem] font-medium text-muted-foreground">
          <span className="h-px w-6 bg-linear-to-r from-signal-glow to-proof-glow" aria-hidden="true" />
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className="text-headline text-[clamp(2.1rem,4.6vw,3.5rem)] font-medium leading-[1.06] tracking-[-0.035em] text-balance"
      >
        {title}
      </h2>
    </>
  );

  if (illustrated) {
    return (
      <div data-motion-reveal className={cn("grid lg:grid-cols-12 lg:items-center lg:gap-12", className)}>
        <div data-form-slot aria-hidden="true" className="h-56 sm:h-72 lg:order-last lg:col-span-5 lg:h-[24rem]" />
        <div className="lg:col-span-7">
          {heading}
          {lead && <p className="mt-6 max-w-[56ch] text-[1.0625rem] leading-[1.7] text-muted-foreground">{lead}</p>}
        </div>
      </div>
    );
  }

  return (
    <div
      data-motion-reveal
      className={cn(
        split ? "grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12" : "max-w-3xl",
        className,
      )}
    >
      <div className={cn(split && "lg:col-span-7")}>{heading}</div>
      {lead && (
        <p
          className={cn(
            "max-w-[60ch] text-[1.0625rem] leading-[1.7] text-muted-foreground",
            split ? "lg:col-span-5 lg:pb-1.5" : "mt-6",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
