#!/usr/bin/env python3

import argparse
import json
import os
import sys
from datetime import datetime, timezone
from xml.sax.saxutils import escape


DOMAIN_DEFAULT = "https://finance.helloinsights.online"


def load_json(path):
    with open(path, "r", encoding="utf-8-sig") as f:
        return json.load(f)


def normalize_articles(value):
    """
    Supports historical finance-index.json formats:
    - {"articles": [ {...}, {...} ]}
    - {"articles": {"0": {...}, "1": {...}}}
    """
    if isinstance(value, list):
        return [x for x in value if isinstance(x, dict)]

    if isinstance(value, dict):
        return [x for x in value.values() if isinstance(x, dict)]

    return []


def article_url(article, domain):
    article_id = article.get("id")
    subcategory = article.get("subcategory")
    slug = article.get("slug")

    if subcategory and slug:
        return f"{domain}/{subcategory}/{slug}/"

    if article_id is not None:
        return f"{domain}/article.html?id={article_id}"

    return None


def load_historical_articles(index_file):
    if not os.path.exists(index_file):
        return []

    data = load_json(index_file)
    return normalize_articles(data.get("articles", []))


def load_current_articles(content_file):
    if not os.path.exists(content_file):
        return []

    data = load_json(content_file)
    return normalize_articles(data.get("articles", []))


def build_sitemap(index_file, content_file, domain):
    historical_articles = load_historical_articles(index_file)
    current_articles = load_current_articles(content_file)

    urls = {}

    # ---------------------------------------------------------
    # 1. Historical URLs
    # Keep every historical URL that can still be reconstructed.
    # This protects URLs that may already be indexed by Google.
    # ---------------------------------------------------------
    for article in historical_articles:
        url = article_url(article, domain)
        if url:
            urls[url] = article

    # ---------------------------------------------------------
    # 2. Current/new Finance articles
    # New content is driven by articles-finance.json.
    # It does NOT need to exist in finance-index.json.
    # ---------------------------------------------------------
    for article in current_articles:
        url = article_url(article, domain)
        if url:
            urls[url] = article

    # ---------------------------------------------------------
    # 3. Category pages
    # ---------------------------------------------------------
    category_urls = {
        f"{domain}/",
        f"{domain}/category.html",
        f"{domain}/category/banking/",
        f"{domain}/category/economy/",
        f"{domain}/category/fintech/",
        f"{domain}/category/personal-finance/",
        f"{domain}/category/investing/",
    }

    for url in category_urls:
        urls.setdefault(url, None)

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d")

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    for url in sorted(urls):
        lines.append("  <url>")
        lines.append(f"    <loc>{escape(url)}</loc>")
        lines.append(f"    <lastmod>{now}</lastmod>")
        lines.append("  </url>")

    lines.append("</urlset>")

    return "\n".join(lines) + "\n", historical_articles, current_articles, urls


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "index_file",
        nargs="?",
        default="finance-index.json"
    )
    parser.add_argument(
        "--domain",
        default=DOMAIN_DEFAULT
    )
    parser.add_argument(
        "--output",
        default="sitemap.xml"
    )
    parser.add_argument(
        "--content",
        default="articles-finance.json"
    )

    args = parser.parse_args()

    sitemap, historical, current, urls = build_sitemap(
        args.index_file,
        args.content,
        args.domain.rstrip("/")
    )

    with open(args.output, "w", encoding="utf-8") as f:
        f.write(sitemap)

    print("Finance Sitemap Generated")
    print("-------------------------")
    print(f"Historical articles : {len(historical)}")
    print(f"Current articles    : {len(current)}")
    print(f"Total sitemap URLs  : {len(urls)}")
    print(f"Output              : {args.output}")


if __name__ == "__main__":
    main()
