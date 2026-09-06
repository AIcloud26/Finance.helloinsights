var path = require('path');
// ============================================
// HelloInsights - �޸��� generate-articles.js
// �޸����ݣ�
// 1. ������ʹ�õ�ǰ���ڣ��������������ʷ����
// 2. �����Ϊ�����ڽ���������ǰ���������ǰ����ID����
// 3. ���ڸ�ʽͳһΪ YYYY-MM-DD
// ============================================
const fs = require('fs');
const https = require('https');

// ============================================
// ����
// ============================================
const CONFIG = {
  articlesPerRun: 5,
  articlesPerCategoryPerWeek: 100,
  articlesPerCategoryPerDay: 100,
  useAI: true,
  openaiApiKey: process.env.OPENAI_API_KEY,
  openaiModel: 'gpt-4o-mini',
  maxArticles: Infinity
};

// ============================================
// ���������
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
// ͼƬ
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
    'photo-1611974789855-9c2a0a7236a3',
    'photo-1554224155-6726b3ff858f',
    'photo-1579532537598-459ecdaf39cc',
    'photo-1460925895917-afdab827c52f',
    'photo-1504608524841-42fe6f032b4b',
    'photo-1633158829585-23ba8f7c8caf',
    'photo-1559526324-4b87b5e36e44',
    'photo-1604594849809-dfedbc827105',
    'photo-1589995716227-efb8e5b5f5f3',
    'photo-1591696205602-2f950c41789b',
    'photo-1444653614773-995cb1ef9efa',
    'photo-1556761175-b413da4baf72',
    'photo-1551836022-d5d88e9218df',
    'photo-1526304640581-d334cdbbf45e',
    'photo-1565514020179-026b92b84bb6',
    'photo-1559526324-593bc073d938',
    'photo-1450101499163-c8848c66ca85',
    'photo-1518458028785-8fbcd101ebb9',
    'photo-1556742049-0cfed4f6a45d',
    'photo-1554224154-26032ffc0d07',
    'photo-1556740758-90de374c12ad',
    'photo-1554224155-8d04cb21cd6c',
    'photo-1556740749-887f6717d7e4',
    'photo-1543286386-713bdd548da4',
    'photo-1507679799987-c73779587ccf',
    'photo-1556761175-4b46a572b786',
    'photo-1563013544-824ae1b704d3',
    'photo-1554224155-a1487473ffd9',
    'photo-1554224154-22dec7ec8818',
    'photo-1556742111-a301076d9d18',
    'photo-1556742502-ec7c0e9f34b1',
    'photo-1556742049-3e3a7d4b6b7c',
    'photo-1551836022-d5d88e9218df',
    'photo-1551836022-4c4c79ecde51',
    'photo-1559526324-4b87b5e36e44',
    'photo-1559526324-593bc073d938',
    'photo-1554224155-8d04cb21cd6c',
    'photo-1556742049-0cfed4f6a45d',
    'photo-1526304640581-d334cdbbf45e',
    'photo-1565514020179-026b92b84bb6',
    'photo-1518546305927-5a555bb7020d',
    'photo-1559526324-4b87b5e36e44',
    'photo-1523287562758-66c7fc58967f',
    'photo-1499750310107-5fef28a66643',
    'photo-1504384308090-c894fdcc538d',
    'photo-1556761175-5973dc0f32e7',
    'photo-1521737604893-d14cc237f11d',
    'photo-1454165804606-c3d57bc86b40',
    'photo-1551288049-bebda4e38f71',
    'photo-1460925895917-afdab827c52f',
    'photo-1542744173-8e7e53415bb0',
    'photo-1553877522-43269d4ea984',
    'photo-1556761175-b413da4baf72',
    'photo-1552664730-d307ca884978',
    'photo-1524758631624-e2822e304c36',
    'photo-1497366811353-6870744d04b2',
    'photo-1497366754035-f200968a6e72',
    'photo-1556761175-4b46a572b786',
    'photo-1551836022-4c4c79ecde51',
    'photo-1450101499163-c8848c66ca85'
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
// ����ģ��
// ============================================
const EDITORIAL_DIRECTIONS = [
  "What changed and why it matters",
  "Why markets reacted",
  "What investors may be missing",
  "A contrarian view",
  "Risk and downside",
  "Consumer impact",
  "Policy impact",
  "Company strategy",
  "Long-term trend",
  "What the data may be saying",
  "What has changed versus what has not",
  "What could happen next"
];

const ARTICLE_STRUCTURES = [
  "news_to_context",
  "market_move",
  "contrarian",
  "data_led",
  "investor_focus",
  "policy_to_market",
  "company_to_sector",
  "consumer_to_economy",
  "risk_first",
  "long_term_shift",
  "two_sided_debate",
  "what_changed_what_has_not"
];

const OPENING_STYLES = [
  "Start with the most interesting development.",
  "Open with a concrete tension or contradiction.",
  "Start with a short observation that challenges a common assumption.",
  "Begin with the practical question readers are likely asking.",
  "Open with the market or business implication before explaining the background.",
  "Start directly with what changed."
];

const CLOSING_STYLES = [
  "End with what readers should watch next.",
  "End with an unresolved question.",
  "End by explaining what could prove the current view wrong.",
  "End with the practical implication for investors or businesses.",
  "End with a balanced assessment rather than a prediction.",
  "End by returning to the tension introduced at the beginning."
];

const TONE_STYLES = [
  "clear and analytical",
  "confident but measured",
  "conversational and informed",
  "skeptical where the evidence warrants it",
  "practical and reader-focused",
  "curious and analytical"
];

const DEFAULT_EDITORIAL_INPUT = {
  topic: "",
  direction: "",
  humanView: "",
  keyPoints: [],
  sourceNotes: []
};

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickArticleDNA() {
  return {
    targetWords: randomInt(680, 950),
    paragraphCount: randomInt(8, 14),
    h2Count: randomInt(2, 4),
    useList: Math.random() < 0.35,
    opening: randomItem(OPENING_STYLES),
    structure: randomItem(ARTICLE_STRUCTURES),
    tone: randomItem(TONE_STYLES),
    closing: randomItem(CLOSING_STYLES)
  };
}

function normalizeEditorialInput(input, category) {
  var catInfo = CATEGORIES.find(function(c) { return c.id === category; });
  input = input || {};

  return {
    topic: String(input.topic || randomItem(catInfo.topics)),
    direction: String(input.direction || randomItem(EDITORIAL_DIRECTIONS)),
    humanView: String(input.humanView || ""),
    keyPoints: Array.isArray(input.keyPoints) ? input.keyPoints : [],
    sourceNotes: Array.isArray(input.sourceNotes) ? input.sourceNotes : []
  };
}

function stripCodeFence(text) {
  return String(text || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function sanitizeGeneratedHtml(html) {
  return String(html || "")
    .replace(/```html/gi, "")
    .replace(/```/g, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .trim();
}

function countWords(text) {
  return String(text || "")
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function validateArticle(article) {
  if (!article || typeof article !== "object") return false;
  if (!article.title || !article.excerpt || !article.content) return false;

  var words = countWords(article.content);

  if (words < 600) return false;
  if (article.title.length < 20 || article.title.length > 120) return false;
  if (article.excerpt.length < 60) return false;

  return true;
}

function buildEditorialPrompt(category, editorialInput, dna) {
  var catInfo = CATEGORIES.find(function(c) { return c.id === category; });

  var humanSection = editorialInput.humanView
    ? "Human editorial view:\n" + editorialInput.humanView
    : "No human opinion was supplied. Develop an independent analysis.";

  var pointsSection = editorialInput.keyPoints.length
    ? "Human focus points:\n- " + editorialInput.keyPoints.join("\n- ")
    : "No fixed focus points. Decide which aspects deserve attention.";

  var sourcesSection = editorialInput.sourceNotes.length
    ? "Source notes supplied by the editor:\n- " + editorialInput.sourceNotes.join("\n- ")
    : "No source notes were supplied. Do not invent sources or factual claims.";

    return [
      "Editorial writing rules:",
      "",
      "- Write like a professional financial journalist.",
      "- Avoid AI-generated style and generic introductions.",
      "- Do not use phrases such as:",
      "\"In today's rapidly changing world\"",
      "\"A comprehensive look at\"",
      "\"It is important to note\"",
      "\"In conclusion\"",
      "- Start with specific market events, companies, data, trends or real-world context.",
      "- Provide analysis, implications and practical insights.",
      "- Avoid repetitive summaries.",
      "",
    "Write an original English finance article for HelloInsights.",
    "",
    "CATEGORY: " + catInfo.name,
    "TOPIC: " + (editorialInput.topic || "Develop an independent finance topic"),
"EDITORIAL DIRECTION: " + (editorialInput.direction || "Independent editorial analysis"),
    "",
    humanSection,
    "",
    pointsSection,
    "",
    sourcesSection,
    "",
    "You are not required to agree with the human view.",
    "First reason independently about the topic.",
    "Identify what supports the human view, what challenges it, what may be missing, and where uncertainty remains.",
    "Then synthesize the strongest parts of both perspectives into one coherent editorial article.",
    "",
    "ARTICLE DNA:",
    "Target length: approximately " + dna.targetWords + " words, minimum 700 words. Longer articles are acceptable when deeper analysis is useful.",
    "H2 headings: " + dna.h2Count,
    "Every article must include meaningful H2 headings for SEO structure. Use H2 headings naturally to separate major sections.",
    "Use a list: " + (dna.useList ? "yes, only if genuinely useful" : "no"),
    "Opening approach: " + dna.opening,
    "Structure: " + dna.structure,
    "Tone: " + dna.tone,
    "Ending: " + dna.closing,
    "",
    "STYLE RULES:",
    "- Write like an experienced financial journalist or analyst, not an academic textbook.",
    "- Vary sentence length and paragraph length naturally.",
    "- Do not force a standard introduction/body/conclusion structure.",
    "- Do not use generic AI phrases such as 'in today's rapidly changing landscape', 'it is important to note', 'experts believe', 'in conclusion', or 'key takeaway'.",
    "- Avoid repetitive transitions and formulaic section headings.",
    "- Use concrete reasoning and explain why developments matter.",
    "- Do not manufacture statistics, quotations, studies, companies, institutions, analyst comments, forecasts or case studies.",
    "- If a specific fact is not supported by the supplied source notes, keep the wording general rather than inventing evidence.",
    "- Do not pretend to have conducted research that was not supplied.",
    "- The article should contain real analysis, trade-offs and uncertainty where appropriate.",
    "",
    "OUTPUT:",
    "Return ONLY valid JSON.",
    "The JSON must contain exactly these fields:",
    '{"title":"...","excerpt":"...","content":"<p>...</p>"}',
    "",
    "The content must be valid HTML using only p, h2, ul, ol, li and strong tags."
  ].join("\n");
}

function generateFallbackContent(category, topic, editorialInput) {

  var humanView = editorialInput.humanView || "";

  var blocks = [

    "The conversation around " + topic + " has moved beyond short-term market reactions. While headlines often focus on immediate changes, the deeper impact usually depends on economic conditions, business decisions, investor expectations and how different groups respond over time.",

    "Understanding " + topic + " requires looking beyond the surface. Financial markets rarely move because of one single factor. Interest rates, consumer behavior, company strategies, regulation and global economic conditions can all influence how investors interpret the same development.",

    "For investors, the main challenge is separating temporary market sentiment from longer-term structural changes. A trend may attract significant attention, but popularity alone does not determine whether it creates sustainable value.",

    "A closer examination shows that opportunities and risks often develop together. Companies and investors that benefit from changing conditions may also face new challenges, including competition, higher costs, uncertainty and changing expectations.",

    "From a business perspective, decisions related to " + topic + " require balancing immediate performance with future positioning. Management teams must consider whether current changes represent a short-term adjustment or a deeper transformation.",

    "Consumers may experience the effects differently depending on their financial situation and personal priorities. Changes in markets and business models can influence spending decisions, saving behavior and expectations about future opportunities.",

    "One important factor is timing. Financial markets often react quickly because investors continuously update their expectations. However, the real economic impact may take much longer to appear as companies and consumers gradually adjust.",

    "Another consideration is valuation and risk management. Investors who focus only on potential upside may underestimate possible downside factors. A balanced approach requires examining both the opportunity and the assumptions behind the current market view.",

    "Different outcomes remain possible. A positive scenario could develop if businesses successfully adapt and demand remains strong. A more difficult environment could emerge if expectations become disconnected from actual results.",

    "The role of information is increasingly important. Investors have access to more data than ever before, but not all information provides meaningful insight. Understanding which signals matter is often more valuable than simply following market discussions.",

    "The competitive environment also deserves attention. Companies operating in changing markets need to improve efficiency, respond to customer needs and make strategic decisions that support long-term growth.",

    "Another key question is whether current developments create temporary excitement or represent a lasting shift. History shows that many financial trends experience periods of optimism followed by reassessment.",

    "From an investment perspective, uncertainty does not necessarily mean avoiding opportunities. Instead, uncertainty highlights the importance of evaluating assumptions, considering multiple scenarios and maintaining realistic expectations.",

    "The broader economic environment will continue to influence how " + topic + " develops. Factors such as policy decisions, consumer confidence and market conditions may determine whether current expectations are eventually confirmed.",

    humanView
      ? "Editorial perspective: " + humanView + " This viewpoint adds another layer to the discussion by showing why different participants may interpret the same development in different ways."
      : "Different market participants may reach different conclusions because they have different objectives, time horizons and levels of exposure.",

    "Looking ahead, the most useful indicators will be real-world evidence showing whether current assumptions are supported. Investors and businesses should monitor changes in demand, profitability, competition and broader economic conditions.",

    "The future path of " + topic + " will likely not follow a simple direction. Positive developments may create new opportunities, while unexpected challenges may change market expectations.",

    "The most valuable analysis comes from understanding both sides of the discussion. Recognizing potential benefits while remaining aware of limitations can help create a more balanced view.",

    "Market participants also need to consider how different economic cycles may influence the outcome. A strategy that works under one set of conditions may perform differently when interest rates, consumer demand or business confidence changes.",


    "Another important issue is adaptation. Companies that recognize changing conditions early often have more time to adjust their operations, while those that delay decisions may face greater pressure later.",


    "For long-term investors, the focus should remain on understanding business quality, competitive advantages and sustainable growth potential rather than reacting only to short-term market movements.",


    "As the discussion around " + topic + " continues, the most reliable conclusions will come from observing actual results instead of relying only on expectations or market sentiment.",

    "Ultimately, the importance of " + topic + " depends on how current developments translate into real economic outcomes. Careful observation, flexibility and thoughtful analysis remain essential as conditions continue to evolve.",

   "Investors and businesses should continue reviewing new evidence as conditions change. The ability to adjust assumptions, recognize new risks and identify emerging opportunities will remain an important advantage in an uncertain market environment."

  ];


   var html = "";

  blocks.forEach(function(text, index){

    if (index === 3 || index === 7 || index === 10) {
      html += "<h2>" + 
        [
          "Understanding the Bigger Picture",
          "What Investors Should Consider",
          "What Could Happen Next"
        ][index === 3 ? 0 : index === 7 ? 1 : 2]
        + "</h2>\n";
    }

    html += "<p>" + text + "</p>\n";

  });

  return html.trim();

}

function generateFromTemplate(category, editorialInput) {
  editorialInput = normalizeEditorialInput(editorialInput, category);

  var title = editorialInput.topic;
  var direction = editorialInput.direction;

var titlePatterns = [
  editorialInput.topic + ": What Investors Need to Understand",
  editorialInput.topic + ": The Shift Behind the Headlines",
  editorialInput.topic + ": Why This Trend Is Becoming Important",
  editorialInput.topic + ": The Forces Changing the Market",
  editorialInput.topic + ": Opportunities, Risks and What Comes Next",
  editorialInput.topic + ": The Bigger Picture Behind the Trend",
  editorialInput.topic + ": What Could Shape the Next Stage",
  editorialInput.topic + ": Why Businesses and Investors Are Paying Attention"
];

title = randomChoice(titlePatterns);

  var content = generateFallbackContent(
    category,
    editorialInput.topic,
    editorialInput
  );

  return {
    title: title.substring(0, 120),
    excerpt: ("A closer look at " + editorialInput.topic + " and the assumptions shaping the current debate.").substring(0, 200),
    topic: editorialInput.topic,
    content: content
  };
}

async function generateWithAI(category, editorialInput) {
  if (!CONFIG.openaiApiKey) return generateFromTemplate(category, editorialInput);

  editorialInput = normalizeEditorialInput(editorialInput, category);

  var dna = pickArticleDNA();
  var prompt = buildEditorialPrompt(category, editorialInput, dna);

  return new Promise(function(resolve) {
    var data = JSON.stringify({
      model: CONFIG.openaiModel || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an experienced financial editor. Think independently, challenge weak assumptions, synthesize human editorial input with your own analysis, and write natural contemporary English. Return only valid JSON."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.9,
      max_tokens: 2600
    });

    var options = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + CONFIG.openaiApiKey
      }
    };

    var req = https.request(options, function(res) {
      var body = "";

      res.on("data", function(chunk) {
        body += chunk;
      });

      res.on("end", function() {
        try {
          if (res.statusCode < 200 || res.statusCode >= 300) {
            throw new Error("OpenAI HTTP " + res.statusCode);
          }

          var resp = JSON.parse(body);

          if (!resp.choices || !resp.choices[0] || !resp.choices[0].message) {
            throw new Error("Invalid OpenAI response");
          }

          var raw = stripCodeFence(resp.choices[0].message.content);
          var parsed = JSON.parse(raw);

          parsed.title = String(parsed.title || "").substring(0, 120);
          parsed.excerpt = String(parsed.excerpt || "").substring(0, 200);
          parsed.content = sanitizeGeneratedHtml(parsed.content);

          if (!validateArticle(parsed)) {
            throw new Error("Generated article failed validation: " + countWords(parsed.content) + " words");
          }

          resolve({
            title: parsed.title,
            excerpt: parsed.excerpt,
            topic: editorialInput.topic,
            content: parsed.content
          });
        } catch (e) {
          console.warn("   AI generation failed, using fallback: " + e.message);
          resolve(generateFromTemplate(category, editorialInput));
        }
      });
    });

    req.on("error", function(err) {
      console.warn("   AI request failed, using fallback: " + err.message);
      resolve(generateFromTemplate(category, editorialInput));
    });

    req.setTimeout(45000, function() {
      req.destroy();
      console.warn("   AI request timed out, using fallback.");
      resolve(generateFromTemplate(category, editorialInput));
    });

    req.write(data);
    req.end();
  });
}
// ============================================
// Date Generation - �޸���������ʹ�õ�ǰ����
// �������������ʷ���ڣ�����ʹ�õ�ǰ����
// ============================================
function generateArticleDate() {
  var now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD ��ʽ����������
}

// ============================================
// ��������
// ============================================
function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function calculateReadingTime(content) {
  var words = content
    .replace(/<[^>]+>/g, ' ')
    .trim()
    .split(/\s+/)
    .length;

  return Math.max(1, Math.ceil(words / 200)) + " min read";
}

function generateKeywords(category, title) {
  return [
    category,
    title.split(' ').slice(0,3).join(' '),
    "market analysis",
    "business insights"
  ];
}
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
  // All base images used �� generate unique variant with random suffix
  var fallbackId = ids[attempt % ids.length];
  var uniqueUrl = 'https://images.unsplash.com/' + fallbackId + '?w=800&h=450&fit=crop&fm=webp&q=80&t=' + Date.now() + '&r=' + Math.random().toString(36).substr(2, 6);
  usedImages[uniqueUrl] = true;
  return uniqueUrl;
}

// ============================================
// ��������
// ============================================
// ============================================
// AI ����
// ============================================
// ============================================
// ��������
// ============================================
// ============================================
// V20 Content Cleaner
// Remove repetitive AI patterns
// ============================================
function cleanArticleContent(content) {
  if (!content) return '';

  return content    .replace(
      /The interesting part of .*? is not simply that .*?\./gi,
      ''
    )
    .replace(
      /That distinction matters because .*?\./gi,
      ''
    )
    .replace(
      /The editorial angle for this article is .*?\./gi,
      ''
    )
    .replace(
      /One reason the subject deserves a closer look is .*?\./gi,
      ''
    )
    .replace(/<p><p>/g, '<p>')
    .replace(/<\/p><\/p>/g, '</p>')
    .replace(
      /The practical question is not whether one financial rule works for everyone, but whether the decision fits[^.]*\./gi,
      ''
    )
    .replace(
      /The broader lesson is straightforward:[^.]*\./gi,
      ''
    )
    .replace(
      /There is also a behavioral side to the decision\./gi,
      ''
    )
    .replace(
      /It is important to note that/gi,
      ''
    )
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function generateArticle(existingIds, usedImages, category, editorialInput) {
  if (!category) category = randomChoice(CATEGORIES);
  var id;
  do { id = randomInt(100, 99999); } while (existingIds.indexOf(id) !== -1);
  var generated;
  if (CONFIG.useAI && CONFIG.openaiApiKey) {
    generated = await generateWithAI(category.id, editorialInput);
  } else {
    generated = generateFromTemplate(category.id, editorialInput);
  }
var articleDate = generateArticleDate();
var articleImage = getImageUrl(category.id, usedImages);
  return {
  id: id,

  category: category.id,

  title: generated.title,

  slug: createSlug(generated.title),

  metaTitle: generated.title + " | HelloInsights",

  metaDescription: generated.excerpt,

  keywords: generateKeywords(category.id, generated.title),

  excerpt: generated.excerpt,

  content: cleanArticleContent(generated.content),

  image: articleImage,

  readingTime: calculateReadingTime(generated.content),

  date: articleDate,

schema: {
  type: "Article",
  headline: generated.title,
  datePublished: articleDate,
  publisher: "HelloInsights",
  image: articleImage
    }
  };
}

// ============================================
// ������
// ============================================
/* ============================================
   V19 Editorial Queue
   ============================================ */
function loadEditorialQueue() {
  var queuePath = 'editorial-queue.json';

  if (!fs.existsSync(queuePath)) {
    return [];
  }

  try {
    var raw = fs.readFileSync(queuePath, 'utf8').replace(/^\uFEFF/, '');
    var queue = JSON.parse(raw);

    if (!Array.isArray(queue)) {
      console.warn('Warning: editorial-queue.json must contain an array.');
      return [];
    }

    return queue.filter(function(item) {
      return item && typeof item === 'object';
    });
  } catch (e) {
    console.warn('Warning: unable to read editorial-queue.json: ' + e.message);
    return [];
  }
}

function saveEditorialQueue(queue) {
  fs.writeFileSync(
    'editorial-queue.json',
    JSON.stringify(queue, null, 2) + '\n',
    'utf8'
  );
}

function findEditorialItem(queue, categoryId) {
  for (var i = 0; i < queue.length; i++) {
    var item = queue[i];

    if (!item.category || item.category === categoryId) {
      return {
        index: i,
        item: item
      };
    }
  }

  return null;
}

function describeEditorialInput(editorialInput) {
  if (!editorialInput) return 'automatic topic';

  return [
    editorialInput.topic || 'no topic',
    editorialInput.direction || 'no direction'
  ].join(' | ');
}
async function main() {
  console.log('\n?? HelloInsights Article Generator');
  console.log('================================');
  console.log('?? Mode: ' + (CONFIG.useAI ? 'AI-powered' : 'Template-based'));
  console.log('?? Generating ' + CONFIG.articlesPerRun + ' new articles per run\n');
  var existingArticles = [];
  var existingIds = [];

  // V18 archive source: article-data is the permanent source of truth.
  // Never rebuild the generator pool from truncated category files.
  var archiveDir = 'article-data';
  if (fs.existsSync(archiveDir)) {
    fs.readdirSync(archiveDir)
      .filter(function(name) { return /\.json$/i.test(name); })
      .forEach(function(name) {
        try {
          var fullPath = path.join(archiveDir, name);
          var article = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
          if (article && article.id) {
            existingArticles.push(article);
            existingIds.push(article.id);
          }
        } catch (e) {
          console.warn('   Warning: unable to read archive file ' + name);
        }
      });
  }

  console.log('?? Found ' + existingArticles.length + ' archived articles\n');
  console.log('? Generating new articles...\n');
  // ͼƬȥ�أ��ռ���������ʹ�ù���ͼƬ URL
  var usedImages = {};
  existingArticles.forEach(function(a) { if (a.image) usedImages[a.image] = true; });
  console.log('???  Found ' + Object.keys(usedImages).length + ' existing images to avoid\n');
  var newArticles = [];
  var editorialQueue = loadEditorialQueue();
  console.log('?? Editorial queue: ' + editorialQueue.length + ' item(s)');
  var today = generateArticleDate();

  function getWeekStart(dateString) {
    var d = new Date(dateString + 'T00:00:00Z');
    var day = d.getUTCDay();
    var diff = day === 0 ? -6 : 1 - day;
    d.setUTCDate(d.getUTCDate() + diff);
    return d.toISOString().split('T')[0];
  }

  var currentWeekStart = getWeekStart(today);
  var weeklyCounts = {};
  var dailyCounts = {};

  CATEGORIES.forEach(function(cat) {
    weeklyCounts[cat.id] = 0;
    dailyCounts[cat.id] = 0;
  });

  existingArticles.forEach(function(a) {
    if (!a.date || !a.category) return;
    if (getWeekStart(a.date) === currentWeekStart) {
      weeklyCounts[a.category] = (weeklyCounts[a.category] || 0) + 1;
    }
    if (a.date === today) {
      dailyCounts[a.category] = (dailyCounts[a.category] || 0) + 1;
    }
  });

  console.log('?? Current week: ' + currentWeekStart + ' to Sunday');
  console.log('?? Weekly category quota: max ' + CONFIG.articlesPerCategoryPerWeek + ' / category');
  console.log('?? Daily category quota: max ' + CONFIG.articlesPerCategoryPerDay + ' / category');

  for (var i = 0; i < CONFIG.articlesPerRun; i++) {
    var eligibleCategories = CATEGORIES.filter(function(cat) {
      return (weeklyCounts[cat.id] || 0) < CONFIG.articlesPerCategoryPerWeek &&
             (dailyCounts[cat.id] || 0) < CONFIG.articlesPerCategoryPerDay;
    });

    if (eligibleCategories.length === 0) {
      console.log('?? All category quotas are currently reached; no more articles generated.');
      break;
    }

    eligibleCategories.sort(function(a, b) {
      return (weeklyCounts[a.id] || 0) - (weeklyCounts[b.id] || 0);
    });

    // V19: prioritize queued human editorial input when its category is eligible.
    var selectedQueue = null;

    for (var q = 0; q < editorialQueue.length; q++) {
      var queueItem = editorialQueue[q];

      if (queueItem.category) {
        var queuedCategory = eligibleCategories.find(function(cat) {
          return cat.id === queueItem.category;
        });

        if (queuedCategory) {
          selectedQueue = {
            index: q,
            item: queueItem,
            category: queuedCategory
          };
          break;
        }
      } else {
        selectedQueue = {
          index: q,
          item: queueItem,
          category: eligibleCategories[0]
        };
        break;
      }
    }

    var category = selectedQueue
      ? selectedQueue.category
      : eligibleCategories[0];

    var editorialInput = selectedQueue
      ? selectedQueue.item
      : null;

    if (editorialInput) {
      console.log('Editorial: ' + describeEditorialInput(editorialInput));
    } else {
      console.log('Editorial: automatic topic');
    }

    var article = await generateArticle(
      existingIds,
      usedImages,
      category,
      editorialInput
    );

    newArticles.push(article);

    // Consume the queue item only after article generation succeeds.
    if (selectedQueue) {
      editorialQueue.splice(selectedQueue.index, 1);
      saveEditorialQueue(editorialQueue);
      console.log('Editorial queue remaining: ' + editorialQueue.length);
    }
    existingIds.push(article.id);
    weeklyCounts[category.id] = (weeklyCounts[category.id] || 0) + 1;
    dailyCounts[category.id] = (dailyCounts[category.id] || 0) + 1;

    console.log('   ' + (i + 1) + '. [' + article.category + '] ' + article.title + ' (' + article.date + ')');
    console.log('      Weekly quota: ' + weeklyCounts[category.id] + '/' + CONFIG.articlesPerCategoryPerWeek);
  }
  var allArticles = newArticles.concat(existingArticles);

  // �Ȱ����ڴ��µ������������������������
  // ���� maxArticles ʱ��ֻ��̭��ɵ����¡�
  allArticles.sort(function(a, b) {
    return b.date.localeCompare(a.date);
  });

  // Archive mode: never delete old articles; keep the complete article pool.
  var finalArticles = allArticles;
  var metadata = {
    lastUpdated: new Date().toISOString(),
    totalArticles: finalArticles.length,
    newToday: newArticles.length,
    generator: CONFIG.useAI ? 'AI (OpenAI)' : 'Template'
  };

  // No new articles: keep all generated files unchanged.
  if (newArticles.length === 0) {
    console.log('No new articles. Output files unchanged.');
    console.log('   Total: ' + finalArticles.length + ' articles');
    console.log('   New: 0');
    return;
  }

  // �汾�ţ�ʱ���������������ļ��� cache key
  var version = Date.now();
  // ============================================
  // 1. д�� articles-index.json
  //    �ṹ: { v, articles: {id: category}, ids: [�����ڽ�������] }
  // ============================================
  var articlesMap = {};
  finalArticles.forEach(function(a) { articlesMap[String(a.id)] = a.category; });
  var indexOutput = {
    v: version,
    articles: articlesMap,
    ids: finalArticles.map(function(a) { return a.id; })
  };
  fs.writeFileSync('articles-index.json', JSON.stringify(indexOutput, null, 2));
  console.log('\n? articles-index.json written (v=' + version + ', ' + finalArticles.length + ' articles)');
  // V18 archive write: persist every article as an individual full JSON file.
  // article-data is the permanent source of truth for future generator runs.
  if (!fs.existsSync('article-data')) fs.mkdirSync('article-data', { recursive: true });
  finalArticles.forEach(function(a) {
    fs.writeFileSync(path.join('article-data', String(a.id) + '.json'), JSON.stringify(a, null, 2));
  });
  console.log('? article-data archive written (' + finalArticles.length + ' articles)');

  // ============================================
  // 2. д�� 4 ������ļ�
  //    ÿ��: { articles: [�������¶���], metadata }
  //    �����Ѱ����ڽ�������
  // ============================================
  CATEGORIES.forEach(function(cat) {

  var catArticles = finalArticles.filter(function(a) {
    return a.category === cat.id;
  });

  catArticles.sort(function(a,b){
    return b.date.localeCompare(a.date);
  });


 var catOutput = {
  articles: catArticles.map(function(a) {

    return {
      id: a.id,
      category: a.category,
      title: a.title,
      slug: a.slug,
      metaTitle: a.metaTitle,
      metaDescription: a.metaDescription,
      keywords: a.keywords,
      excerpt: a.excerpt,
      image: a.image,
      author: a.author,
      readingTime: a.readingTime,
      date: a.date,
      content: a.content,
      schema: a.schema
    };

  }),
  metadata: metadata
};


  var filename = 'articles-' + cat.id + '.json';

  fs.writeFileSync(
    filename,
    JSON.stringify(catOutput,null,2)
  );

});
  console.log('\n? Done!');
  console.log('   New: ' + newArticles.length + ' articles');
  console.log('   Total: ' + finalArticles.length + ' articles');
  console.log('   Sort: by date descending (newest first)');
  console.log('   Output: articles-index.json + 4 category files\n');
}
main().catch(function(error) {
  console.error('? Error:', error.message);
  process.exit(1);
});

































