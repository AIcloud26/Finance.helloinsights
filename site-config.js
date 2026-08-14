/**
 * HelloInsights — 子站点配置 (Template)
 * 
 * 矩阵化复用：复制此文件到子站仓库，修改 SITE_CONFIG 中的字段即可。
 * 需修改项：siteName, tagline, subcategories, SEO, heroIntro, gaId
 */
var SITE_CONFIG = {
    siteName: 'Finance',
    fullSiteName: 'HelloInsights Finance',
    tagline: 'Finance Insights for Smarter Money Decisions',
    aboutText: 'Practical insights on money, investing, markets, banking, fintech and the economy.',
    fallbackImage: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&h=400&fit=crop',
    jsonFile: 'finance-index.json',
    fullArticleJson: 'articles-finance.json',
    gaId: 'G-FINANCE-XXXXXXX',
    // SEO
    titleSuffix: 'Finance Insights on Money, Investing, Markets & Banking | HelloInsights',
    metaDesc: 'Explore practical finance insights covering personal finance, investing, markets, banking, fintech, the economy and everyday money management.',
    // Hero
    heroIntro: '<p>Money shapes every decision we make — from daily spending to long-term wealth. HelloInsights Finance cuts through the noise to deliver <strong>actionable insights on personal finance, investing, markets, banking, fintech, the economy, and money management</strong>.</p><p>Our editors go beyond headlines: we explain what matters, why it matters, and how it affects your wallet.</p>',
    // 7 个 Finance 子分类
    subcategories: [
        { id: 'personal-finance', name: 'Personal Finance', desc: 'Budgeting, saving, real estate and retirement planning for everyday life.' },
        { id: 'investing', name: 'Investing', desc: 'Stock market analysis, portfolio strategies and wealth building.' },
        { id: 'markets', name: 'Markets', desc: 'Real-time market trends, analysis and breaking financial news.' },
        { id: 'banking', name: 'Banking', desc: 'Digital banking, fintech disruption and the future of financial services.' },
        { id: 'fintech', name: 'Fintech', desc: 'Cryptocurrency, DeFi, blockchain and financial technology innovation.' },
        { id: 'economy', name: 'Economy', desc: 'Global economic outlook, policy analysis and macro trends.' },
        { id: 'money-management', name: 'Money Management', desc: 'Wealth management, financial advisory and asset allocation.' }
    ],
    // 导航 URL 映射（用于 _redirects 或 JS 路由）
    categoryUrlMap: {
        'personal-finance': '/personal-finance/',
        'investing': '/investing/',
        'markets': '/markets/',
        'banking': '/banking/',
        'fintech': '/fintech/',
        'economy': '/economy/',
        'money-management': '/money-management/'
    }
};
