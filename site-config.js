/**
 * HelloInsights — Finance sub-site configuration
 *
 * Matrix reuse: copy this file to each sub-site, edit SITE_CONFIG fields.
 * Editable: siteName, tagline, subcategories, SEO, heroIntro, gaId, domain
 */
var SITE_CONFIG = {
    siteName: 'Finance',
    fullSiteName: 'HelloInsights Finance',
    tagline: 'Finance Insights for Smarter Money Decisions',
    aboutText: 'Practical insights on money, investing, markets, banking, fintech and the economy.',
    domain: 'https://finance.helloinsights.online',
    fallbackImage: 'https://images.pexels.com/photos/186461/pexels-photo-186461.jpeg?auto=compress&cs=tinysrgb&w=1200&h=675&fit=crop',
    jsonFile: 'finance-index.json',
    fullArticleJson: 'articles-finance.json',
    gaId: 'G-Q4QHZKZT46',
    // SEO
    titleSuffix: 'Finance Insights on Money, Investing, Markets & Banking | HelloInsights',
    metaDesc: 'Actionable finance insights on personal finance, investing, markets, banking, fintech, the economy and money management — for readers who want clarity, not noise.',
    // Hero (100–150 words, 2 paragraphs, no AI template phrases)
    heroIntro: '<p>Money decisions have a way of looking simple from a distance and messy up close. A headline tells you the market moved; it rarely tells you what the move means for your savings, your mortgage, or your next career move. HelloInsights Finance exists for the second question.</p><p>We cover personal finance, investing, markets, banking, fintech, the economy, and money management with one rule: explain what matters, why it matters, and what you can reasonably do about it. No slogans. No certainty where none exists. Just clear, sourced analysis from people who spend their days reading the fine print.</p>',
    // 7 Finance sub-categories
    subcategories: [
        { id: 'personal-finance', name: 'Personal Finance', desc: 'Budgeting, saving, debt, household cash flow and the everyday decisions that shape long-term financial health.' },
        { id: 'investing', name: 'Investing', desc: 'Stock market analysis, portfolio strategy, asset allocation, and evidence-based approaches to building wealth.' },
        { id: 'markets', name: 'Markets', desc: 'Real-time market trends, rates, earnings, sector moves and the forces driving prices across asset classes.' },
        { id: 'banking', name: 'Banking', desc: 'Digital banking, deposits, lending, neobanks and the fast-changing business of holding and moving money.' },
        { id: 'fintech', name: 'Fintech', desc: 'Cryptocurrency, DeFi, payments, embedded finance and the technology reshaping how money moves.' },
        { id: 'economy', name: 'Economy', desc: 'Inflation, jobs, growth, policy and macro trends — and what they actually mean for households and investors.' },
        { id: 'money-management', name: 'Money Management', desc: 'Wealth management, retirement, tax-efficient planning, insurance and the business of keeping what you earn.' }
    ],
    // Navigation URL map — clean URLs (Cloudflare Pages _redirects maps /xxx/ → category.html?cat=xxx)
    categoryUrlMap: {
        'personal-finance': 'personal-finance/',
        'investing':       'investing/',
        'markets':         'markets/',
        'banking':         'banking/',
        'fintech':         'fintech/',
        'economy':         'economy/',
        'money-management':'money-management/'
    },
    // Article URL builder (single source of truth)
    articleUrl: function(id) { return 'article.html?id=' + id; },
    // Category URL builder
    categoryUrl: function(catId) { return (this.categoryUrlMap[catId] || ('category.html?cat=' + catId)); }
};
