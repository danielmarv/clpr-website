import type { Metadata } from "next";

import { BlogLead } from "@/components/BlogLead";
import { BlogPostList } from "@/components/BlogPostList";
import { PageIntro, PageShell } from "@/components/PageShell";
import { blog } from "@/content/site";
import { getAllPosts, getBlogIndexMeta } from "@/lib/posts";

export const metadata: Metadata = { title: "Blog", description: blog.description };

// The structure of hiero.org/blog: the header, the newest post at size, then the archive as a grid.
export default function BlogPage() {
  const meta = getBlogIndexMeta();
  // getAllPosts is newest first, so the lead is the head of the list and the archive the rest.
  const [lead, ...archive] = getAllPosts();

  return (
    <PageShell>
      <PageIntro kicker={blog.kicker} title={meta.title} lead={meta.subtitle} />
      {lead && <BlogLead post={lead} />}
      {archive.length > 0 && <BlogPostList posts={archive} listTitle={meta.listTitle} />}
    </PageShell>
  );
}
