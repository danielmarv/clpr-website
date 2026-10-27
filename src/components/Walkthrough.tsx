import { MessageJourney } from "@/components/MessageJourney";
import { SectionHeading } from "@/components/SectionHeading";
import { walkthrough } from "@/content/site";

export function Walkthrough() {
  return (
    <section aria-labelledby={walkthrough.id} className="shell py-20 lg:py-28">
      <SectionHeading id={walkthrough.id} eyebrow={walkthrough.eyebrow} title={walkthrough.title} lead={walkthrough.lead} split />

      <div data-motion-reveal className="relative mt-14 lg:mt-20">
        {/* Glow beneath the stage. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-10 -top-16 bottom-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_50%_10%,rgb(108_55_235/0.2),transparent_70%)]"
        />
        <div className="panel relative min-w-0 p-5 sm:p-8 lg:p-10">
          <MessageJourney />
        </div>
      </div>
    </section>
  );
}
