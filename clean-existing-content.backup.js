const fs = require("fs");

const files = [
  "articles-finance.json",
  "articles-technology.json",
  "articles-ai-tools.json",
  "articles-health-lifestyle.json"
];


// ============================================
// V20.6 AI Pattern Cleaner
// Remove repeated AI writing fingerprints
// ============================================

function cleanArticleContent(content) {

  if (!content) return "";

  let text = content;


  const rules = [

    // Generic AI openings
    [
      /Recent changes in this area are creating new opportunities and challenges for investors, companies and consumers\./gi,
      "Recent developments are changing how companies, markets and consumers approach this issue."
    ],

    [
      /Recent developments in .*? have created new questions for investors, businesses and consumers\. The important issue is understanding what has changed and why it matters now\./gi,
      "Recent developments are changing expectations across the market, but the bigger question is how these changes will influence future decisions."
    ],


    // AI explanation patterns

    [
      /The important issue is understanding what has changed and why it matters now\./gi,
      ""
    ],

    [
      /Several factors are shaping this trend, including economic conditions, market expectations and changing user behavior\./gi,
      "The shift is being influenced by economic conditions, company strategies and changing expectations."
    ],


    [
      /A closer look suggests that the biggest opportunities and risks are often found beyond the obvious headlines\. Understanding these less visible factors can help readers make better decisions\./gi,
      "The most important factors are often found beneath the headline, where the real opportunities and risks become clearer."
    ],


    [
      /There is no fixed human conclusion here, which leaves room to test several interpretations rather than forcing the story toward a predetermined answer\./gi,
      "The market response remains open to interpretation, with different outcomes depending on how conditions develop."
    ],


    [
      /The outcome remains uncertain, and different scenarios could lead to different results\./gi,
      "Several possible outcomes remain possible as companies and consumers adjust."
    ],


    [
      /Investors can respond quickly to new information, while businesses and consumers may take months or years to adjust their decisions\./gi,
      "Markets often react immediately, while the broader economic impact usually appears over a longer period."
    ],


    [
      /For investors, the practical issue is therefore less about predicting one exact outcome and more about identifying which assumptions matter most\./gi,
      "For investors, the key question is which assumptions behind the current trend are most likely to change."
    ],


    [
      /The same logic applies to businesses and consumers\. Financial conditions influence spending, financing decisions and risk tolerance, while companies have to decide whether a change is temporary or structural before committing capital\./gi,
      "Businesses and consumers face different decisions depending on costs, demand and confidence levels."
    ],


    [
      /What happens next will depend on evidence rather than headlines\. The most useful signals are likely to be the ones that test the assumptions behind the current narrative rather than simply confirming it\./gi,
      "Future developments will depend on whether real-world results support current expectations."
    ],


    [
      /That leaves a reasonable amount of uncertainty\. And in finance, uncertainty is not necessarily a reason to ignore a story\. It is often the reason to examine it more carefully\./gi,
      "The remaining uncertainty makes careful analysis more important than relying on simple conclusions."
    ],


    // Remove duplicated paragraphs

  ];


  rules.forEach(rule=>{
    text=text.replace(rule[0],rule[1]);
  });


  // remove duplicate paragraphs

  let paragraphs=text
    .split("</p>")
    .map(x=>x.trim())
    .filter(Boolean);


  let seen={};

  paragraphs=paragraphs.filter(p=>{

    let key=p.toLowerCase();

    if(seen[key]){
      return false;
    }

    seen[key]=true;
    return true;

  });


  return paragraphs
    .map(p=>{
      if(!p.endsWith("</p>")) p+="</p>";
      return p;
    })
    .join("\n");

}



// ============================================
// Process files
// ============================================


files.forEach(file=>{


  if(!fs.existsSync(file)){
    console.log("Skip:",file);
    return;
  }


  let data=require("./"+file);

  let count=0;


  data.articles.forEach(article=>{


    let old=article.content;

    let clean=cleanArticleContent(old);


    if(old!==clean){

      article.content=clean;
      count++;

    }


  });



  fs.writeFileSync(
    file,
    JSON.stringify(data,null,2),
    "utf8"
  );


  console.log(file+" changed:",count);


});


console.log("V20.6 CONTENT CLEANER DONE");