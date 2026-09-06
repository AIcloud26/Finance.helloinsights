const fs = require("fs");
const path = require("path");

const patterns = [
  "A comprehensive look",
  "In today's rapidly changing",
  "It is important to note",
  "In conclusion",
  "experts believe",
  "This article",
  "This guide",
  "This overview",
  "In this article",
  "As we know",
  "The future of",
  "plays a crucial role",
  "key takeaway"
];

let count = 0;

const dir = "./article-data";

fs.readdirSync(dir)
.filter(f => f.endsWith(".json"))
.forEach(file => {

  const content = fs.readFileSync(
    path.join(dir,file),
    "utf8"
  );

  let hits=[];

  patterns.forEach(p=>{
    if(content.toLowerCase().includes(p.toLowerCase())){
      hits.push(p);
    }
  });

  if(hits.length){
    console.log(
      file,
      "=>",
      hits.join(", ")
    );
    count++;
  }

});

console.log("\nTotal suspicious articles:",count);