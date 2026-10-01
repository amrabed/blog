#!/usr/bin/env python3
"""Cross-post and sync blog posts to Dev.to, Hashnode, and Medium.

Usage:
    python scripts/publisher.py [--post SLUG] [--target devto|hashnode|medium|all]
                                [--dry-run] [--draft]
"""

import argparse
import os
import re
import sys
from pathlib import Path
from typing import Any

import frontmatter
import requests

DEVTO_API_URL = "https://dev.to/api/articles"
HASHNODE_API_URL = "https://gql.hashnode.com"
MEDIUM_API_URL = "https://api.medium.com/v1"

# Tag normalization rules for Dev.to (max 4 tags, alphanumeric only)
DEVTO_TAG_MAP = {
    "artificial-intelligence": "ai",
    "machine-learning": "machinelearning",
    "amazon-bedrock": "aws",
    "aws-lambda": "serverless",
    "aws-certification": "aws",
    "cloud-computing": "cloud",
    "software-engineering": "programming",
    "time-management": "productivity",
    "smart-home": "iot",
    "home-assistant": "iot",
    "garage-door-opener": "iot",
    "mobile-app-development": "mobile",
    "tech-companies": "career",
    "servrless": "serverless",
}


def normalize_devto_tags(raw_tags: list[str]) -> list[str]:
    cleaned = []
    for tag in raw_tags:
        t = tag.lower().strip()
        mapped = DEVTO_TAG_MAP.get(t, t)
        # dev.to requires alphanumeric only (no hyphens/spaces/special chars)
        alphanumeric = re.sub(r"[^a-z0-9]", "", mapped)
        if alphanumeric and alphanumeric not in cleaned:
            cleaned.append(alphanumeric)
    return cleaned[:4]


def normalize_hashnode_tags(raw_tags: list[str]) -> list[dict[str, str]]:
    tags = []
    for tag in raw_tags:
        slug = re.sub(r"[^a-z0-9]+", "-", tag.lower()).strip("-")
        name = tag.replace("-", " ").title()
        if slug:
            tags.append({"slug": slug, "name": name})
    return tags[:5]


def normalize_medium_tags(raw_tags: list[str]) -> list[str]:
    tags = []
    for tag in raw_tags:
        clean = re.sub(r"[^a-zA-Z0-9\s-]", "", tag).strip()
        if clean and clean not in tags:
            tags.append(clean)
    return tags[:5]


def resolve_image_urls(
    markdown_content: str,
    post_slug: str,
    repo: str,
    branch: str,
    asset_base: str | None = None,
) -> tuple[str, str]:
    """Resolve relative image paths to absolute URLs; return (content, cover_url)."""
    base = (
        asset_base
        or f"https://raw.githubusercontent.com/{repo}/{branch}/posts/{post_slug}"
    )
    cover_url = f"{base}/cover.png"

    # Replace relative markdown images: ![alt](./image.png) or ![alt](image.png)
    def img_replacer(match):
        alt = match.group(1)
        rel_path = match.group(2).lstrip("./")
        abs_url = f"{base}/{rel_path}"
        return f"![{alt}]({abs_url})"

    resolved_content = re.sub(
        r"!\[(.*?)\]\(\.?/?(.*?)\)", img_replacer, markdown_content
    )
    return resolved_content, cover_url


def publish_to_devto(
    post: frontmatter.Post,
    slug: str,
    body_markdown: str,
    cover_url: str,
    api_key: str,
    draft: bool,
    dry_run: bool,
) -> dict[str, Any] | None:
    devto_meta = post.metadata.get("platforms", {}).get("devto", {})
    article_id = devto_meta.get("id")

    tags = normalize_devto_tags(post.metadata.get("tags", []))
    is_published = False if draft else devto_meta.get("published", False)

    payload = {
        "article": {
            "title": post.metadata.get("title", ""),
            "body_markdown": body_markdown,
            "published": is_published,
            "main_image": cover_url,
            "canonical_url": post.metadata.get("canonical_url", ""),
            "description": post.metadata.get("description", ""),
            "tags": tags,
        }
    }

    headers = {"api-key": api_key, "Content-Type": "application/json"}

    if dry_run:
        action = f"UPDATE article ID {article_id}" if article_id else "CREATE article"
        print(f"  [Dev.to DRY-RUN] Would {action}:")
        print(f"    Title: {payload['article']['title']}")
        print(f"    Tags: {payload['article']['tags']}")
        print(f"    Published: {payload['article']['published']}")
        print(f"    Canonical: {payload['article']['canonical_url']}")
        print(f"    Main Image: {payload['article']['main_image']}")
        return {"id": article_id or 999999, "url": "https://dev.to/preview/dry-run"}

    try:
        if article_id:
            url = f"{DEVTO_API_URL}/{article_id}"
            print(f"  [Dev.to] Updating article {article_id}...")
            resp = requests.put(url, json=payload, headers=headers, timeout=20)
        else:
            print("  [Dev.to] Creating new article...")
            resp = requests.post(
                DEVTO_API_URL, json=payload, headers=headers, timeout=20
            )

        if resp.status_code in (200, 201):
            data = resp.json()
            print(f"  [Dev.to SUCCESS] ID: {data.get('id')} | URL: {data.get('url')}")
            return data
        else:
            print(
                f"  [Dev.to ERROR] Status {resp.status_code}: {resp.text}",
                file=sys.stderr,
            )
    except Exception as e:
        print(f"  [Dev.to EXCEPTION] {e}", file=sys.stderr)

    return None


def publish_to_hashnode(
    post: frontmatter.Post,
    slug: str,
    body_markdown: str,
    cover_url: str,
    token: str,
    publication_id: str,
    draft: bool,
    dry_run: bool,
) -> dict[str, Any] | None:
    hashnode_meta = post.metadata.get("platforms", {}).get("hashnode", {})
    article_id = hashnode_meta.get("id")

    tags = normalize_hashnode_tags(post.metadata.get("tags", []))
    title = post.metadata.get("title", "")
    subtitle = post.metadata.get("description", "")
    canonical_url = post.metadata.get("canonical_url", "")

    if dry_run:
        action = f"UPDATE post ID {article_id}" if article_id else "PUBLISH post"
        print(f"  [Hashnode DRY-RUN] Would {action} to pub {publication_id}:")
        print(f"    Title: {title}")
        print(f"    Subtitle: {subtitle}")
        print(f"    Tags: {[t['name'] for t in tags]}")
        print(f"    Canonical URL: {canonical_url}")
        print(f"    Cover Image: {cover_url}")
        return {
            "id": article_id or "dry_run_id",
            "url": "https://blog.hashnode.dev/dry-run",
        }

    headers = {"Authorization": token, "Content-Type": "application/json"}

    if article_id:
        mutation = """
        mutation UpdatePost($input: UpdatePostInput!) {
            updatePost(input: $input) {
                post {
                    id
                    slug
                    url
                }
            }
        }
        """
        variables = {
            "input": {
                "id": article_id,
                "title": title,
                "subtitle": subtitle,
                "contentMarkdown": body_markdown,
                "coverImageOptions": {"coverImageURL": cover_url},
                "originalArticleURL": canonical_url,
                "tags": tags,
            }
        }
    else:
        mutation = """
        mutation PublishPost($input: PublishPostInput!) {
            publishPost(input: $input) {
                post {
                    id
                    slug
                    url
                }
            }
        }
        """
        variables = {
            "input": {
                "publicationId": publication_id,
                "title": title,
                "subtitle": subtitle,
                "contentMarkdown": body_markdown,
                "coverImageOptions": {"coverImageURL": cover_url},
                "originalArticleURL": canonical_url,
                "tags": tags,
            }
        }

    try:
        resp = requests.post(
            HASHNODE_API_URL,
            json={"query": mutation, "variables": variables},
            headers=headers,
            timeout=20,
        )
        data = resp.json()
        if "errors" in data:
            print(
                f"  [Hashnode ERROR] GraphQL errors: {data['errors']}",
                file=sys.stderr,
            )
            return None

        post_data = data.get("data", {}).get("publishPost", {}).get("post") or data.get(
            "data", {}
        ).get("updatePost", {}).get("post")
        if post_data:
            pid = post_data.get("id")
            purl = post_data.get("url")
            print(f"  [Hashnode SUCCESS] ID: {pid} | URL: {purl}")
            return post_data
        else:
            print(f"  [Hashnode UNEXPECTED] Response: {data}", file=sys.stderr)
    except Exception as e:
        print(f"  [Hashnode EXCEPTION] {e}", file=sys.stderr)

    return None


def publish_to_medium(
    post: frontmatter.Post,
    slug: str,
    body_markdown: str,
    cover_url: str,
    token: str,
    publication_id: str | None,
    draft: bool,
    dry_run: bool,
) -> dict[str, Any] | None:
    medium_meta = post.metadata.get("platforms", {}).get("medium", {})
    article_id = medium_meta.get("id")

    if article_id:
        print(
            f"  [Medium SKIP] Article already posted to Medium (ID: {article_id}).\n"
            "    Note: Medium API does not support updates; edit via Medium dashboard."
        )
        return None

    title = post.metadata.get("title", "")
    tags = normalize_medium_tags(post.metadata.get("tags", []))
    canonical_url = post.metadata.get("canonical_url", "")
    is_published = False if draft else medium_meta.get("published", False)
    publish_status = "public" if is_published else "draft"

    # Prepend cover image to markdown if not already present
    content = body_markdown
    if "cover.png" not in content and cover_url:
        content = f"![{title}]({cover_url})\n\n{content}"

    payload = {
        "title": title,
        "contentFormat": "markdown",
        "content": content,
        "tags": tags,
        "publishStatus": publish_status,
    }
    if canonical_url:
        payload["canonicalUrl"] = canonical_url

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    target_name = (
        f"publication '{publication_id}'" if publication_id else "author profile"
    )

    if dry_run:
        print(f"  [Medium DRY-RUN] Would POST to {target_name}:")
        print(f"    Title: {title}")
        print(f"    Tags: {tags}")
        print(f"    Status: {publish_status}")
        print(f"    Canonical URL: {canonical_url}")
        return {"id": "dry_run_medium_id", "url": "https://medium.com/dry-run"}

    try:
        # Determine endpoint URL
        if publication_id:
            url = f"{MEDIUM_API_URL}/publications/{publication_id}/posts"
        else:
            # Fetch user ID first
            me_resp = requests.get(f"{MEDIUM_API_URL}/me", headers=headers, timeout=10)
            if me_resp.status_code != 200:
                print(
                    f"  [Medium ERROR] Failed to fetch user info: {me_resp.text}",
                    file=sys.stderr,
                )
                return None
            user_id = me_resp.json().get("data", {}).get("id")
            url = f"{MEDIUM_API_URL}/users/{user_id}/posts"

        print(f"  [Medium] Creating post on {target_name}...")
        resp = requests.post(url, json=payload, headers=headers, timeout=25)
        if resp.status_code in (200, 201):
            data = resp.json().get("data", {})
            pid = data.get("id")
            purl = data.get("url")
            print(f"  [Medium SUCCESS] ID: {pid} | URL: {purl}")
            return data
        else:
            print(
                f"  [Medium ERROR] Status {resp.status_code}: {resp.text}",
                file=sys.stderr,
            )
    except Exception as e:
        print(f"  [Medium EXCEPTION] {e}", file=sys.stderr)

    return None


def process_post(
    post_dir: Path,
    target: str,
    draft: bool,
    dry_run: bool,
    repo: str,
    branch: str,
    asset_base: str | None,
    update_frontmatter: bool,
):
    index_file = post_dir / "index.md"
    slug = post_dir.name

    if not index_file.exists():
        print(f"[SKIP] No index.md in {post_dir}")
        return

    post = frontmatter.load(index_file)
    print("\n=======================================================")
    print(f"Post: {post.metadata.get('title', slug)} ({slug})")
    print("=======================================================")

    # Ensure platform structures exist
    if "platforms" not in post.metadata:
        post.metadata["platforms"] = {}
    if "devto" not in post.metadata["platforms"]:
        post.metadata["platforms"]["devto"] = {
            "published": False,
            "id": None,
            "url": None,
        }
    if "hashnode" not in post.metadata["platforms"]:
        post.metadata["platforms"]["hashnode"] = {
            "published": False,
            "id": None,
            "url": None,
        }
    if "medium" not in post.metadata["platforms"]:
        post.metadata["platforms"]["medium"] = {
            "published": False,
            "id": None,
            "url": None,
        }

    resolved_content, cover_url = resolve_image_urls(
        post.content, slug, repo=repo, branch=branch, asset_base=asset_base
    )

    metadata_modified = False

    # Dev.to
    if target in ("devto", "all"):
        devto_key = os.getenv("DEVTO_API_KEY")
        if not devto_key and not dry_run:
            print("  [Dev.to SKIP] DEVTO_API_KEY environment variable not set.")
        else:
            res = publish_to_devto(
                post=post,
                slug=slug,
                body_markdown=resolved_content,
                cover_url=cover_url,
                api_key=devto_key or "DRY_RUN_KEY",
                draft=draft,
                dry_run=dry_run,
            )
            if res and not dry_run:
                post.metadata["platforms"]["devto"]["id"] = res.get("id")
                post.metadata["platforms"]["devto"]["url"] = res.get("url")
                if not draft:
                    post.metadata["platforms"]["devto"]["published"] = True
                metadata_modified = True

    # Hashnode
    if target in ("hashnode", "all"):
        hashnode_token = os.getenv("HASHNODE_TOKEN")
        hashnode_pub_id = os.getenv("HASHNODE_PUBLICATION_ID")
        if (not hashnode_token or not hashnode_pub_id) and not dry_run:
            print(
                "  [Hashnode SKIP] HASHNODE_TOKEN and/or HASHNODE_PUBLICATION_ID"
                " environment variables not set."
            )
        else:
            res = publish_to_hashnode(
                post=post,
                slug=slug,
                body_markdown=resolved_content,
                cover_url=cover_url,
                token=hashnode_token or "DRY_RUN_TOKEN",
                publication_id=hashnode_pub_id or "DRY_RUN_PUB_ID",
                draft=draft,
                dry_run=dry_run,
            )
            if res and not dry_run:
                post.metadata["platforms"]["hashnode"]["id"] = res.get("id")
                post.metadata["platforms"]["hashnode"]["url"] = res.get("url")
                if not draft:
                    post.metadata["platforms"]["hashnode"]["published"] = True
                metadata_modified = True

    # Medium
    if target in ("medium", "all"):
        medium_token = os.getenv("MEDIUM_TOKEN")
        medium_pub_id = os.getenv("MEDIUM_PUBLICATION_ID")
        if not medium_token and not dry_run:
            print("  [Medium SKIP] MEDIUM_TOKEN environment variable not set.")
        else:
            res = publish_to_medium(
                post=post,
                slug=slug,
                body_markdown=resolved_content,
                cover_url=cover_url,
                token=medium_token or "DRY_RUN_TOKEN",
                publication_id=medium_pub_id,
                draft=draft,
                dry_run=dry_run,
            )
            if res and not dry_run:
                post.metadata["platforms"]["medium"]["id"] = res.get("id")
                post.metadata["platforms"]["medium"]["url"] = res.get("url")
                if not draft:
                    post.metadata["platforms"]["medium"]["published"] = True
                metadata_modified = True

    if metadata_modified and update_frontmatter:
        with open(index_file, "w", encoding="utf-8") as f:
            f.write(frontmatter.dumps(post) + "\n")
        print(f"  [FRONTMATTER UPDATED] {index_file}")


def main():
    parser = argparse.ArgumentParser(
        description="Cross-post blog articles to Dev.to, Hashnode, and Medium"
    )
    parser.add_argument(
        "--post",
        type=str,
        help="Specific post slug to publish (e.g. aws-lambda-templates)",
    )
    parser.add_argument(
        "--target",
        choices=["devto", "hashnode", "medium", "all"],
        default="all",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Simulate publish without making write API requests",
    )
    parser.add_argument(
        "--draft",
        action="store_true",
        help="Publish as draft regardless of post frontmatter",
    )
    parser.add_argument(
        "--no-update-frontmatter",
        action="store_true",
        help="Do not write IDs/URLs back to index.md",
    )
    parser.add_argument(
        "--repo",
        default="amrabed/blog",
        help="GitHub repo owner/name (default: amrabed/blog)",
    )
    parser.add_argument(
        "--branch", default="main", help="Git branch for raw assets (default: main)"
    )
    parser.add_argument("--asset-base", type=str, help="Override base URL for images")
    args = parser.parse_args()

    posts_dir = Path(__file__).resolve().parent.parent / "posts"

    if args.post:
        target_dir = posts_dir / args.post
        if not target_dir.exists():
            print(f"Error: Post folder {target_dir} not found.", file=sys.stderr)
            sys.exit(1)
        post_dirs = [target_dir]
    else:
        post_dirs = sorted([d for d in posts_dir.iterdir() if d.is_dir()])

    print(
        f"Running publisher: target='{args.target}', "
        f"dry_run={args.dry_run}, draft={args.draft}"
    )
    for pdir in post_dirs:
        process_post(
            post_dir=pdir,
            target=args.target,
            draft=args.draft,
            dry_run=args.dry_run,
            repo=args.repo,
            branch=args.branch,
            asset_base=args.asset_base,
            update_frontmatter=not args.no_update_frontmatter,
        )


if __name__ == "__main__":
    main()
