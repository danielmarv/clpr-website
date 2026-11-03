import { cn } from "@/lib/utils";

export function SectionHeading({
  id,
  eyebrow,
  title,
  lead,
  split = false,
  className,
}: {
  id?: string;
  eyebrow?: string;
  title: string;
  lead?: string;
  split?: boolean;
  className?: string;
}) {
  return (
    <div
      data-motion-reveal
      className={cn(
        split ? "grid gap-6 lg:grid-cols-12 lg:items-end lg:gap-12" : "max-w-3xl",
        className,
      )}
    >
      <div className={cn(split && "lg:col-span-6")}>
        {eyebrow && (
          <p className="mb-4 font-mono text-[0.75rem] uppercase tracking-[0.12em] text-signal-ink">{eyebrow}</p>
        )}
        <h2
          id={id}
          className="text-headline text-[clamp(1.875rem,3.6vw,2.75rem)] font-normal leading-[1.12] tracking-[-0.03em] text-balance"
        >
          {title}
        </h2>
      </div>
      {lead && (
        <p
          className={cn(
            "max-w-[58ch] text-[1.0625rem] leading-[1.7] text-muted-foreground",
            split ? "lg:col-span-6 lg:pb-1" : "mt-5",
          )}
        >
          {lead}
        </p>
      )}
    </div>
  );
}
