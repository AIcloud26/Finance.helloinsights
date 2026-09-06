const fs = require("fs");

const files = [
  "articles-finance.json",
  "articles-technology.json",
  "articles-ai-tools.json",
  "articles-health-lifestyle.json"
];


// ============================================
// V21 Content Quality Cleaner
// Remove AI fingerprints
// Do NOT replace with generic AI text
// ============================================

function cleanArticleContent(content) {

  if (!content) return "";

  let text = content;


  // Remove obvious AI filler sentences
  const removePatterns = [

    /Recent developments are changing how companies, markets and consumers approach this issue\./gi,

    /Recent developments are changing expectations across the market, but the bigger question is how these changes will influence future decisions\./gi,

    /The trend is influenced by multiple forces, including economic conditions, business decisions and changing expectations across the market\./gi,

    /The shift is being influenced by economic conditions, company strategies and changing expectations\./gi,

    /The most important details are often found beyond the headline, where potential opportunities and risks become clearer\./gi,

    /The most important factors are often found beneath the headline, where the real opportunities and risks become clearer\./gi,

    /Several possible outcomes remain possible as companies and consumers adjust\./gi,

    /Markets often react immediately, while the broader economic impact usually appears over a longer period\./gi,

    /A broader trend should be evaluated carefully rather than treated as a simple market signal\./gi,

    /Another perspective is worth considering\./gi,

    /A market can appear overly confident without being completely wrong\./gi,

    /The remaining uncertainty makes careful analysis more important than relying on simple conclusions\./gi,

    /Future developments will depend on whether real-world results support current expectations\./gi

  ];


  removePatterns.forEach(pattern=>{
    text=text.replace(pattern,"");
  });



  // Remove prompt leakage

  const promptLeakPatterns=[

    /Start with a specific market observation or real-world context\./gi,

    /Avoid generic introductions\./gi,

    /Write an article about/gi,

    /You are a senior financial journalist/gi

  ];


  promptLeakPatterns.forEach(pattern=>{
    text=text.replace(pattern,"");
  });



  // Clean empty paragraphs

  let paragraphs=text
    .split("</p>")
    .map(x=>x.trim())
    .filter(Boolean);



  // Remove duplicates

  const seen={};


  paragraphs=paragraphs.filter(p=>{

    let key=p
      .replace(/<[^>]+>/g,"")
      .trim()
      .toLowerCase();


    if(!key){
      return false;
    }


    if(seen[key]){
      return false;
    }


    seen[key]=true;

    return true;

  });



  return paragraphs
    .map(p=>{
      if(!p.endsWith("</p>")){
        p+="</p>";
      }
      return p;
    })
    .join("\n");

}



// ============================================
// Process JSON files
// ============================================

files.forEach(file=>{

  if(!fs.existsSync(file)){
    console.log("Skip:",file);
    return;
  }


  let data=JSON.parse(
    fs.readFileSync(file,"utf8")
  );


  let count=0;


  if(Array.isArray(data.articles)){

    data.articles=data.articles.map(article=>{

      if(article.content){

        article.content=cleanArticleContent(
          article.content
        );

        count++;

      }

      return article;

    });

  }



  fs.writeFileSync(
    file,
    JSON.stringify(data,null,2),
    "utf8"
  );


  console.log(
    "Cleaned:",
    file,
    "Articles:",
    count
  );


});


console.log("Content cleaning completed.");