#!/usr/bin/env python3
"""
HelloInsights — Universal Index Generator (Matrix-Ready)

Reads a full articles JSON file (e.g. articles-finance.json) and a site config
(e.g. site-config.js parsed for subcategories), then generates a lightweight
index JSON (e.g. finance-index.json) for fast front-end loading.

Usage:
    python generate-index.py <articles_json> <output_index_json> <subcategories_json>

Arguments:
    articles_json      — Path to the full articles JSON (articles-xxx.json)
    output_index_json  — Output path for the lightweight index JSON
    subcategories_json — Path to a JSON file defining subcategories, e.g.:
                         [
                           {"id": "personal-finance", "name": "Personal Finance",
                            "keywords": ["budget", "saving", "retirement", ...]},
                           ...
                         ]

Output format:
    {
        "v": <unix_timestamp>,
        "articles": [
            {
                "id": "<article_id>",
                "slug": "<url-friendly-slug>",
                "title": "...",
                "category": "<display name>",
                "subcategory": "<subcategory id>",
                "date": "YYYY-MM-DD",
                "image": "https://...",
                "excerpt": "first 150 chars of content...",
                "featured": true/false
            },
            ...
        ]
    }
"""

import json
import sys
import os
import re
import time
import unicodedata


def slugify(text):
    """Convert text to URL-friendly slug."""
    text = unicodedata.normalize('NFKD', text)
    text = text.encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^\w\s-]', '', text.lower())
    text = re.sub(r'[-\s]+', '-', text).strip('-')
    return text[:80] if text else 'untitled'


def classify_article(article, subcategories):
    """Classify an article into a subcategory based on title keywords."""
    title_lower = article.get('title', '').lower()
    
    # Priority matching: check specific keywords first
    # Keywords are matched in order of specificity (more specific subcats first)
    for subcat in subcategories:
        keywords = subcat.get('keywords', [])
        for kw in keywords:
            if kw.lower() in title_lower or title_lower.startswith(kw.lower()):
                return subcat['id']
    
    return subcategories[-1]['id'] if subcategories else 'uncategorized'


def make_excerpt(content, max_len=150):
    """Create a plain-text excerpt from HTML content."""
    # Strip HTML tags
    clean = re.sub(r'<[^>]+>', '', content)
    clean = re.sub(r'\s+', ' ', clean).strip()
    if len(clean) > max_len:
        clean = clean[:max_len].rsplit(' ', 1)[0] + '...'
    return clean


def generate_index(articles_data, subcategories, featured_count=4):
    """Generate lightweight index from full articles data."""
    articles = articles_data if isinstance(articles_data, list) else articles_data.get('articles', [])
    
    # Classify each article
    indexed = []
    for art in articles:
        art_id = art.get('id', '')
        title = art.get('title', '')
        date = art.get('date', '')
        image = art.get('image', '')
        content = art.get('content', '')
        
        subcat_id = classify_article(art, subcategories)
        subcat_name = ''
        for sc in subcategories:
            if sc['id'] == subcat_id:
                subcat_name = sc['name']
                break
        
        excerpt = make_excerpt(content)
        slug = slugify(title)
        
        indexed.append({
            'id': art_id,
            'slug': slug,
            'title': title,
            'category': subcat_name,
            'subcategory': subcat_id,
            'date': date,
            'image': image,
            'excerpt': excerpt,
            'featured': False
        })
    
    # Sort by date descending
    indexed.sort(key=lambda x: x.get('date', ''), reverse=True)
    
    # Mark top N as featured
    for i in range(min(featured_count, len(indexed))):
        indexed[i]['featured'] = True
    
    # Build category counts for reporting
    counts = {}
    for art in indexed:
        sc = art['subcategory']
        counts[sc] = counts.get(sc, 0) + 1
    
    return {
        'v': int(time.time()),
        'articles': indexed
    }, counts


def main():
    if len(sys.argv) < 4:
        print("Usage: python generate-index.py <articles_json> <output_index_json> <subcategories_json>")
        print("\nExample:")
        print("  python generate-index.py articles-finance.json finance-index.json subcats.json")
        sys.exit(1)
    
    articles_path = sys.argv[1]
    output_path = sys.argv[2]
    subcats_path = sys.argv[3]
    
    # Read inputs
    with open(articles_path, 'r', encoding='utf-8') as f:
        articles_data = json.load(f)
    
    with open(subcats_path, 'r', encoding='utf-8') as f:
        subcategories = json.load(f)
    
    # Generate index
    index_data, counts = generate_index(articles_data, subcategories)
    
    # Write output
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, ensure_ascii=False, indent=2)
    
    # Report
    total = len(index_data['articles'])
    print(f"Generated {output_path}: {total} articles")
    print("Category distribution:")
    for cat, count in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {cat}: {count}")


if __name__ == '__main__':
    main()
