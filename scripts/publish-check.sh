#!/bin/bash

echo "=== Finance Publish Check ==="

python3 scripts/check-id.py || exit 1

python3 scripts/check-content.py || exit 1

echo ""
echo "=== Generate Sitemap ==="

python3 generate-sitemap.py \
  finance-index.json \
  --domain finance.helloinsights.online \
  --output sitemap.xml || exit 1

echo ""
echo "=== Check Data Sync ==="

python3 scripts/check-sync.py || exit 1

echo ""
echo "✅ Ready to publish"
