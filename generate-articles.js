// ============================================
// HelloInsights - 修复版 generate-articles.js
// 修复内容：
// 1. 新文章使用当前日期，不再随机分配历史日期
// 2. 排序改为按日期降序（最新在前），而不是按随机ID排序
// 3. 日期格式统一为 YYYY-MM-DD
// ============================================
const fs = require('fs');
const https = require('https');

// ============================================
// 配置
// ============================================
const CONFIG = {
  articlesPerDay: 5,
  useAI: false,
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: 'gpt-3.5-turbo',
  maxArticles: 500
};

// ============================================
// 分类和主题
// ============================================
const CATEGORIES = [
  {
    id: 'technology', name: 'Technology',
    topics: ['AI and Machine Learning', 'Quantum Computing', 'Cybersecurity', 'Web3 and Blockchain', 'Cloud Computing', 'IoT and Smart Devices', 'Robotics and Automation', '5G Networks', 'Edge Computing', 'Sustainable Technology']
  },
  {
    id: 'finance', name: 'Finance',
    topics: ['Cryptocurrency and DeFi', 'Stock Market Analysis', 'Personal Finance', 'Real Estate Investment', 'Retirement Planning', 'Banking Technology', 'Global Economic Outlook', 'ESG Investing', 'Fintech Innovation', 'Wealth Management']
  },
  {
    id: 'ai-tools', name: 'AI Tools',
    topics: ['ChatGPT and Language Models', 'AI Image Generation', 'AI Coding Assistants', 'AI Productivity Apps', 'Machine Learning Platforms', 'AI Automation', 'Voice and Speech AI', 'AI for Business', 'AI Writing Assistants', 'AI Video Creation']
  },
  {
    id: 'health-lifestyle', name: 'Health & Lifestyle',
    topics: ['Nutrition and Diet', 'Fitness and Exercise', 'Mental Health', 'Sleep Optimization', 'Productivity', 'Work-Life Balance', 'Healthy Recipes', 'Wellness Technology', 'Stress Management', 'Meditation Practices']
  }
];

// ============================================
// 图片
// ============================================
const IMAGE_IDS = {
    'technology': [
    'photo-1518770660439-4636190af475', 'photo-1526374965328-7f61d4dc18c5',
    'photo-1531297484001-80022131f5a1', 'photo-1550751827-4bd374c3f58b',
    'photo-1485827404703-89b55fcc595e', 'photo-1517694712202-14dd9538aa97',
    'photo-1555066931-4365d14bab8c', 'photo-1519389950473-47ba0277781c',
    'photo-1535378917042-10a22c95931a', 'photo-1506399309854-ec109042956d'
  ],
  'finance': [
    'photo-1611974789855-9c2a0a7236a3', 'photo-1554224155-6726b3ff858f',
    'photo-1579532537598-459ecdaf39cc', 'photo-1460925895917-afdab827c52f',
    'photo-1504608524841-42fe6f032b4b', 'photo-1633158829585-23ba8f7c8caf',
    'photo-1559526324-4b87b5e36e44', 'photo-1604594849809-dfedbc827105',
    'photo-1589995716227-efb8e5b5f5f3', 'photo-1591696205602-2f950c41789b'
  ],
  'ai-tools': [
    'photo-1677442136019-21780ecf995', 'photo-1655355669935-2224b015028b',
    'photo-1681173688248-29e59f4a792c', 'photo-1684163758644-81b4b0e2356b',
    'photo-1680725779155-456faa0c4b02', 'photo-1686191556466-c22c12e4b231',
    'photo-1684766561537-78ce9e8f24c4', 'photo-1692179205324-63f8e3169908',
    'photo-1694981226023-5e2f34b8e8a8', 'photo-1697209147078-45e30e7513f3'
  ],
  'health-lifestyle': [
    'photo-1498837167922-ddd27525d352', 'photo-1505576399279-565b52d45c77',
    'photo-1490645935967-10de6ba17061', 'photo-1473090826765-d54ac2fdc1eb',
    'photo-1464454709131-ebb5e107f953', 'photo-1512621776951-a57141f2eefd',
    'photo-1494390248081-4e521a5940db', 'photo-1540189549336-e6e99c3679fe',
    'photo-1565299624946-b28f40a0ae38', 'photo-1546069901-ba9599a7e63c'
  ]
};

// ============================================
// 标题模板
// ============================================
const TITLE_TEMPLATES = {
  'technology': [
    'The Future of {topic}: Trends to Watch',
    '{topic}: What Experts Are Saying',
    'How {topic} Is Reshaping Industries',
    'Breaking Down {topic}: A Comprehensive Guide',
    '{topic}: The Next Big Thing in Tech',
    'Understanding {topic}: Key Insights',
    '{topic} Innovation: What You Need to Know',
    'The Rise of {topic}: Analysis and Predictions',
    'Why {topic} Matters More Than Ever',
    '{topic}: Challenges and Opportunities Ahead'
  ],
  'finance': [
    '{topic}: What Investors Need to Know',
    'Market Watch: {topic} Trends to Watch',
    'The Role of {topic} in Modern Finance',
    'How {topic} Is Changing the Financial Landscape',
    '{topic}: A Strategic Guide for 2026',
    'Smart Money: Understanding {topic}',
    'Wealth Building: The Role of {topic}',
    '{topic}: Risks and Rewards Explained',
    'The Impact of {topic} on Global Markets',
    '{topic}: Expert Analysis and Forecast'
  ],
  'ai-tools': [
    'Top {topic} Tools You Should Try',
    '{topic}: Revolutionizing the Way We Work',
    'The Best {topic} Platforms Reviewed',
    'How {topic} Is Transforming Productivity',
    '{topic}: A Complete Buyer\'s Guide',
    'Comparing the Leading {topic} Solutions',
    '{topic}: From Hype to Practical Application',
    'Why {topic} Is a Game-Changer for Business',
    '{topic}: Features, Pricing, and Alternatives',
    'The Rise of {topic}: What You Need to Know'
  ],
  'health-lifestyle': [
    '{topic}: Science-Backed Benefits',
    'How {topic} Can Improve Your Life',
    'The Ultimate Guide to {topic}',
    '{topic}: Tips from Health Experts',
    'Why {topic} Should Be Part of Your Routine',
    '{topic}: Myths vs. Reality',
    'The Connection Between {topic} and Wellness',
    '{topic}: What the Research Shows',
    'Simple Ways to Incorporate {topic} Daily',
    '{topic}: A Modern Approach to Health'
  ]
};

// ============================================
// 摘要模板
// ============================================
const EXCERPT_TEMPLATES = [
  'Everything you need to know about {topic} to stay ahead of the curve.',
  'Expert analysis on the latest {topic} trends and their impact on everyday life.',
  'Breaking down {topic}: insights, trends, and practical applications.',
  'Discover how {topic} is revolutionizing the industry and what it means for you.',
  'A deep dive into {topic}: what the data shows and why it matters.'
];

// ============================================
// 正文段落模板
// ============================================
const PARAGRAPH_TEMPLATES = {
  'technology': [
    'The landscape of {topic} has undergone significant transformation in recent years, driven by shifting market dynamics, regulatory changes, and evolving consumer expectations. Technology professionals and researchers are closely monitoring these developments as they reshape traditional approaches to software development and digital infrastructure. The convergence of cloud computing, artificial intelligence, and distributed systems has created new opportunities and challenges that require sophisticated understanding and adaptive strategies. Industry participants are increasingly recognizing that success in {topic} demands both deep technical expertise and the ability to navigate an ever-changing competitive and regulatory environment.',
    'Current market data reveals compelling trends in {topic} that warrant careful attention from both enterprise and startup organizations. Performance metrics across key indicators suggest a fundamental shift in how companies are evaluating technology investments and measuring return on innovation. Analyst reports from major research institutions highlight the growing importance of data-driven decision-making and quantitative analysis in navigating these markets. The integration of advanced analytics and machine learning is enabling more precise forecasting and resource optimization, giving early adopters a significant competitive advantage in identifying and capitalizing on emerging opportunities within {topic}.',
    'For organizations and technology leaders, understanding {topic} is becoming increasingly essential for building resilient and scalable systems. The traditional boundaries between technology domains are blurring, creating both opportunities for enhanced capabilities and new sources of complexity that must be carefully managed. Technology advisors are recommending that organizations allocate strategic resources to {topic} initiatives, while maintaining appropriate risk controls and architectural flexibility. Educational resources and professional development in this area are expanding rapidly, making it more accessible for informed technology leaders to participate meaningfully in these evolving markets.',
    'The regulatory environment surrounding {topic} continues to evolve, with policymakers balancing the need for innovation with consumer protection and systemic stability. Recent regulatory developments in major technology centers have established clearer frameworks for participation, reducing uncertainty and encouraging institutional involvement. Compliance requirements are becoming more standardized across jurisdictions, facilitating cross-border technology deployment and collaboration. Industry associations and standards organizations are playing an increasingly active role in establishing best practices and ethical guidelines, contributing to the overall maturation and credibility of markets related to {topic}.',
    'The future outlook for {topic} remains broadly positive, with most experts projecting sustained growth and increasing mainstream adoption over the medium to long term. Emerging markets are beginning to play a more significant role, bringing new participants and perspectives to what was previously dominated by developed market institutions. Technological innovation continues to lower barriers to entry and improve transparency, making these markets more efficient and accessible. As the global economy continues to evolve, {topic} is likely to become an increasingly important component of the technology ecosystem, offering both challenges and opportunities for those prepared to navigate its complexities.'
  ],
  'finance': [
    'The landscape of {topic} has undergone significant transformation in recent years, driven by shifting market dynamics, regulatory changes, and evolving investor expectations. Financial professionals and analysts are closely monitoring these developments as they reshape traditional approaches to wealth management and investment strategy. The convergence of technology and finance has created new opportunities and challenges that require sophisticated understanding and adaptive strategies. Market participants are increasingly recognizing that success in {topic} demands both deep domain expertise and the ability to navigate an ever-changing regulatory and economic environment.',
    'Current market data reveals compelling trends in {topic} that warrant careful attention from both institutional and retail investors. Performance metrics across key indicators suggest a fundamental shift in how markets are pricing risk and opportunity in this segment. Analyst reports from major financial institutions highlight the growing importance of data-driven decision-making and quantitative analysis in navigating these markets. The integration of advanced analytics and artificial intelligence is enabling more precise forecasting and risk management, giving early adopters a significant competitive advantage in identifying and capitalizing on emerging opportunities within {topic}.',
    'For individual investors and financial planners, understanding {topic} is becoming increasingly essential for building resilient and diversified portfolios. The traditional boundaries between asset classes are blurring, creating both opportunities for enhanced returns and new sources of risk that must be carefully managed. Financial advisors are recommending that clients allocate strategic portions of their portfolios to instruments and strategies related to {topic}, while maintaining appropriate risk controls and diversification. Educational resources and professional guidance in this area are expanding rapidly, making it more accessible for informed investors to participate meaningfully in these evolving markets.',
    'The regulatory environment surrounding {topic} continues to evolve, with policymakers balancing the need for innovation with investor protection and systemic stability. Recent regulatory developments in major financial centers have established clearer frameworks for participation, reducing uncertainty and encouraging institutional involvement. Compliance requirements are becoming more standardized across jurisdictions, facilitating cross-border investment and collaboration. Industry associations and self-regulatory organizations are playing an increasingly active role in establishing best practices and ethical standards, contributing to the overall maturation and credibility of markets related to {topic}.',
    'The future outlook for {topic} remains broadly positive, with most experts projecting sustained growth and increasing mainstream adoption over the medium to long term. Emerging markets are beginning to play a more significant role, bringing new participants and perspectives to what was previously dominated by developed market institutions. Technological innovation continues to lower barriers to entry and improve transparency, making these markets more efficient and accessible. As the global economy continues to evolve, {topic} is likely to become an increasingly important component of the financial system, offering both challenges and opportunities for those prepared to navigate its complexities.'
  ],
  'ai-tools': [
    'The landscape of {topic} has undergone significant transformation in recent years, driven by shifting market dynamics, technological advances, and evolving user expectations. AI researchers and product developers are closely monitoring these developments as they reshape traditional approaches to software tools and digital productivity. The convergence of large language models, computer vision, and automation technologies has created new opportunities and challenges that require sophisticated understanding and adaptive strategies. Industry participants are increasingly recognizing that success in {topic} demands both deep technical expertise and the ability to navigate an ever-changing competitive and user experience landscape.',
    'Current market data reveals compelling trends in {topic} that warrant careful attention from both enterprise and individual users. Performance metrics across key indicators suggest a fundamental shift in how organizations are evaluating AI tool investments and measuring productivity gains. Analyst reports from major technology research institutions highlight the growing importance of data-driven decision-making and quantitative analysis in navigating these markets. The integration of advanced benchmarks and user experience research is enabling more precise tool selection and workflow optimization, giving early adopters a significant competitive advantage in identifying and capitalizing on emerging opportunities within {topic}.',
    'For organizations and technology leaders, understanding {topic} is becoming increasingly essential for building efficient and innovative workflows. The traditional boundaries between software categories are blurring, creating both opportunities for enhanced capabilities and new sources of complexity that must be carefully managed. Technology advisors are recommending that organizations allocate strategic resources to {topic} adoption, while maintaining appropriate risk controls and change management processes. Educational resources and professional development in this area are expanding rapidly, making it more accessible for informed technology leaders to participate meaningfully in these evolving markets.',
    'The regulatory environment surrounding {topic} continues to evolve, with policymakers balancing the need for innovation with data protection and ethical considerations. Recent regulatory developments in major technology centers have established clearer frameworks for AI tool deployment, reducing uncertainty and encouraging institutional involvement. Compliance requirements are becoming more standardized across jurisdictions, facilitating cross-border technology deployment and collaboration. Industry associations and standards organizations are playing an increasingly active role in establishing best practices and ethical guidelines, contributing to the overall maturation and credibility of markets related to {topic}.',
    'The future outlook for {topic} remains broadly positive, with most experts projecting sustained growth and increasing mainstream adoption over the medium to long term. Emerging markets are beginning to play a more significant role, bringing new participants and perspectives to what was previously dominated by developed market institutions. Technological innovation continues to lower barriers to entry and improve transparency, making these tools more efficient and accessible. As the global economy continues to evolve, {topic} is likely to become an increasingly important component of the technology ecosystem, offering both challenges and opportunities for those prepared to navigate its complexities.'
  ],
  'health-lifestyle': [
    'The landscape of {topic} has undergone significant transformation in recent years, driven by shifting research findings, public health priorities, and evolving consumer expectations. Health professionals and researchers are closely monitoring these developments as they reshape traditional approaches to wellness and lifestyle management. The convergence of nutritional science, behavioral psychology, and digital health technologies has created new opportunities and challenges that require sophisticated understanding and adaptive strategies. Industry participants are increasingly recognizing that success in {topic} demands both deep domain expertise and the ability to navigate an ever-changing research and regulatory environment.',
    'Current research data reveals compelling trends in {topic} that warrant careful attention from both healthcare providers and consumers. Performance metrics across key health indicators suggest a fundamental shift in how medical professionals are evaluating lifestyle interventions and preventive strategies. Research reports from major health institutions highlight the growing importance of evidence-based decision-making and quantitative analysis in navigating these areas. The integration of advanced biometrics and personalized health analytics is enabling more precise recommendations and outcome tracking, giving informed individuals a significant advantage in identifying and capitalizing on emerging opportunities within {topic}.',
    'For individuals and health practitioners, understanding {topic} is becoming increasingly essential for achieving optimal wellness outcomes. The traditional boundaries between medical disciplines are blurring, creating both opportunities for enhanced health outcomes and new sources of complexity that must be carefully managed. Health advisors are recommending that individuals incorporate evidence-based {topic} practices into their daily routines, while maintaining appropriate medical oversight and personalized approaches. Educational resources and professional guidance in this area are expanding rapidly, making it more accessible for informed individuals to participate meaningfully in these evolving wellness practices.',
    'The regulatory environment surrounding {topic} continues to evolve, with policymakers balancing the need for innovation with consumer protection and public health safety. Recent regulatory developments in major health markets have established clearer frameworks for health product and service evaluation, reducing uncertainty and encouraging evidence-based innovation. Compliance requirements are becoming more standardized across jurisdictions, facilitating cross-border health product distribution and collaboration. Industry associations and professional organizations are playing an increasingly active role in establishing best practices and quality standards, contributing to the overall maturation and credibility of markets related to {topic}.',
    'The future outlook for {topic} remains broadly positive, with most experts projecting sustained growth in research investment and increasing mainstream adoption over the medium to long term. Emerging markets are beginning to play a more significant role, bringing new perspectives and traditional wellness practices to what was previously dominated by Western medical approaches. Scientific innovation continues to lower barriers to entry and improve understanding, making evidence-based wellness more efficient and accessible. As global health challenges continue to evolve, {topic} is likely to become an increasingly important component of comprehensive health strategies, offering both challenges and opportunities for those prepared to navigate its complexities.'
  ]
};

// ============================================
// 原创观点库
// ============================================
const ORIGINAL_INSIGHTS = {
  'technology': [
    '<p><strong>Our Analysis:</strong> According to a recent study by the Global Technology Institute, companies investing in {topic} are seeing an average ROI of 340% within the first 18 months. What surprised researchers was not just the financial returns, but the unexpected secondary benefits: improved employee satisfaction (up 27%), reduced operational downtime (down 43%), and faster time-to-market for new products. These findings challenge the conventional wisdom that technology investments require years to show meaningful results.</p>',
    '<p><strong>Industry Insight:</strong> Dr. Sarah Chen, a leading researcher at MIT\'s Technology Lab, recently published findings suggesting that {topic} adoption follows a pattern similar to cloud computing\'s early days. "We\'re seeing the same inflection point," she noted in her paper. "Organizations that commit now will have a 5-7 year advantage over late adopters." Her research, based on data from 2,400 companies across 38 countries, indicates that early movers are capturing market share at twice the rate of their competitors.</p>',
    '<p><strong>Real-World Impact:</strong> Consider the case of TechFlow Solutions, a mid-sized software company that implemented {topic} across their operations last year. Within six months, they reduced their development cycle from 14 weeks to just 4 weeks, while simultaneously improving code quality by 62%. "It wasn\'t just about efficiency," explained CEO Marcus Rodriguez. "We could finally compete with companies ten times our size. The playing field has fundamentally changed." Their success story is being replicated across industries, from healthcare startups to manufacturing giants.</p>',
    '<p><strong>Future Projection:</strong> Based on current adoption curves and investment patterns, industry analysts at Gartner predict that by 2028, 78% of Fortune 500 companies will have fully integrated {topic} into their core operations. The remaining 22% will either be acquired or forced to pivot their business models entirely. This isn\'t speculation—it\'s based on the same metrics that predicted the smartphone revolution\'s trajectory five years before it happened. The window for hesitation is closing rapidly.</p>',
    '<p><strong>Expert Perspective:</strong> "What we\'re witnessing with {topic} is not incremental improvement—it\'s a fundamental restructuring of how value is created and captured," argues James Liu, former CTO of a major tech conglomerate and now advisor to multiple startups. His recent white paper, downloaded over 50,000 times, makes a compelling case: organizations treating this as just another technology upgrade are missing the bigger picture. The companies winning aren\'t just adopting tools; they\'re reimagining entire business processes from the ground up.</p>'
  ],
  'finance': [
    '<p><strong>Market Intelligence:</strong> A comprehensive analysis by Bloomberg Intelligence reveals that portfolios incorporating {topic} strategies have outperformed traditional benchmarks by an average of 2.3% annually over the past five years. More importantly, these portfolios showed 31% lower volatility during market downturns. "This isn\'t just about returns—it\'s about risk-adjusted performance," noted senior analyst Rachel Thompson. The data suggests that {topic} is moving from niche strategy to essential component of modern portfolio management.</p>',
    '<p><strong>Investor Behavior:</strong> Recent surveys by the CFA Institute show a dramatic shift in how institutional investors approach {topic}. In 2023, only 23% of pension funds had meaningful exposure; today, that figure stands at 67%. The shift isn\'t gradual—it\'s accelerating. "We\'re seeing mandate changes at the fastest pace I\'ve witnessed in 25 years," commented portfolio manager David Chen. The implications for retail investors are significant: those who don\'t adapt their strategies risk being left behind as market dynamics evolve.</p>',
    '<p><strong>Regulatory Development:</strong> The SEC\'s recent guidance on {topic} has removed a major source of uncertainty that had kept many institutional investors on the sidelines. According to legal experts at Clifford Chance, the new framework provides "the clearest path forward we\'ve seen in a decade." This regulatory clarity is expected to unleash an additional $2.3 trillion in institutional capital over the next 36 months, fundamentally altering the competitive landscape and creating both opportunities and challenges for existing market participants.</p>',
    '<p><strong>Case Study:</strong> The Wellington Family Office, managing $4.2 billion in assets, made headlines last quarter when they disclosed their {topic} allocation strategy. Their approach—combining traditional value investing principles with modern {topic} methodologies—generated returns of 18.7% while maintaining a Sharpe ratio of 1.4. "The key was finding the intersection between proven investment wisdom and emerging opportunities," explained chief investment officer Maria Santos. Their methodology is now being studied at Harvard Business School as a model for institutional adoption.</p>',
    '<p><strong>Economic Impact:</strong> Research from the Peterson Institute for International Economics suggests that {topic} could add 1.2% to global GDP growth over the next decade. The mechanism isn\'t just capital allocation—it\'s about improving the efficiency of resource distribution across economies. Developing nations, in particular, stand to benefit disproportionately, potentially narrowing the wealth gap between developed and emerging markets. These findings have caught the attention of the World Bank and IMF, both of which are incorporating {topic} principles into their development strategies.</p>'
  ],
  'ai-tools': [
    '<p><strong>Productivity Data:</strong> A Stanford University study tracking 10,000 knowledge workers found that those using {topic} tools completed complex tasks 47% faster while maintaining 94% accuracy—compared to 89% without AI assistance. The productivity gains were most pronounced in research, analysis, and creative work. "We expected improvement, but not at this scale," admitted study lead Dr. Jennifer Walsh. The implications for workforce planning are substantial: companies not providing AI tools may find themselves at a severe competitive disadvantage in attracting and retaining talent.</p>',
    '<p><strong>Adoption Trends:</strong> Analysis of software procurement data from 5,000 mid-market companies reveals that {topic} tool adoption has increased 340% year-over-year. What\'s striking is the shift in buyer personas: 62% of purchases are now initiated by department heads rather than IT, indicating mainstream acceptance. "This isn\'t an IT experiment anymore—it\'s a business necessity," observes industry analyst Mark Stevens. The average company now uses 4.7 different AI tools across departments, up from 1.2 just eighteen months ago.</p>',
    '<p><strong>Quality Benchmark:</strong> Independent testing by Consumer Reports evaluated 23 leading {topic} platforms across 47 performance metrics. The results were illuminating: the top three platforms delivered results indistinguishable from human experts in 73% of use cases, while costing 80% less and operating 100x faster. "The quality gap that existed two years ago has essentially closed," noted senior tester Michael Torres. For businesses still skeptical about AI reliability, these benchmarks provide compelling evidence that the technology has reached production-ready maturity.</p>',
    '<p><strong>User Experience:</strong> Our own testing of {topic} tools over a 90-day period revealed unexpected insights about user adoption patterns. Contrary to expectations, the biggest barrier wasn\'t technical complexity—it was change management. Teams that invested in proper training and workflow integration saw adoption rates of 89%, while those who simply deployed tools without support struggled to reach 30%. The lesson is clear: success with AI tools requires human-centered design thinking, not just technical implementation.</p>',
    '<p><strong>Cost Analysis:</strong> A detailed total cost of ownership analysis by McKinsey compared traditional workflows with {topic}-enhanced alternatives across five industries. The findings: average cost reduction of 34% in the first year, rising to 52% by year three. But the more significant finding was qualitative—employees reported 41% higher job satisfaction when freed from repetitive tasks. "The ROI calculation changes dramatically when you factor in retention and engagement," noted McKinsey partner Lisa Park. Companies are beginning to view AI tools not as cost centers, but as strategic investments in human capital.</p>'
  ],
  'health-lifestyle': [
    '<p><strong>Clinical Evidence:</strong> A landmark study published in the New England Journal of Medicine tracked 12,000 participants over five years, examining the long-term effects of {topic} practices. The results were compelling: those consistently engaging in evidence-based {topic} routines showed 38% lower rates of chronic disease, 29% better cognitive function in later years, and 2.3 years longer life expectancy on average. "These aren\'t marginal improvements—they\'re transformative," stated lead researcher Dr. Amanda Foster. The study has prompted several national health organizations to update their guidelines.</p>',
    '<p><strong>Lifestyle Integration:</strong> Survey data from 8,500 adults across 15 countries reveals that 67% of those who successfully integrated {topic} into their daily routines did so through what researchers call "habit stacking"—linking new practices to existing habits. For example, combining morning meditation with coffee preparation, or pairing exercise with podcast listening. "The brain doesn\'t create new neural pathways easily," explained behavioral scientist Dr. Robert Kim. "By anchoring new habits to established ones, we reduce the cognitive load and increase success rates from 23% to 78%."</p>',
    '<p><strong>Workplace Wellness:</strong> Corporations implementing comprehensive {topic} programs are seeing remarkable returns. A study of 200 companies by the WHO found that for every $1 invested in evidence-based wellness initiatives, companies received $3.80 in reduced healthcare costs and $2.70 in productivity gains. But the most successful programs weren\'t just offering gym memberships—they were creating cultural shifts. "The difference between programs that work and those that don\'t comes down to leadership participation," noted wellness consultant Sarah Martinez. When executives visibly engage in {topic} practices, participation rates triple.</p>',
    '<p><strong>Mental Health Connection:</strong> Recent research from Johns Hopkins University has established a strong correlation between consistent {topic} practices and mental health outcomes. The study, involving 6,000 participants, found that those maintaining regular wellness routines showed 44% lower rates of anxiety and 37% lower rates of depression. The mechanism appears to involve both physiological changes (reduced cortisol levels, improved sleep architecture) and psychological factors (increased self-efficacy, better stress coping). "We\'re seeing {topic} prescribed alongside traditional therapy with excellent results," commented psychiatrist Dr. Michael Chang.</p>',
    '<p><strong>Technology Integration:</strong> The convergence of wearable technology and {topic} is creating unprecedented opportunities for personalized health optimization. Data from 50,000 users of leading health platforms shows that those combining biometric tracking with evidence-based wellness practices achieved their goals 2.8x faster than those using either approach alone. "The feedback loop is powerful," explained digital health pioneer Dr. Lisa Wang. "When people can see immediate data on how their practices affect their physiology, adherence increases dramatically." This personalized approach is democratizing access to what was previously available only to elite athletes and executives.</p>'
  ]
};

// ============================================
// Date Generation - 修复：新文章使用当前日期
// 不再随机生成历史日期，而是使用当前日期
// ============================================
function generateArticleDate() {
  var now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD 格式，当天日期
}

// ============================================
// 辅助函数
// ============================================
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function getImageUrl(category, usedImages) {
  var ids = IMAGE_IDS[category] || IMAGE_IDS['technology'];
  var maxAttempts = ids.length * 2;
  var attempt = 0;
  while (attempt < maxAttempts) {
    var id = randomChoice(ids);
    var url = 'https://images.unsplash.com/' + id + '?w=800&h=450&fit=crop&fm=webp&q=80';
    if (!usedImages[url]) {
      usedImages[url] = true;
      return url;
    }
    attempt++;
  }
  // All base images used — generate unique variant with random suffix
  var fallbackId = ids[attempt % ids.length];
  var uniqueUrl = 'https://images.unsplash.com/' + fallbackId + '?w=800&h=450&fit=crop&fm=webp&q=80&t=' + Date.now() + '&r=' + Math.random().toString(36).substr(2, 6);
  usedImages[uniqueUrl] = true;
  return uniqueUrl;
}

// ============================================
// 内容生成
// ============================================
function generateArticleContent(category, topic) {
  var paragraphs = [];
  var count = randomInt(4, 5);
  var indices = [];
  while (indices.length < count) {
    var idx = randomInt(0, 4);
    if (indices.indexOf(idx) === -1) indices.push(idx);
  }
  indices.sort(function(a, b) { return a - b; });
  for (var i = 0; i < indices.length; i++) {
    var tpl = PARAGRAPH_TEMPLATES[category][indices[i]];
    paragraphs.push('<p>' + tpl.replace(/\{topic\}/g, topic) + '</p>');
  }
  var insights = ORIGINAL_INSIGHTS[category] || ORIGINAL_INSIGHTS['technology'];
  var insightCount = randomInt(1, 2);
  var insightIndices = [];
  while (insightIndices.length < insightCount) {
    var idx = randomInt(0, insights.length - 1);
    if (insightIndices.indexOf(idx) === -1) insightIndices.push(idx);
  }
  for (var j = 0; j < insightIndices.length; j++) {
    var insightTpl = insights[insightIndices[j]];
    var insertPos = randomInt(1, paragraphs.length - 1);
    var insightHtml = '<p>' + insightTpl.replace(/\{topic\}/g, topic) + '</p>';
    paragraphs.splice(insertPos, 0, insightHtml);
  }
  return paragraphs.join('\n');
}

function generateFromTemplate(category) {
  var catInfo = CATEGORIES.find(function(c) { return c.id === category; });
  var topic = randomChoice(catInfo.topics);
  var titles = TITLE_TEMPLATES[category] || TITLE_TEMPLATES['technology'];
  var title = randomChoice(titles).replace('{topic}', topic);
  var excerpt = randomChoice(EXCERPT_TEMPLATES).replace('{topic}', topic.toLowerCase());
  var content = generateArticleContent(category, topic);
  return { title: title, excerpt: excerpt, topic: topic, content: content };
}

// ============================================
// AI 生成
// ============================================
async function generateWithAI(category) {
  if (!CONFIG.openaiApiKey) return generateFromTemplate(category);
  var catInfo = CATEGORIES.find(function(c) { return c.id === category; });
  var topic = randomChoice(catInfo.topics);
  var prompt = 'Generate a blog article (500-800 words) about ' + topic + ' in the ' + catInfo.name + ' category.\n\nReturn ONLY valid JSON:\n{"title": "...", "excerpt": "...", "content": "<p>...</p><p>...</p>"}';
  return new Promise(function(resolve) {
    var data = JSON.stringify({
      model: CONFIG.openaiModel,
      messages: [
        { role: 'system', content: 'You are a professional writer. Return ONLY valid JSON, no markdown.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 1200
    });
    var options = {
      hostname: 'api.openai.com',
      path: '/v1/chat/completions',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CONFIG.openaiApiKey }
    };
    var req = https.request(options, function(res) {
      var body = '';
      res.on('data', function(chunk) { body += chunk; });
      res.on('end', function() {
        try {
          var resp = JSON.parse(body);
          var content = resp.choices[0].message.content.trim().replace(/^```json\s*/i, '').replace(/\s*```$/i, '').replace(/^```/i, '').replace(/\s*```$/i, '');
          var parsed = JSON.parse(content);
          resolve({ title: parsed.title.substring(0, 100), excerpt: parsed.excerpt.substring(0, 200), topic: topic, content: parsed.content });
        } catch(e) { resolve(generateFromTemplate(category)); }
      });
    });
    req.on('error', function() { resolve(generateFromTemplate(category)); });
    req.setTimeout(30000, function() { req.destroy(); resolve(generateFromTemplate(category)); });
    req.write(data);
    req.end();
  });
}

// ============================================
// 生成文章
// ============================================
async function generateArticle(existingIds, usedImages) {
  var category = randomChoice(CATEGORIES);
  var id;
  do { id = randomInt(100, 99999); } while (existingIds.indexOf(id) !== -1);
  var generated;
  if (CONFIG.useAI && CONFIG.openaiApiKey) {
    generated = await generateWithAI(category.id);
  } else {
    generated = generateFromTemplate(category.id);
  }
  return {
    id: id,
    category: category.id,
    title: generated.title,
    excerpt: generated.excerpt,
    content: generated.content,
    image: getImageUrl(category.id, usedImages),
    date: generateArticleDate()  // 修复：使用当天日期
  };
}

// ============================================
// 主程序
// ============================================
async function main() {
  console.log('\n🚀 HelloInsights Article Generator');
  console.log('================================');
  console.log('📝 Mode: ' + (CONFIG.useAI ? 'AI-powered' : 'Template-based'));
  console.log('📊 Generating ' + CONFIG.articlesPerDay + ' new articles\n');
  var existingArticles = [];
  var existingIds = [];
  try {
    CATEGORIES.forEach(function(cat) {
      var catFile = 'articles-' + cat.id + '.json';
      if (fs.existsSync(catFile)) {
        var data = fs.readFileSync(catFile, 'utf8');
        var json = JSON.parse(data);
        var arts = json.articles || [];
        arts.forEach(function(a) {
          existingArticles.push(a);
          existingIds.push(a.id);
        });
      }
    });
    console.log('📁 Found ' + existingArticles.length + ' existing articles\n');
  } catch(e) {
    console.log('📝 No existing articles, starting fresh\n');
  }
  console.log('✨ Generating new articles...\n');
  // 图片去重：收集已有文章使用过的图片 URL
  var usedImages = {};
  existingArticles.forEach(function(a) { if (a.image) usedImages[a.image] = true; });
  console.log('🖼️  Found ' + Object.keys(usedImages).length + ' existing images to avoid\n');
  var newArticles = [];
  for (var i = 0; i < CONFIG.articlesPerDay; i++) {
    var article = await generateArticle(existingIds, usedImages);
    newArticles.push(article);
    existingIds.push(article.id);
    console.log('   ' + (i + 1) + '. [' + article.category + '] ' + article.title + ' (' + article.date + ')');
  }
  var allArticles = newArticles.concat(existingArticles);
  var finalArticles = allArticles.slice(0, CONFIG.maxArticles);
  var metadata = {
    lastUpdated: new Date().toISOString(),
    totalArticles: finalArticles.length,
    newToday: newArticles.length,
    generator: CONFIG.useAI ? 'AI (OpenAI)' : 'Template'
  };
  // 修复：按日期降序排序（最新日期在前），而不是按随机ID排序
  finalArticles.sort(function(a, b) {
    return b.date.localeCompare(a.date);
  });
  // 版本号（时间戳），用作类别文件的 cache key
  var version = Date.now();
  // ============================================
  // 1. 写入 articles-index.json
  //    结构: { v, articles: {id: category}, ids: [按日期降序排列] }
  // ============================================
  var articlesMap = {};
  finalArticles.forEach(function(a) { articlesMap[String(a.id)] = a.category; });
  var indexOutput = {
    v: version,
    articles: articlesMap,
    ids: finalArticles.map(function(a) { return a.id; })
  };
  fs.writeFileSync('articles-index.json', JSON.stringify(indexOutput, null, 2));
  console.log('\n✅ articles-index.json written (v=' + version + ', ' + finalArticles.length + ' articles)');
  // ============================================
  // 2. 写入 4 个类别文件
  //    每个: { articles: [完整文章对象], metadata }
  //    文章已按日期降序排列
  // ============================================
  CATEGORIES.forEach(function(cat) {
    var catArticles = finalArticles.filter(function(a) { return a.category === cat.id; });
    // 每个分类内部也按日期降序排序
    catArticles.sort(function(a, b) { return b.date.localeCompare(a.date); });
    var catOutput = {
      articles: catArticles.map(function(a) {
        return {
          id: a.id,
          category: a.category,
          title: a.title,
          excerpt: a.excerpt,
          image: a.image,
          date: a.date,
          content: a.content
        };
      }),
      metadata: metadata
    };
    var filename = 'articles-' + cat.id + '.json';
    fs.writeFileSync(filename, JSON.stringify(catOutput, null, 2));
    console.log('✅ ' + filename + ' written (' + catArticles.length + ' articles)');
  });
  console.log('\n✅ Done!');
  console.log('   New: ' + newArticles.length + ' articles');
  console.log('   Total: ' + finalArticles.length + ' articles');
  console.log('   Sort: by date descending (newest first)');
  console.log('   Output: articles-index.json + 4 category files\n');
}
main().catch(function(error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
