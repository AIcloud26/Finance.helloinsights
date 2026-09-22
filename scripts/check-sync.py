#!/usr/bin/env python3

import json
import re
import sys
from urllib.parse import unquote


INDEX_FILE = "finance-index.json"
CONTENT_FILE = "articles-finance.json"
SITEMAP_FILE = "sitemap.xml"
DOMAIN = "https://finance.helloinsights.online"


def load_json(file):
    with open(file, "r", encoding="utf-8-sig") as f:
        return json.load(f)


def normalize_articles(value):
    if isinstance(value, list):
        return [x for x in value if isinstance(x, dict)]

    if isinstance(value, dict):
        return [x for x in value.values() if isinstance(x, dict)]

    return []


def load_index_articles():
    data = load_json(INDEX_FILE)
    return normalize_articles(data.get("articles", []))


def load_content_articles():
    data = load_json(CONTENT_FILE)
    return normalize_articles(data.get("articles", []))


def article_url(article):
    article_id = article.get("id")
    subcat = article.get("subcategory")
    slug = article.get("slug")

    if subcat and slug:
        return f"{DOMAIN}/{subcat}/{slug}/"

    if article_id is not None:
        return f"{DOMAIN}/article.html?id={article_id}"

    return None


def extract_sitemap_urls():
    with open(SITEMAP_FILE, "r", encoding="utf-8") as f:
        sitemap = f.read()

    return set(
        unquote(x)
        for x in re.findall(r"<loc>(.*?)</loc>", sitemap)
    )


index_articles = load_index_articles()
content_articles = load_content_articles()
sitemap_urls = extract_sitemap_urls()


historical_urls = {
    url
    for url in (article_url(a) for a in index_articles)
    if url
}


content_url_map = {}

for article in content_articles:
    url = article_url(article)

    if url:
        content_url_map[url] = str(article.get("id"))


content_urls = set(content_url_map.keys())


missing_current = content_urls - sitemap_urls

missing_historical = historical_urls - sitemap_urls


# Only treat actual article URLs as article sitemap entries.
# Category pages such as /category/banking/ are intentionally excluded.
sitemap_article_urls = set()

for url in sitemap_urls:

    if re.search(r"/article\.html\?id=\d+$", url):
        sitemap_article_urls.add(url)
        continue

    if "/category/" in url:
        continue

    if re.search(r"/[^/]+/[^/]+/$", url):
        sitemap_article_urls.add(url)


known_article_urls = historical_urls | content_urls

stale_urls = sitemap_article_urls - known_article_urls


print("Finance Article Sync Check")
print("--------------------------")
print(f"Historical articles : {len(index_articles)}")
print(f"Current articles    : {len(content_articles)}")
print(f"Historical URLs     : {len(historical_urls)}")
print(f"Current article URLs: {len(content_urls)}")
print(f"Sitemap URLs        : {len(sitemap_urls)}")
print()


if missing_current:
    print("Missing current articles:")
    for url in sorted(missing_current):
        print("  ", url)
else:
    print("Current articles: OK")


if missing_historical:
    print()
    print("Missing historical URLs:")
    for url in sorted(missing_historical):
        print("  ", url)
else:
    print("Historical URLs: OK")


if stale_urls:
    print()
    print("Stale sitemap article URLs:")
    for url in sorted(stale_urls):
        print("  ", url)
else:
    print("Stale sitemap URLs: OK")


print()

if not missing_current and not missing_historical and not stale_urls:
    print("All sitemap/content checks passed")
    sys.exit(0)


print("Sync problem detected")
sys.exit(1)
