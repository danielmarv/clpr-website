import { ChannelDemo } from "@/components/ChannelDemo";
import { SectionHeading } from "@/components/SectionHeading";
import { walkthrough } from "@/content/site";

export function Walkthrough() {
  return (
    <section aria-labelledby={walkthrough.id} data-form="route" className="shell py-20 lg:py-28">
      <SectionHeading
        id={walkthrough.id}
        eyebrow={walkthrough.eyebrow}
        title={walkthrough.title}
        lead={walkthrough.lead}
        illustrated
      />

      <div data-motion-reveal className="relative mt-14 lg:mt-20">
        {/* Glow beneath the stage. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-x-10 -top-16 bottom-0 -z-10 bg-[radial-gradient(ellipse_50%_40%_at_50%_0%,rgb(108_55_235/0.22),transparent_70%)]"
        />
        <div className="relative min-w-0 rounded-[1.75rem] border border-white/9 bg-[linear-gradient(180deg,rgb(21_17_41/0.72),rgb(11_10_19/0.8))] backdrop-blur-xl p-4 shadow-[0_40px_120px_-40px_rgb(63_34_215/0.45),inset_0_1px_0_rgb(255_255_255/0.06)] sm:p-6 lg:p-8">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-12 -top-px h-px bg-linear-to-r from-transparent via-signal-glow/70 to-transparent"
          />
          <ChannelDemo />
        </div>
      </div>
    </section>
  );
}
