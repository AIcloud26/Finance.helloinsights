#!/usr/bin/env python3

import json
import re

INDEX_FILE = "finance-index.json"
CONTENT_FILE = "articles-finance.json"
SITEMAP_FILE = "sitemap.xml"


def load_ids(file, key="articles"):
    with open(file, "r", encoding="utf-8") as f:
        data = json.load(f)
    return set(str(x["id"]) for x in data.get(key, []))


index_ids = load_ids(INDEX_FILE)
content_ids = load_ids(CONTENT_FILE)


with open(SITEMAP_FILE, "r", encoding="utf-8") as f:
    sitemap = f.read()

sitemap_ids = set(
    re.findall(r'article\.html\?id=(\d+)', sitemap)
)


print("Finance Article Sync Check")
print("--------------------------")

print("Index articles :", len(index_ids))
print("Content articles:", len(content_ids))
print("Sitemap articles:", len(sitemap_ids))

print()

print("Index missing content:")
print(sorted(index_ids - content_ids))

print()

print("Content missing index:")
print(sorted(content_ids - index_ids))

print()

print("Sitemap missing index:")
print(sorted(sitemap_ids - index_ids))


if (
    index_ids == content_ids
    and sitemap_ids == index_ids
):
    print("\n✅ All synced correctly")
else:
    print("\n❌ Sync problem detected")
