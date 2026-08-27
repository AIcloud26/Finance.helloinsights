#!/usr/bin/env python3

import json
import os


INDEX="finance-index.json"


with open(INDEX,"r",encoding="utf-8") as f:
    data=json.load(f)


articles=data.get("articles",[])


count=0


for a in articles:

    sub=a.get("subcategory","finance")
    slug=a.get("slug")

    if not slug:
        continue


    path=f"{sub}/{slug}"

    os.makedirs(path,exist_ok=True)


    html=f"""<!DOCTYPE html>
<html>
<head>
<meta http-equiv="refresh" content="0; url=../../article.html?id={a['id']}">
<link rel="canonical" href="https://finance.helloinsights.online/{path}/">
</head>
<body>
Redirecting...
</body>
</html>
"""


    with open(
        f"{path}/index.html",
        "w",
        encoding="utf-8"
    ) as out:
        out.write(html)


    count+=1


print("Generated:",count)
