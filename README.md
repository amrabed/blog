# Technical Blog (`amrabed/blog`)

This repository serves as the central Git-backed content hub and single source of truth for technical writing by [Amr Abed](https://github.com/amrabed). Articles written in Markdown are automatically published and synchronized to **[Dev.to](https://dev.to)** and **[Hashnode](https://hashnode.com)**.

---

## 📁 Repository Structure

```text
.
├── .github/workflows/
│   ├── publish.yml          # GitHub Actions publishing workflow (push & manual dispatch)
│   └── verify.yml           # Verification workflow running mise run verify
├── posts/
│   ├── <slug>/
│   │   ├── index.md         # Article markdown with YAML frontmatter
│   │   ├── cover.png        # Hero / cover image
│   │   └── images/          # Embedded screenshots, diagrams, and media
├── scripts/
│   └── publisher.ts         # Multi-platform publisher (Dev.to, Hashnode)
├── package.json             # Node dependencies and scripts
├── pnpm-lock.yaml           # Deterministic dependency lockfile
├── tsconfig.json            # TypeScript configuration
├── .mise.toml               # Task runner & local tool manager
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
canonical_url: "https://blog.amrabed.com/..." # Source URL
tags:
  - python
  - aws
  - serverless
platforms:
  devto:
    published: false # Set to true to make live, or false for draft
    id: null         # Automatically populated after initial sync
    url: null        # Automatically populated after initial sync
  hashnode:
    published: false # Set to true to make live, or false for draft
    id: null         # Automatically populated after initial sync
    url: null        # Automatically populated after initial sync
  medium:
    published: false # Set to true to make live, or false for draft
    id: null         # Automatically populated after initial sync
    url: null        # Automatically populated after initial sync
---
```


---

## 🚀 Workflows & Commands

We use [mise](https://mise.jdx.dev) and [pnpm](https://pnpm.io/) for local tooling and task execution.

### 1. Setup Environment
```bash
mise run dev   # or alias: mise run d
```

### 2. Verify Dry-Run
```bash
mise run verify # or alias: mise run v
```


### 3. Dry-Run & Verify Posts
Simulates publishing all posts without modifying remote platforms:
```bash
mise run t
# Or specify a single post:
mise run publish -- --post aws-lambda-templates --dry-run
```

### 4. Publish / Sync
```bash
# Sync as drafts to all platforms
mise run publish -- --draft

# Publish specific post live to Dev.to and Hashnode
mise run publish -- --post aws-lambda-templates --target all

# Publish to Dev.to only
mise run publish -- --post aws-lambda-templates --target devto
```

---

## 🔑 Platform Secrets Configuration

To enable automated synchronization from GitHub Actions or local CLI, configure these credentials:

| Secret Name | Platform | Description | Where to Obtain |
| :--- | :--- | :--- | :--- |
| `DEVTO_API_KEY` | Dev.to | API Key for Dev.to REST API | Dev.to $\rightarrow$ **Settings** $\rightarrow$ **Extensions** $\rightarrow$ **DEV Community API Keys** |
| `HASHNODE_TOKEN` | Hashnode | Personal Access Token | Hashnode $\rightarrow$ **Account Settings** $\rightarrow$ **Developer** $\rightarrow$ **Personal Access Token** |
| `HASHNODE_PUBLICATION_ID` | Hashnode | 24-char Publication ObjectId | Hashnode Dashboard URL (`hashnode.com/<id>/dashboard`) |

Add these keys to:
- **GitHub Repository Secrets**: `Settings` $\rightarrow$ `Secrets and variables` $\rightarrow$ `Actions`.
- **Local Environment** (optional, for CLI testing): Export in your local shell or `.env`.


---

## 🌐 SEO & Canonical URLs

- Every post specifies a `canonical_url` in its frontmatter.
- When cross-posting previously published Medium articles, `canonical_url` points to the original Medium article URL. This preserves search engine ranking equity and prevents duplicate-content penalties.
