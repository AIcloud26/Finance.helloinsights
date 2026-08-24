# HelloInsights Finance — Content Studio V1.0

## Overview

Content Studio is an editorial management system for finance.helloinsights.online. It provides a unified workflow for creating new articles and optimizing existing ones, with built-in fact-checking, quality review, version control, and SEO tools.

**Core principle:** Human Opinion + AI Efficiency + Verified Sources + Editorial Review = High-value Original Content.

---

## Quick Start

### Option 1: Demo Mode (No Setup Required)

1. Open `admin.html` in any modern browser
2. Click **"Demo Mode"**
3. Explore with pre-loaded sample articles

### Option 2: Connected Mode (Supabase)

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run `supabase-schema.sql` in the Supabase SQL Editor
3. Get your **Project URL** and **anon/public key** from Settings → API
4. Open `admin.html`, enter the URL and key, click **"Connect & Start"**

---

## Deployment

### Place Files in Repository

Copy these files to your GitHub repository (`AIcloud26/Helloinsights`, finance subdirectory):

```
finance/
├── admin.html              ← Content Studio CMS
├── supabase-schema.sql     ← Database schema (for reference)
├── ADMIN-GUIDE.md          ← This file
├── index.html              ← Site homepage
├── article.html            ← Article detail page
├── category.html           ← Category page
├── style.css               ← Updated styles (search box fix)
├── articles-finance.json   ← Article data (110 articles)
├── finance-index.json      ← Index data (78 articles)
├── site-config.js
├── _redirects              ← Clean URL routing
├── robots.txt
├── sitemap.xml
└── ... (other existing files)
```

### Protect Admin Access

Add authentication or restrict access to `admin.html` using Cloudflare Access or a similar service to prevent unauthorized access.

---

## Features

### 📝 New Article Workflow

1. Navigate to **Create Article**
2. Fill in Title, Content Type, Category (required)
3. Set **Editorial Angle** — the unique thesis/perspective (required)
4. Add **My View** — your personal take in one sentence
5. Add **Key Points** — one per line
6. Add **Sources** — name, URL, type
7. Write content using the rich text editor
8. Fill SEO fields (optional, auto-suggested)
9. **Save Draft** or **Submit for Review**

### 🔧 Optimize Existing Article

1. Navigate to **Optimize Existing**
2. Select an existing article
3. Click **Run Health Check** — get a grade (A/B/C/D)
4. Review KEEP / REWRITE / REMOVE / ADD suggestions
5. Click **AI Rebuild** to generate an improved version
6. Click **Save as New Version** — original is never overwritten

### ✅ Review Queue

1. Navigate to **Review** — shows all articles with status "review"
2. **Fact Check** — verify each claim:
   - ✓ VERIFIED
   - ? NEEDS REVIEW
   - ✕ UNSUPPORTED
   - ⚠ POTENTIALLY INCORRECT
3. **Content Quality** — run quality review:
   - PASS / NEEDS REVISION / HIGH RISK
4. **Approve** or **Reject**
5. ⚠️ Publish is blocked when Fact Check = NEEDS REVIEW

### 🕐 Version History

1. Navigate to **Versions**
2. Select an article
3. View all versions with change type and timestamp
4. Click to preview content or **Restore** any version

### ⚙️ Settings

- **Database Connection** — update Supabase URL/key
- **AI System Prompt** — customize the AI writing assistant behavior
- **Export/Import** — backup and restore all data as JSON

---

## Article Status Flow

```
Draft → Review → Approved → Published
  ↑        |
  └────────┘  (Reject sends back to Draft)
```

**Publish Gate** (all required):
- ✅ Title and content complete
- ✅ Editorial Angle set
- ✅ My View recorded
- ✅ Sources added
- ✅ Fact Check = VERIFIED
- ✅ Quality = PASS
- ✅ Human Approval = true

---

## Categories

| ID | Display Name |
|---|---|
| personal-finance | Personal Finance |
| investing | Investing |
| markets | Markets |
| banking | Banking |
| fintech | FinTech |
| economy | Economy |
| money-management | Money Management |

## Content Types

Market News, News + Analysis, Market Analysis, Opinion, Explainer, Data Analysis, Comparison, Investment Education

---

## AI System Prompt

The default AI prompt is stored in Settings and in localStorage. It follows the principles from the requirements document:

- Prioritize accuracy, editorial value, and reader usefulness
- Preserve user's Editorial Angle and My View
- Never invent facts, figures, or sources
- Avoid template structures and formulaic language
- Use natural paragraph lengths and varied sentence patterns
- Human edits always take priority

---

## Development Priorities

| Priority | Features |
|---|---|
| **P0** | Content Studio, New Article, Optimize Existing, AI Draft/Rebuild, Rich Text Editor, Paragraph Tools, Save Draft, Human Approval, Publish |
| **P1** | Fact Check, Content Quality, SEO Assistant, Version History, Review, Permissions |
| **P2** | Source Extraction, Content Calendar, Analytics, Internal Linking, Image Suggestions |

---

## Technical Notes

- **Frontend:** Vue 3 (CDN) — no build step required
- **Backend:** Supabase (PostgreSQL + REST API)
- **Auth:** Supabase Auth (configure separately for production)
- **Storage:** All content in Supabase tables
- **Demo Mode:** In-memory only, data lost on refresh
- **Config:** Stored in localStorage (Supabase URL/key, AI prompt)

---

*Content Studio V1.0 — Human Opinion + AI Efficiency + Verified Sources = High-value Original Content*
