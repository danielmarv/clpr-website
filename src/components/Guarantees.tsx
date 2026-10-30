import { PropertyArt } from "@/components/PropertyArt";
import { SectionHeading } from "@/components/SectionHeading";
import { guarantees } from "@/content/site";
import { cn } from "@/lib/utils";

// The ordered chain reads best wide, and the race against a bridge as a full-width timeline.
const WIDE = new Set<string>(["order"]);
const BANNER = new Set<string>(["speed"]);

export function Guarantees() {
  return (
    <section aria-labelledby={guarantees.id} className="band-light shell py-20 lg:py-28">
      <SectionHeading id={guarantees.id} eyebrow={guarantees.eyebrow} title={guarantees.title} lead={guarantees.lead} split />

      <ul className="mt-14 grid gap-3 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3">
        {guarantees.items.map((item) => {
          const visual = "visual" in item ? item.visual : undefined;
          const banner = visual !== undefined && BANNER.has(visual);
          return (
            <li
              key={item.name}
              data-motion-reveal
              data-spotlight
              className={cn(
                "flex flex-col overflow-hidden",
                visual
                  ? "theme-dark panel"
                  : "panel-light justify-between gap-10 p-6",
                visual && WIDE.has(visual) && "sm:col-span-2",
                banner && "sm:col-span-2 lg:col-span-3 lg:grid lg:grid-cols-3 lg:items-center",
              )}
            >
              {visual ? (
                <div
                  aria-hidden="true"
                  className={cn(
                    "relative h-52 bg-[radial-gradient(60%_70%_at_50%_50%,rgb(139_123_255/0.09),transparent_75%)] px-5 pt-5",
                    banner && "lg:order-2 lg:col-span-2 lg:h-56 lg:py-4 lg:pl-0",
                  )}
                >
                  <PropertyArt visual={visual} />
                </div>
              ) : (
                <span className="h-px w-6 bg-linear-to-r from-signal-glow to-proof-glow" aria-hidden="true" />
              )}
              <div className={cn(visual && "p-6 pt-4", banner && "lg:p-8")}>
                <h3 className="text-[1.0625rem] font-medium tracking-[-0.01em] text-foreground">{item.name}</h3>
                <p className="mt-2 max-w-[48ch] text-[0.9375rem] leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
