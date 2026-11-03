import Image from "next/image";

import { blog } from "@/content/site";
import type { PostMeta } from "@/lib/posts";
import { cn, format } from "@/lib/utils";

/** The front matter's duration, or the time counted from the body. */
export function readingTime(post: PostMeta): string {
  return post.duration ?? format(blog.readingTime, { minutes: post.readingMinutes });
}

/**
 * A post's featured image, filling the box the caller sizes (the default photo when the front matter
 * names none). Inside a `group` link it eases forward on hover.
 */
export function PostImage({
  post,
  sizes,
  priority = false,
  className,
}: {
  post: PostMeta;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("relative block overflow-hidden bg-fg/5", className)}>
      <Image
        src={post.featuredImage}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
      />
    </span>
  );
}

export function PostTags({ tags, className }: { tags: string[]; className?: string }) {
  if (!tags.length) return null;
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {tags.map((tag) => (
        <li key={tag} className="rounded-full border border-fg/10 bg-fg/[0.03] px-2.5 py-0.5 text-[0.75rem] text-fg/65">
          {tag}
        </li>
      ))}
    </ul>
  );
}
