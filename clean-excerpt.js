const fs = require("fs");
const path = require("path");

const dir = "./article-data";

fs.readdirSync(dir)
.filter(f => f.endsWith(".json"))
.forEach(file => {

    let filePath = path.join(dir,file);
    let article = JSON.parse(fs.readFileSync(filePath,"utf8"));

    if(article.excerpt){

        article.excerpt = article.excerpt
        .replace(
          /^A comprehensive look at (.+?) and why it matters in today's world\.?$/i,
          "$1 is becoming an important area of focus as businesses and consumers adapt to changing market conditions."
        );

    }

    fs.writeFileSync(
        filePath,
        JSON.stringify(article,null,2)
    );

});

console.log("Excerpt cleanup completed");