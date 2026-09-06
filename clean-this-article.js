const fs = require("fs");
const path = require("path");

const dir = "./article-data";

let count = 0;

fs.readdirSync(dir)
.filter(f => f.endsWith(".json"))
.forEach(file => {

    const p = path.join(dir,file);

    let data = fs.readFileSync(p,"utf8");

    let old = data;

    data = data.replaceAll(
        "This article",
        "This analysis"
    );

    data = data.replaceAll(
        "This guide",
        "This overview"
    );

    if(data !== old){
        fs.writeFileSync(p,data);
        console.log("Updated:",file);
        count++;
    }

});

console.log("Total updated:",count);