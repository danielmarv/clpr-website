# Writing blog posts

The blog at `/blog/` follows the structure of the Hiero website's blog
([hiero-ledger/hiero-website](https://github.com/hiero-ledger/hiero-website), `docs/blogs.md` there):
one Markdown file per post, TOML front matter, and the same fields.

## What belongs on the CLPR blog

Posts on `/blog/` are about the protocol, the code and the community around it: releases,
specification changes, contributor news, how-tos and write-ups of calls and events. CLPR is a lab of
LF Decentralized Trust, so its website does not promote commercial offerings or collect sales leads
(LFDT's website requirements for projects and labs). When a post mentions a company's own program, say
who runs it and link to it; the decision on what may appear rests with LFDT.

Every fact in a post needs a source. End the post with a `## Sources` list, and keep claims about the
protocol in line with the specification and the explainer under `/plumbing/`.

## How posts work in this repository

`src/lib/posts.ts` reads:

- every `.md` file directly inside `content/posts/`
- TOML front matter between `+++` lines
- a Markdown body (GitHub flavoured: tables, task lists, strikethrough)

`content/posts/_index.md` is not a post: it holds the blog page's `title`, `subtitle` and `list_title`.
Raw HTML in a post is skipped, and Hugo shortcodes (`{{< … >}}`) are removed.

## Step by step

### 1. Choose a file name

Create a file in `content/posts/` in kebab case, for example `content/posts/my-first-post.md`. Without
a `slug`, the file name is the address: `/blog/my-first-post/`.

### 2. Add the front matter

```toml
+++
title = "My First Post"
date = 2026-11-15
draft = false
featured_image = "/images/blog/my-first-post/cover.jpg"
categories = ["Blog"]
tags = ["Specification", "Community"]
duration = "4 min read"
abstract = "A short summary for the blog cards, the post's header and its metadata."
slug = "my-first-post"

[[authors]]
name = "Your Name"
title = "Committer"
organization = "CLPR"
link = "https://github.com/your-handle"
image = "/images/authors/your-name.png"
+++
```

Repeat the `[[authors]]` block for each author.

### 3. Write the body in Markdown

Use `##` and `###` for sections: a post with three or more of them gets a contents list beside it.
Quote someone as a block quote, with the attribution as its last line:

```md
> The words, exactly as they were said.
>
> — **Name**, Role at Organization
```

Link to the site's own pages with root paths (`/issues/`, `/governance/`, `/plumbing/`); links to
other sites open in a new tab.

### 4. Add the banner

Every post has a featured image, shown on the blog page, on the cards and beside the post's title. As
on hiero.org, it is a banner: the CLPR mark and wordmark on the brand's gradient, the post's title in
IBM Plex Mono, and "CLPR BLOG" at the foot. Render it with

```bash
node scripts/blog-image.mjs my-first-post
```

which writes `public/images/blog/my-first-post/cover.jpg` (1600 × 900, the title kept inside the middle
4:3 so every crop the blog uses shows it), and name it in the front matter:
`featured_image = "/images/blog/my-first-post/cover.jpg"`. Run the script again when the title changes.
Without a featured image, a post shows the default banner, `/images/blog/default.jpg`
(`node scripts/blog-image.mjs --default` renders it).

A post may use a photograph instead, when it is one you may publish: your own, the project's, or one
under a licence that allows it. Name its author in `image_credit` (and its source in
`image_credit_link`); the post shows the credit under the photo. Crop it to 16:9, about 1600 × 900 and
under 400 KB. Images in the body go in `public/images/blog/<post>/` too, for example
`![Diagram](/images/blog/my-first-post/diagram.png)`.

### 5. Preview

Run `pnpm dev` and open `http://localhost:3000/blog/` and `http://localhost:3000/blog/<slug>/`.
`draft = true` leaves the post out completely, from the list and from its own address.

### 6. Open a pull request

Run `pnpm lint` and `pnpm build`, and sign off every commit (`git commit -s`).

## Fields

| Field | Status | Notes |
| --- | --- | --- |
| `title` | Required | The page title and the card title. |
| `date` | Required | Orders the posts, newest first; posts of the same day go by slug. `2026-11-15` or `2026-11-15T09:30:00Z`. |
| `abstract` | Strongly recommended | The cards, the standfirst under the title and the page description. |
| `[[authors]]` with `name` | Recommended | The byline on the blog page and the author block beside the post. |
| `featured_image` | Recommended | The post's banner from `scripts/blog-image.mjs`; falls back to `/images/blog/default.jpg`. |
| `image_credit`, `image_credit_link` | For a photograph | Who took it and where it comes from, shown under it. |
| `slug` | Optional | Defaults to the file name without `.md`. |
| `duration` | Optional | Otherwise the reading time is counted from the body, at 200 words a minute. |
| `draft` | Optional | `true` leaves the post out. |
| `categories`, `tags` | Optional | Read with the post; not shown yet. |
| `description` | Optional | Used when there is no `abstract`. |

Each author takes `name`, and optionally `title`, `organization` (shown together as the affiliation),
`link` (makes the author clickable) and `image` (a square portrait).

## Before you open the pull request

- The file is in `content/posts/` and ends in `.md`.
- The front matter is between `+++` lines, with a title, a date and an abstract.
- Every fact has a source in the post's `## Sources` list.
- The banner is rendered and named in `featured_image`, and the post renders at `/blog/<slug>/` in the
  light and the dark theme.
