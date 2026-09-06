const fs = require("fs");
const path = require("path");

const dir = "./article-data";

let updated = 0;

fs.readdirSync(dir)
.filter(f => f.endsWith(".json"))
.forEach(file => {

    const filePath = path.join(dir,file);

    let data = JSON.parse(
        fs.readFileSync(filePath,"utf8")
    );


    let old = JSON.stringify(data);


    function clean(text){

        if(!text) return text;


        return text
        .replace(
          /This article (explores|examines|provides|looks at|discusses)/gi,
          ""
        )
        .replace(
          /This guide (explains|covers|explores|provides)/gi,
          ""
        )
        .replace(
          /The future of/gi,
          ""
        )
        .replace(
          /A comprehensive look at/gi,
          ""
        )
        .replace(
          /In today's rapidly changing world/gi,
          ""
        )
        .replace(
          /It is important to note that/gi,
          ""
        )
        .replace(
          /In conclusion,/gi,
          ""
        )
        .replace(
          /experts believe/gi,
          "market observers"
        )
        .trim();

    }


    if(data.title)
        data.title = clean(data.title);


    if(data.excerpt)
        data.excerpt = clean(data.excerpt);


    if(data.content)
        data.content = clean(data.content);



    let now = JSON.stringify(data);


    if(old !== now){

        fs.writeFileSync(
            filePath,
            JSON.stringify(data,null,2)
        );

        console.log("Updated:",file);

        updated++;
    }

});


console.log("\nTotal updated:",updated);