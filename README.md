# Technical Blog (`amrabed/blog`)

This repository serves as the central Git-backed content hub and single source of truth for technical writing by [Amr Abed](https://amrabed.com).

It powers two core functions:

1. **Static Blog Website**: Built with [Next.js 16](https://nextjs.org), [HeroUI 3](https://heroui.com), Tailwind CSS 4, and TypeScript. Deployable to GitHub Pages ([**amrabed.com/blog**](https://amrabed.com/blog)) or Vercel, designed with minimal code to visually match the main personal portfolio ([amrabed.com](https://amrabed.com)).
2. **Multi-Platform Publishing Engine**: Cross-posts and synchronizes articles to **[Dev.to](https://dev.to)** and **[Hashnode](https://hashnode.com)** while enforcing canonical URLs.

---

## 📁 Repository Structure

```text
.
├── .github/workflows/
│   ├── deploy.yml           # Deploys Next.js static export (out/) to GitHub Pages
│   ├── publish.yml          # Cross-posting workflow for Dev.to and Hashnode
│   └── verify.yml           # Verification workflow (next build + publish dry-run)
├── posts/
│   ├── <slug>/
│   │   ├── index.md         # Article markdown with YAML frontmatter
│   │   ├── cover.png        # Hero / cover image
│   │   └── images/          # Embedded screenshots, diagrams, and media
├── public/
│   └── posts/               # Symlink to posts/ for static media serving
├── scripts/
│   └── publisher.ts         # TypeScript multi-platform publisher (Dev.to, Hashnode, Medium)
├── src/
│   ├── app/
│   │   ├── [slug]/
│   │   │   └── page.tsx     # Dynamic article detail page with ReactMarkdown & HeroUI
│   │   ├── globals.css      # Tailwind 4 & HeroUI base stylesheet
│   │   ├── layout.tsx       # Root layout with Inter font, HeroUI providers, and GA
│   │   ├── page.tsx         # Blog post listing index using HeroUI Card & Chip
│   │   ├── providers.tsx    # Theme provider wrapper
│   │   └── rss.xml/
│   │       └── route.ts     # RSS 2.0 feed route handler
│   ├── components/
│   │   ├── footer.tsx       # HeroUI Footer matching amrabed.com with social links
│   │   ├── header.tsx       # Minimalist header with HeroUI buttons & theme switch
│   │   └── theme-toggle.tsx # HeroUI Switch dark/light mode toggle
│   ├── contexts/
│   │   └── theme.tsx        # React ThemeContext with localStorage persistence
│   └── lib/
│       └── posts.ts         # Markdown posts loader utility using gray-matter
├── next.config.mjs          # Next.js config (output: export, basePath: /blog)
├── postcss.config.mjs       # PostCSS config with @tailwindcss/postcss
├── package.json             # Next.js 16, React 19, HeroUI 3, Tailwind 4 dependencies
├── .mise.toml               # Task runner & local tool manager (Node 25 + pnpm)
└── README.md
```

---

## 📝 Frontmatter Schema

Each article lives in `posts/<slug>/index.md` and begins with YAML frontmatter:

```yaml
---
title: "Article Title"
description: "Brief summary or subtitle for social cards and SEO."
slug: "article-slug"
date: "YYYY-MM-DD"
cover_image: "./cover.png"
canonical_url: "https://amrabed.medium.com/..." # Source URL
tags:
  - python
  - aws
  - serverless
platforms:
  devto:
    published: false # Set to true to make live, or false for draft
    id: null # Automatically populated after initial sync
    url: null # Automatically populated after initial sync
  hashnode:
    published: false # Set to true to make live, or false for draft
    id: null # Automatically populated after initial sync
    url: null # Automatically populated after initial sync
  medium:
    published: false # Set to true to make live, or false for draft
    id: null # Automatically populated after initial sync
    url: null # Automatically populated after initial sync
---
```

---

## 🚀 Workflows & Commands

We use [mise](https://mise.jdx.dev) and [pnpm](https://pnpm.io) for local tooling and task execution. One-letter task and Git shell aliases are automatically active in your shell:

#### Task Aliases

| Alias | Command            | Description                                       |
| :---: | :----------------- | :------------------------------------------------ |
|  `i`  | `mise run install` | Install dependencies with pnpm                    |
|  `d`  | `mise run dev`     | Start Next.js development server                  |
|  `b`  | `mise run build`   | Build static export into `out/`                   |
|  `s`  | `mise run start`   | Preview static export at `http://localhost:3000/` |
|  `t`  | `mise run test`    | Dry-run publish verification                      |
|  `v`  | `mise run verify`  | Run all checks (build + publish dry-run)          |
|  `p`  | `mise run publish` | Publish or sync posts                             |
|  `m`  | `mise run`         | Quick prefix to run any mise task                 |

#### Git Aliases

| Alias | Command        | Alias | Command      |
| :---: | :------------- | :---: | :----------- |
|  `g`  | `git`          | `gd`  | `git diff`   |
| `gs`  | `git status`   | `gl`  | `git log`    |
| `ga`  | `git add`      | `gp`  | `git push`   |
| `gc`  | `git commit`   | `gpl` | `git pull`   |
| `gb`  | `git branch`   | `gr`  | `git rebase` |
| `gco` | `git checkout` |       |              |

### 1. Start Local Development Server

```bash
d              # or: mise run dev / mise run d
```

Opens the blog locally at `http://localhost:3000/`.

### 2. Build Static Site

```bash
b              # or: mise run build / mise run b
```

Runs `next build` and statically exports the site into `out/`.

### 3. Preview Static Site Locally

```bash
s              # or: mise run start / mise run s / pnpm start
```

Starts local static server for `out/` at `http://localhost:3000/`.

### 4. Verify Checks (Build + Dry-Run)

```bash
v              # or: mise run verify / mise run v
```

### 5. Dry-Run & Test Publishing

Simulates cross-posting without modifying remote platforms:

```bash
t              # or: mise run test / mise run publish:dry
# Or test a specific post:
pnpm tsx scripts/publisher.ts --post aws-lambda-templates --dry-run
```

### 6. Publish / Sync Posts

By default, the publisher targets **Dev.to** in **draft** mode (`--draft` is default) to allow inspection before going live.

```bash
# Sync all posts to Dev.to as drafts (default)
p              # or: mise run publish

# Publish specific post live to Dev.to (public)
p --post aws-lambda-templates --publish

# Publish to both Dev.to and Hashnode (requires Hashnode Pro)
p --target all
```

---

## 🔑 Platform Secrets Configuration

To enable automated synchronization from GitHub Actions or local CLI, configure these credentials:

| Secret Name               | Platform | Description                  | Where to Obtain                                                                                                 |
| :------------------------ | :------- | :--------------------------- | :-------------------------------------------------------------------------------------------------------------- |
| `DEVTO_API_KEY`           | Dev.to   | API Key for Dev.to REST API  | Dev.to $\rightarrow$ **Settings** $\rightarrow$ **Extensions** $\rightarrow$ **DEV Community API Keys**         |
| `HASHNODE_TOKEN`          | Hashnode | Personal Access Token        | Hashnode $\rightarrow$ **Account Settings** $\rightarrow$ **Developer** $\rightarrow$ **Personal Access Token** |
| `HASHNODE_PUBLICATION_ID` | Hashnode | 24-char Publication ObjectId | Hashnode Dashboard URL (`hashnode.com/<id>/dashboard`)                                                          |

Add these keys to:

- **GitHub Repository Secrets**: `Settings` $\rightarrow$ `Secrets and variables` $\rightarrow$ `Actions`.
- **Local Environment** (optional, for CLI testing): Export in your local shell or `.env`.

---

## 🌐 SEO & Canonical URLs

- Every post specifies a `canonical_url` in its frontmatter.
- When cross-posting previously published Medium articles, `canonical_url` points to the original Medium article URL. This preserves search engine ranking equity and prevents duplicate-content penalties.
- For new original posts authored in this repository, canonical URLs point to `https://amrabed.com/blog/<slug>`.
