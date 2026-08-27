#!/usr/bin/env python3

import json
import sys


FILE = "articles-finance.json"


REQUIRED_FIELDS = [
    "id",
    "title",
    "content",
    "date",
    "author",
    "category",
    "image"
]


with open(FILE, "r", encoding="utf-8") as f:
    data = json.load(f)


articles = data.get("articles", [])

errors = []
warnings = []


print("Content Quality Check")
print("---------------------")
print("Articles:", len(articles))


for article in articles:

    aid = article.get("id", "unknown")


    for field in REQUIRED_FIELDS:

        if not article.get(field):

            errors.append(
                f"{aid}: missing {field}"
            )


    content = article.get("content","")


    # AI文章最低保护
    if len(content) < 300:

        warnings.append(
            f"{aid}: content short ({len(content)} chars)"
        )


if errors:

    print("\nErrors:")

    for e in errors:
        print("❌", e)


if warnings:

    print("\nWarnings:")

    for w in warnings[:20]:
        print("⚠️", w)


if errors:
    sys.exit(1)


print("\n✅ Content check passed")
