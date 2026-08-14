#!/usr/bin/env python3
"""
HelloInsights — Sitemap Generator

Generates a complete sitemap.xml including:
- Homepage
- Category pages (clean URLs)
- All article pages

Usage:
    python generate-sitemap.py <index_json> <site_config_json> <output_sitemap_xml>

Arguments:
    index_json        — Path to the lightweight index JSON (e.g. finance-index.json)
    site_config_json  — Path to site config as JSON (or use --domain flag)
    output_xml        — Output path for sitemap.xml

Alternatively, for simple use:
    python generate-sitemap.py <index_json> --domain <domain> --output <sitemap.xml>
"""

import json
import sys
import os
from datetime import datetime
from xml.etree.ElementTree import Element, SubElement, tostring
from xml.dom import minidom


def generate_sitemap(articles, domain, subcategories=None):
    """Generate sitemap XML string."""
    urlset = Element('urlset')
    urlset.set('xmlns', 'http://www.sitemaps.org/schemas/sitemap/0.9')
    
    base = f'https://{domain}'
    today = datetime.now().strftime('%Y-%m-%d')
    
    # 1. Homepage
    url_home = SubElement(urlset, 'url')
    SubElement(url_home, 'loc').text = f'{base}/'
    SubElement(url_home, 'lastmod').text = today
    SubElement(url_home, 'changefreq').text = 'daily'
    SubElement(url_home, 'priority').text = '1.0'
    
    # 2. Category pages
    if subcategories:
        for subcat in subcategories:
            url_cat = SubElement(urlset, 'url')
            SubElement(url_cat, 'loc').text = f'{base}/{subcat["id"]}/'
            SubElement(url_cat, 'lastmod').text = today
            SubElement(url_cat, 'changefreq').text = 'daily'
            SubElement(url_cat, 'priority').text = '0.8'
    
    # 3. Article pages
    for article in articles:
        url_art = SubElement(urlset, 'url')
        SubElement(url_art, 'loc').text = f'{base}/article.html?id={article["id"]}'
        SubElement(url_art, 'lastmod').text = article.get('date', today)
        SubElement(url_art, 'changefreq').text = 'monthly'
        SubElement(url_art, 'priority').text = '0.6'
    
    # Pretty print
    rough = tostring(urlset, encoding='unicode')
    parsed = minidom.parseString(rough)
    return parsed.toprettyxml(indent='  ')


def main():
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python generate-sitemap.py <index_json> --domain <domain> --output <sitemap.xml>")
        print("  python generate-sitemap.py <index_json> <site_config_json> <output_xml>")
        sys.exit(1)
    
    index_path = sys.argv[1]
    
    # Parse args
    domain = None
    output_path = 'sitemap.xml'
    subcategories = None
    
    if '--domain' in sys.argv:
        idx = sys.argv.index('--domain')
        domain = sys.argv[idx + 1] if idx + 1 < len(sys.argv) else 'finance.helloinsights.online'
    if '--output' in sys.argv:
        idx = sys.argv.index('--output')
        output_path = sys.argv[idx + 1] if idx + 1 < len(sys.argv) else 'sitemap.xml'
    elif len(sys.argv) >= 4 and '--domain' not in sys.argv:
        # Legacy positional args
        site_config_path = sys.argv[2]
        output_path = sys.argv[3] if len(sys.argv) > 3 else 'sitemap.xml'
        with open(site_config_path, 'r', encoding='utf-8') as f:
            config = json.load(f)
        domain = config.get('domain', 'finance.helloinsights.online')
        subcategories = config.get('subcategories')
    
    if not domain:
        domain = 'finance.helloinsights.online'
    
    # Read index
    with open(index_path, 'r', encoding='utf-8') as f:
        index_data = json.load(f)
    
    articles = index_data.get('articles', [])
    
    # Default subcategories if not provided
    if not subcategories:
        subcategories = [
            {"id": "personal-finance", "name": "Personal Finance"},
            {"id": "investing", "name": "Investing"},
            {"id": "markets", "name": "Markets"},
            {"id": "banking", "name": "Banking"},
            {"id": "fintech", "name": "Fintech"},
            {"id": "economy", "name": "Economy"},
            {"id": "money-management", "name": "Money Management"}
        ]
    
    # Generate
    xml_content = generate_sitemap(articles, domain, subcategories)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(xml_content)
    
    cat_count = len(subcategories) if subcategories else 0
    print(f"Sitemap generated: {output_path}")
    print(f"  Homepage: 1")
    print(f"  Category pages: {cat_count}")
    print(f"  Article pages: {len(articles)}")
    print(f"  Total URLs: {1 + cat_count + len(articles)}")


if __name__ == '__main__':
    main()
