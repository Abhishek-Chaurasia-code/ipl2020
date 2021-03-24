let request = require("request");
let cheerio=require("cheerio");
let fs=require("fs");
let path=require("path");

console.log("Before");
let url="https://www.espncricinfo.com/series/ipl-2020-21-1210595";
let resurl=url+"/match-results"
request(resurl,cb);

function cb(err,response,html){
    if(err){
        console.log(err);
    }
    else{
        extractData(html);
    }
}

function extractData(html){
    let selTool=cheerio.load(html);
    let linkArr=selTool(".btn.btn-sm.btn-outline-dark.match-cta")
    
    for(let i=2;i<linkArr.length;i=i+4){
       // c++;
        let scoreLink=selTool(linkArr[i]).attr("href");
        //console.log(scoreLink);
        let fullLink="https://www.espncricinfo.com/"+scoreLink;
        processScorePage(fullLink)
    }

}

function processScorePage(link){
    request(link,cb);

    function cb(err,response,html){
        if(err){
            console.log(err);
        }
        else{
            extractScore(html);
        }
    }

}

function extractScore(html){
    let selTool=cheerio.load(html);
    let teamNameArr=selTool(".Collapsible h5");
    let teamArr=[];
    let runs =0;
    let balls=0;
    let fours=0;
    let sixes=0;
    let opponent="";
    let result=selTool(".event .status-text span").text()
    result=result.trim();

    for(let i=0;i<teamNameArr.length;i++){
         
        let teamName= selTool(teamNameArr[i]).text();
        teamName=teamName.split("INNINGS")[0];
        teamName=teamName.trim();
        teamArr.push(teamName);
        dirCreator(teamName);
    }

  
        let batsmantableArr= selTool(".table.batsman");
        for(let i=0;i<batsmantableArr.length;i++){
              let batsmanNameAnchor= selTool(batsmantableArr[i]).find("tbody tr .batsman-cell a");
             for(let j=0;j<batsmanNameAnchor.length;j++){
                 let teamName=teamArr[i];
                  let name=selTool(batsmanNameAnchor[j]).text();
                  name=name.trim();
                  let namedetailsArr= selTool(batsmantableArr[i]).find("tbody tr");
                  for(let k=0;k<namedetailsArr.length;k++){

                    let detailArr=selTool(namedetailsArr[k]).find("td");
                     if(detailArr.length==8){
                            runs =selTool(detailArr[2]).text();
                           //console.log(runs)
                            balls=selTool(detailArr[3]).text();
                            fours=selTool(detailArr[5]).text();
                            sixes=selTool(detailArr[6]).text();
                            if(i==0){
                                opponent=teamArr[1];
                            }
                            else if(i==1){
                                opponent=teamArr[0];
                            }
                      }
                  }

                  creatorFile(name,teamName,runs,balls,fours,sixes,result,opponent);

             }
        }
    

    
}

function dirCreator(topicName){
    let pathOfFolder= path.join(__dirname,topicName);
    if(fs.existsSync(pathOfFolder)==false){
        fs.mkdirSync(pathOfFolder);
    }
}


function creatorFile(playerName,teamName,runs,balls,fours,sixes,result,opponent){
    let pathOfFile= path.join(__dirname,teamName,playerName +".JSON");

     if(fs.existsSync(pathOfFile)==false){
         let createStream=fs.createWriteStream(pathOfFile);
        createStream.end();
        writeFile(pathOfFile,runs,balls,fours,sixes,result,opponent)
       
      }
    
    else if(fs.existsSync(pathOfFile)==true){
        let content= fs.readFileSync(pathOfFile);
        content=content.toString();
        let json=JSON.parse(content);
        json.push({
         "Result" : result,
        "Opponent Team": opponent,
        "Runs": runs,
        "Balls": balls,
        "Fours": fours,
        "Sixes": sixes

        });
        fs.writeFileSync(pathOfFile,JSON.stringify(json));
       // fs.appendFileSync(pathOfFile,JSON.stringify(json));//dont use append use wrieFileSync
    }
  /* else if(fs.existsSync(pathOfFile)==false){
       // let createStream=fs.createWriteStream(pathOfFile);
        //createStream.end();
       writeFile(pathOfFile,runs,balls,fours,sixes,result,opponent)
      
     }
    */
}


function writeFile(pathOfFile,runs,balls,fours,sixes,result,opponent){
    let arr=[];
    arr.push({
        "Result" : result,
        "Opponent Team": opponent,
        "Runs": runs,
        "Balls": balls,
        "Fours": fours,
        "Sixes": sixes
    })

     fs.writeFileSync(pathOfFile,JSON.stringify(arr));



}
