const fs = require("fs");
const path = require("path");

const files = [
"19639.json",
"31986.json",
"39076.json",
"47228.json",
"49121.json",
"51249.json",
"64790.json",
"66466.json",
"85576.json",
"88082.json"
];

files.forEach(file=>{

const p="./article-data/"+file;

let data=JSON.parse(fs.readFileSync(p,"utf8"));

function clean(str){

if(!str) return str;

return str
.replace(/This article (explores|examines|provides|offers|looks at)/gi,"")
.replace(/This article/gi,"")
.trim();

}

data.title=clean(data.title);
data.excerpt=clean(data.excerpt);
data.content=clean(data.content);

fs.writeFileSync(
p,
JSON.stringify(data,null,2),
"utf8"
);

console.log("Updated:",file);

});