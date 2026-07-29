#!/usr/bin/env python3
"""
HelloInsights 图片去重脚本
功能：读取 4 个分类 JSON 文件，为每篇文章分配唯一图片，消除重复。
策略：
  1. 优先使用本分类已有的唯一图片
  2. 不足部分从其他分类的图片池补充
  3. 确保同一分类内无重复图片
  4. 所有 URL 统一追加 &q=80 控制质量与体积

用法：
  python3 dedup_images.py [json_dir] [output_dir]
  默认: json_dir=. output_dir=./output
"""

import json
import os
import sys
import collections

CATEGORIES = ['technology', 'finance', 'ai-tools', 'health-lifestyle']
IMG_PARAMS = 'w=600&h=400&fit=crop&fm=webp&q=80'


def extract_photo_id(url):
    """从 Unsplash URL 中提取 photo ID"""
    if 'photo-' in url:
        return url.split('photo-')[1].split('?')[0]
    return None


def build_image_url(photo_id):
    """构建标准化的 Unsplash 图片 URL"""
    return f'https://images.unsplash.com/photo-{photo_id}?{IMG_PARAMS}'


def load_json(path):
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_json(data, path):
    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def deduplicate(json_dir, output_dir):
    os.makedirs(output_dir, exist_ok=True)

    # Step 1: 收集所有唯一图片 ID
    all_photo_ids = []  # 保持顺序
    all_photo_set = set()
    cat_data = {}
    cat_own_ids = {}

    for cat in CATEGORIES:
        path = os.path.join(json_dir, f'articles-{cat}.json')
        data = load_json(path)
        cat_data[cat] = data

        own_ids = []
        seen = set()
        for a in data['articles']:
            pid = extract_photo_id(a['image'])
            if pid and pid not in seen:
                seen.add(pid)
                own_ids.append(pid)
            if pid and pid not in all_photo_set:
                all_photo_set.add(pid)
                all_photo_ids.append(pid)

        cat_own_ids[cat] = own_ids
        print(f"  {cat}: {len(data['articles'])} articles, {len(own_ids)} unique images")

    print(f"  Total unique images in pool: {len(all_photo_ids)}")

    # Step 2: 为每个分类分配唯一图片
    for cat in CATEGORIES:
        articles = cat_data[cat]['articles']
        n = len(articles)

        # 本分类图片优先，其余从全局池补充
        own = cat_own_ids[cat]
        others = [pid for pid in all_photo_ids if pid not in set(own)]
        pool = own + others

        if len(pool) < n:
            print(f"  ⚠️  {cat}: 池中只有 {len(pool)} 张图，需要 {n} 张，将循环使用")
            pool = pool * (n // len(pool) + 1)

        used = set()
        for i, a in enumerate(articles):
            for pid in pool:
                if pid not in used:
                    used.add(pid)
                    a['image'] = build_image_url(pid)
                    break

        # 验证
        imgs = [a['image'] for a in articles]
        dups = {url: cnt for url, cnt in collections.Counter(imgs).items() if cnt > 1}
        status = "✅" if not dups else f"❌ {len(dups)} duplicates"
        print(f"  {cat}: {n} articles → {len(set(imgs))} unique images {status}")

        # 保存
        out_path = os.path.join(output_dir, f'articles-{cat}.json')
        save_json(cat_data[cat], out_path)
        fsize = os.path.getsize(out_path)
        print(f"    Saved: {out_path} ({fsize/1024:.1f} KB)")


if __name__ == '__main__':
    json_dir = sys.argv[1] if len(sys.argv) > 1 else '.'
    output_dir = sys.argv[2] if len(sys.argv) > 2 else './output'

    print("=" * 60)
    print("HelloInsights Image Deduplication")
    print("=" * 60)
    print(f"  Input:  {json_dir}")
    print(f"  Output: {output_dir}")
    print()

    deduplicate(json_dir, output_dir)

    print()
    print("Done! Copy the output JSON files to your web server.")
