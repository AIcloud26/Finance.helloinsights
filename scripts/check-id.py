#!/usr/bin/env python3

import json
import sys


FILES = [
    "finance-index.json",
    "articles-finance.json"
]


def check_file(file):

    with open(file, "r", encoding="utf-8") as f:
        data = json.load(f)

    articles = data.get("articles", [])

    ids = []
    errors = []

    for article in articles:

        aid = article.get("id")

        if not aid:
            errors.append(
                f"Missing ID: {article.get('title','unknown')}"
            )
            continue

        ids.append(str(aid))


    duplicates = set(
        x for x in ids
        if ids.count(x) > 1
    )

    if duplicates:
        errors.append(
            "Duplicate IDs: " + ",".join(duplicates)
        )


    print("")
    print(file)
    print("----------------")
    print("Articles:", len(articles))


    if errors:
        for e in errors:
            print("❌", e)
        return False

    print("✅ ID check passed")
    return True



result = True


for file in FILES:

    try:
        if not check_file(file):
            result = False

    except Exception as e:
        print("❌ Error:", file, e)
        result = False



if not result:
    sys.exit(1)


print("")
print("✅ All ID checks passed")
