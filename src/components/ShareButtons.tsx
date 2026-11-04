"use client";

import { useSyncExternalStore } from "react";
import { Mail } from "lucide-react";

import { blog } from "@/content/site";
import { format } from "@/lib/utils";

const noSubscription = () => () => {};

/**
 * Plain share links, as on hiero.org: no scripts from the networks and nothing tracked. The address is
 * the page's own, read in the browser, so it is right on any domain the site is served from.
 */
export function ShareButtons({ path, title }: { path: string; title: string }) {
  const origin = useSyncExternalStore(noSubscription, () => window.location.origin, () => "");
  const url = encodeURIComponent(`${origin}${path}`);
  const text = encodeURIComponent(title);
  const networks = [
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${text}`,
      icon: (
        <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
          <path d="M6.5 21.5h-5v-13h5v13zM4 6.5C2.5 6.5 1.5 5.3 1.5 4s1-2.4 2.5-2.4c1.6 0 2.5 1 2.6 2.5 0 1.4-1 2.5-2.6 2.5zm11.5 6c-1 0-2 1-2 2v7h-5v-13h5V10s1.6-1.5 4-1.5c3 0 5 2.2 5 6.3v6.7h-5v-7c0-1-1-2-2-2z" />
        </svg>
      ),
    },
    {
      name: "Telegram",
      href: `https://t.me/share/url?url=${url}&text=${text}`,
      icon: (
        <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
          <path d="M22.5.75L1.5 9.3c-.9.36-.89 1.64.02 1.98l5.3 2.02 2.03 6.4c.27.85 1.33 1.08 1.9.42l2.9-3.2 5.37 3.9c.7.5 1.7.12 1.9-.73l3.6-18.1c.2-.95-.7-1.7-1.6-1.24z" />
        </svg>
      ),
    },
    {
      name: "X",
      href: `https://x.com/intent/tweet?url=${url}&text=${text}`,
      icon: (
        <svg viewBox="0 0 32 32" className="size-4 fill-current" aria-hidden="true">
          <path d="M17.9686 14.1623L26.7065 4H24.6358L17.0488 12.8238L10.9891 4H4L13.1634 17.3432L4 28H6.07069L14.0827 18.6817L20.4822 28H27.4714L17.9681 14.1623H17.9686Z" />
        </svg>
      ),
    },
    { name: "Email", href: `mailto:?subject=${text}&body=${url}`, icon: <Mail className="size-4" aria-hidden="true" /> },
  ];

  return (
    <ul className="flex flex-wrap gap-2">
      {networks.map((network) => (
        <li key={network.name}>
          <a
            href={network.href}
            {...(network.name !== "Email" && { target: "_blank", rel: "noreferrer" })}
            aria-label={format(blog.shareOn, { network: network.name })}
            className="flex size-10 items-center justify-center rounded-full border border-fg/12 text-fg/65 transition-colors hover:border-fg hover:bg-fg hover:text-background"
          >
            {network.icon}
          </a>
        </li>
      ))}
    </ul>
  );
}
