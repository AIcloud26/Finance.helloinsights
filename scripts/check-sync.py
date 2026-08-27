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
    with open(file, "r", encoding="utf-8") as f:
        return json.load(f)


def load_content_articles():
    data = load_json(CONTENT_FILE)
    return data.get("articles", [])


def load_index_ids():
    data = load_json(INDEX_FILE)

    articles = data.get("articles", {})

    # 当前 finance-index.json:
    # "articles": {
    #   "12345": "finance"
    # }
    if isinstance(articles, dict):
        return set(str(x) for x in articles.keys())

    # 兼容旧版数组结构
    if isinstance(articles, list):
        return set(str(x["id"]) for x in articles if "id" in x)

    return set()


def extract_sitemap_urls():
    with open(SITEMAP_FILE, "r", encoding="utf-8") as f:
        sitemap = f.read()

    return set(
        unquote(x)
        for x in re.findall(r"<loc>(.*?)</loc>", sitemap)
    )


def build_content_url_map(articles):
    """
    建立文章 URL -> article ID 映射。

    当前 SEO URL:
      /subcategory/slug/

    旧兼容 URL:
      /article.html?id=12345
    """

    url_map = {}

    for article in articles:
        aid = str(article["id"])

        subcat = article.get("subcategory")
        slug = article.get("slug")

        if subcat and slug:
            url = f"{DOMAIN}/{subcat}/{slug}/"
            url_map[url] = aid
        else:
            url = f"{DOMAIN}/article.html?id={aid}"
            url_map[url] = aid

    return url_map


index_ids = load_index_ids()
content_articles = load_content_articles()
content_ids = set(str(x["id"]) for x in content_articles)

sitemap_urls = extract_sitemap_urls()

content_url_map = build_content_url_map(content_articles)

# 只统计真正属于文章的 Sitemap URL
sitemap_article_ids = set()

for url in sitemap_urls:
    if url in content_url_map:
        sitemap_article_ids.add(content_url_map[url])

# 兼容旧 article.html?id= URL
for url in sitemap_urls:
    match = re.search(r"/article\.html\?id=(\d+)$", url)
    if match:
        sitemap_article_ids.add(match.group(1))


print("Finance Article Sync Check")
print("--------------------------")

print("Index articles :", len(index_ids))
print("Content articles:", len(content_ids))
print("Sitemap articles:", len(sitemap_article_ids))

print()

missing_content = index_ids - content_ids
missing_index = content_ids - index_ids
missing_sitemap = index_ids - sitemap_article_ids
stale_sitemap = sitemap_article_ids - index_ids

print("Index missing content:")
print(sorted(missing_content))

print()

print("Content missing index:")
print(sorted(missing_index))

print()

print("Sitemap missing index:")
print(sorted(missing_sitemap))

print()

print("Sitemap stale articles:")
print(sorted(stale_sitemap))

print()

if (
    index_ids == content_ids
    and sitemap_article_ids == index_ids
):
    print("✅ All synced correctly")
    sys.exit(0)

print("❌ Sync problem detected")
sys.exit(1)
