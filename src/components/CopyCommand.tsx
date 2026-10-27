"use client";

import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";

export function CopyCommand({
  command,
  label,
  copyLabel,
  copiedLabel,
  className,
}: {
  command: string;
  label: string;
  copyLabel: string;
  copiedLabel: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
    } catch {
      // Clipboard access can be blocked; the command stays selectable.
    }
  };

  return (
    <div className={cn("rounded-lg border border-white/10 bg-black/30", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
        <p className="truncate text-[0.75rem] text-white/55">{label}</p>
        <button
          type="button"
          onClick={copy}
          className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[0.75rem] text-white/75 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="size-3.5 text-proof-glow" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
          {/* On phones the icon alone; the label stays for screen readers. */}
          <span aria-live="polite" className="max-sm:sr-only">
            {copied ? copiedLabel : copyLabel}
          </span>
        </button>
      </div>
      <pre className="whitespace-pre-wrap break-all px-4 py-3.5 font-mono text-[0.82rem] leading-relaxed text-white">
        <code>
          <span className="select-none text-signal-glow">$ </span>
          {command}
        </code>
      </pre>
    </div>
  );
}
