#!/usr/bin/env python3

import json
from datetime import datetime


INDEX="finance-index.json"


def generate_id(existing):

    prefix=datetime.now().strftime("%y%m")

    nums=[
        int(x)
        for x in existing
        if str(x).startswith(prefix)
    ]

    if nums:
        last=max(nums)
        return last+1

    return int(prefix+"0001")



with open(INDEX,"r",encoding="utf-8") as f:
    data=json.load(f)


ids=[
    a["id"]
    for a in data.get("articles",[])
]


new_id=generate_id(ids)


print(new_id)
