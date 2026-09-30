#!/usr/bin/env python3
"""Convert Medium RSS feed export or HTML to refined markdown blog posts.

Usage:
    python scripts/convert_medium.py [--feed PATH] [--item INDEX] [--force] [--dry-run]
"""

import argparse
import datetime
import re
import sys
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import urlparse

import requests
from bs4 import BeautifulSoup
from markdownify import MarkdownConverter

SLUG_MAP = {
    "stop-writing-lambda-boilerplate": "aws-lambda-templates",
    "self-host-openclaw-ai-agent-whatsapp-cloud-api": "openclaw-whatsapp-agent",
    "the-only-aip-c01-study-plan-you-need": "aip-c01-study-plan",
    "your-ai-code-can-be-elegant-too": "elegant-ai-code",
    "enjoy-your-empty-inbox": "empty-inbox-productivity",
    "goodbye-garage-door-remote": "garage-door-remote-carplay",
    "open-sesame-how-i-automated-my-15-year-old-garage-door": "smart-garage-automation",
    "adding-firebase-to-ios-project-the-lazy-way": "firebase-ios-lazy-way",
    "using-google-cloud-and-docker-to-test-your-jekyll-website": "gcp-docker-jekyll",
    (
        "i-recently-interviewed-with-two-faang-companies-here-is-my-impression"
    ): "faang-interviews-reflection",
}

DEFAULT_FEED_LOCATIONS = [
    Path("feed.xml"),
    Path(__file__).resolve().parent.parent / "feed.xml",
    Path("/Users/amrabed/Documents/antigravity/profile-management/feed.xml"),
]


class CustomMarkdownConverter(MarkdownConverter):
    """Custom Markdown converter with code block, image, and heading handling."""

    def convert_pre(self, el, text, convert_as_inline=False, **kwargs):
        code = el.find("code")
        lang = ""
        if code and code.get("class"):
            for cls in code.get("class", []):
                if cls.startswith("language-"):
                    lang = cls.replace("language-", "")
                    break
        code_text = el.get_text()
        return f"\n```{lang}\n{code_text.strip()}\n```\n"

    def convert_figcaption(self, el, text, convert_as_inline=False, **kwargs):
        caption = text.strip()
        if caption:
            return f"\n*{caption}*\n"
        return ""


def clean_slug_from_url(url: str, title: str) -> str:
    path = urlparse(url).path
    parts = [p for p in path.split("/") if p]
    if parts:
        last = parts[-1]
        # Remove trailing medium hash e.g. -7e584af5c218
        clean = re.sub(r"-[a-f0-9]{8,16}$", "", last)
        if clean in SLUG_MAP:
            return SLUG_MAP[clean]
        for k, v in SLUG_MAP.items():
            if k in clean:
                return v
        slug = re.sub(r"[^a-zA-Z0-9]+", "-", clean).strip("-").lower()
        if slug:
            return slug

    # Fallback to title
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", title).strip("-").lower()
    return slug[:40]


def clean_description(soup: BeautifulSoup) -> str:
    """Extract first meaningful paragraph or blockquote as summary description."""
    for p in soup.find_all(["p", "blockquote"]):
        text = p.get_text().strip()
        if len(text) > 40 and not text.startswith("http"):
            # Avoid boilerplate introductory notes
            if "originally published" in text.lower():
                continue
            return text.replace("\n", " ").strip()
    return ""


def download_image(url: str, dest_path: Path) -> bool:
    try:
        dest_path.parent.mkdir(parents=True, exist_ok=True)
        resp = requests.get(url, timeout=20, headers={"User-Agent": "Mozilla/5.0"})
        if resp.status_code == 200:
            with open(dest_path, "wb") as f:
                f.write(resp.content)
            return True
        else:
            print(f"    [WARN] Failed to download {url}: status {resp.status_code}")
    except Exception as e:
        print(f"    [WARN] Error downloading {url}: {e}")
    return False


def parse_pub_date(pub_date_str: str) -> str:
    # Example: "Sat, 18 Apr 2026 16:25:05 GMT"
    try:
        dt = datetime.datetime.strptime(
            pub_date_str[:25].strip(), "%a, %d %b %Y %H:%M:%S"
        )
        return dt.strftime("%Y-%m-%d")
    except Exception:
        return datetime.date.today().strftime("%Y-%m-%d")


def convert_item(
    item, posts_dir: Path, force: bool = False, dry_run: bool = False
) -> str:
    ns = {"content": "http://purl.org/rss/1.0/modules/content/"}
    title = item.find("title").text if item.find("title") is not None else "Untitled"
    link = item.find("link").text if item.find("link") is not None else ""
    # Strip RSS query params from canonical URL
    if "?" in link:
        link = link.split("?")[0]
    pub_date_raw = item.find("pubDate").text if item.find("pubDate") is not None else ""
    pub_date = parse_pub_date(pub_date_raw)
    categories = [c.text for c in item.findall("category") if c.text]

    slug = clean_slug_from_url(link, title)
    post_dir = posts_dir / slug
    index_file = post_dir / "index.md"

    print(f"\nProcessing: '{title}' -> slug: '{slug}'")

    if index_file.exists() and not force:
        print(f"  [SKIP] {index_file} already exists (use --force to overwrite)")
        return slug

    content_el = item.find("content:encoded", ns)
    html_content = content_el.text if content_el is not None and content_el.text else ""

    if not html_content:
        print(f"  [WARN] No content:encoded found for '{title}'")
        return slug

    soup = BeautifulSoup(html_content, "html.parser")
    description = clean_description(soup)

    # Process images and remove tracking pixels
    img_tags = soup.find_all("img")
    has_cover = False
    img_idx = 1

    for img in img_tags:
        src = img.get("src", "")
        if not src or "stat?event" in src or "medium.com/_/" in src:
            img.decompose()
            continue

        if not has_cover:
            # First image is cover image
            cover_path = post_dir / "cover.png"
            if not dry_run:
                download_image(src, cover_path)
            img["src"] = "cover.png"
            has_cover = True
        else:
            img_filename = f"image_{img_idx}.png"
            dest_img = post_dir / "images" / img_filename
            if not dry_run:
                download_image(src, dest_img)
            img["src"] = f"images/{img_filename}"
            img_idx += 1

    # Remove redundant title/subtitle headers from the start of the body
    for header in soup.find_all(["h1", "h2", "h3", "h4"]):
        header_text = header.get_text().strip().lower()
        if header_text in title.lower() or title.lower() in header_text:
            header.decompose()
            break

    # Remove Medium author bio / footer if present
    for hr in soup.find_all("hr"):
        next_nodes = hr.find_all_next()
        for node in next_nodes:
            if (
                "medium.com" in node.get_text().lower()
                or "follow me" in node.get_text().lower()
            ):
                hr.decompose()
                break

    # Convert to markdown
    converter = CustomMarkdownConverter(heading_style="ATX")
    markdown_body = converter.convert_soup(soup)

    # Normalize multiple blank lines
    markdown_body = re.sub(r"\n{3,}", "\n\n", markdown_body).strip()

    # Build frontmatter
    tags_formatted = "\n".join([f"  - {cat}" for cat in categories])
    frontmatter = f"""---
title: "{title.replace('"', '\\"')}"
description: "{description.replace('"', '\\"')}"
slug: "{slug}"
date: "{pub_date}"
cover_image: "./cover.png"
canonical_url: "{link}"
tags:
{tags_formatted}
platforms:
  devto:
    published: false
    id: null
    url: null
  hashnode:
    published: false
    id: null
    url: null
---

# {title}

"""

    full_content = frontmatter + markdown_body + "\n"

    if dry_run:
        print(f"  [DRY-RUN] Would create {index_file} ({len(full_content)} chars)")
    else:
        post_dir.mkdir(parents=True, exist_ok=True)
        with open(index_file, "w", encoding="utf-8") as f:
            f.write(full_content)
        print(
            f"  [CREATED] {index_file}\n"
            f"  (Cover: {has_cover}, Sub-images: {img_idx - 1})"
        )

    return slug


def main():
    parser = argparse.ArgumentParser(description="Convert Medium RSS to blog posts")
    parser.add_argument("--feed", type=str, help="Path to RSS feed.xml")
    parser.add_argument(
        "--item", type=int, help="Index of single item to convert (1-based)"
    )
    parser.add_argument("--force", action="store_true", help="Overwrite existing posts")
    parser.add_argument(
        "--dry-run", action="store_true", help="Preview without writing files"
    )
    args = parser.parse_args()

    feed_path = None
    if args.feed:
        feed_path = Path(args.feed)
    else:
        for loc in DEFAULT_FEED_LOCATIONS:
            if loc.exists():
                feed_path = loc
                break

    if not feed_path or not feed_path.exists():
        print(
            "Error: feed.xml not found. Please specify with --feed PATH",
            file=sys.stderr,
        )
        sys.exit(1)

    print(f"Using feed file: {feed_path.resolve()}")
    tree = ET.parse(feed_path)
    root = tree.getroot()
    channel = root.find("channel")
    if channel is None:
        print("Error: Invalid RSS feed (no channel)", file=sys.stderr)
        sys.exit(1)

    items = channel.findall("item")
    print(f"Found {len(items)} items in feed.")

    posts_dir = Path(__file__).resolve().parent.parent / "posts"
    posts_dir.mkdir(parents=True, exist_ok=True)

    if args.item:
        if args.item < 1 or args.item > len(items):
            print(f"Error: --item must be between 1 and {len(items)}", file=sys.stderr)
            sys.exit(1)
        convert_item(
            items[args.item - 1], posts_dir, force=args.force, dry_run=args.dry_run
        )
    else:
        for item in items:
            convert_item(item, posts_dir, force=args.force, dry_run=args.dry_run)


if __name__ == "__main__":
    main()
