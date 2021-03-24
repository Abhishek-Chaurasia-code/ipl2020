let request = require("request");
let cheerio=require("cheerio");
let fs=require("fs");
let path=require("path");

console.log("Directory of teams and files of players are being created");
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
    let status=selTool(".match-info.match-info-MATCH .description").text();
    let statusArr=status.split(",");
    let venue=statusArr[1].trim();
    let date=statusArr[2].trim();
    let sr=0;
    result=result.trim();

    for(let i=0;i<teamNameArr.length;i++){
         
        let teamName= selTool(teamNameArr[i]).text();
        teamName=teamName.split("INNINGS")[0];
        teamName=teamName.trim();
        teamArr.push(teamName);
        dirCreator(teamName);
    }

  
    let batsmantableArr= selTool(".table.batsman");
       // let k=0;
     for(let i=0;i<batsmantableArr.length;i++){
        let  k=0;
        let batsmanNameAnchor= selTool(batsmantableArr[i]).find("tbody tr .batsman-cell a");
        let namedetailsArr= selTool(batsmantableArr[i]).find("tbody tr");
        for(let j=0;j<batsmanNameAnchor.length;j++){

            let teamName=teamArr[i];
            let name=selTool(batsmanNameAnchor[j]).text();
            name=name.trim();
                
            let detailArr=selTool(namedetailsArr[k]).find("td");
                if(detailArr.length==8){
                    runs =selTool(detailArr[2]).text();
                           //console.log(runs)
                    balls=selTool(detailArr[3]).text();
                    fours=selTool(detailArr[5]).text();
                    sixes=selTool(detailArr[6]).text();
                    sr=selTool(detailArr[7]).text();
                    if(i==0){
                        opponent=teamArr[1];
                            }
                     else if(i==1){
                        opponent=teamArr[0];
                            }
                 }
                k=k+2;
                 

            creatorFile(name,teamName,venue,date,runs,balls,fours,sixes,sr,result,opponent);

             }
     }
    
}

function dirCreator(topicName){
    let pathOfFolder= path.join(__dirname,topicName);
    if(fs.existsSync(pathOfFolder)==false){
        fs.mkdirSync(pathOfFolder);
    }
}


function creatorFile(playerName,teamName,venue,date,runs,balls,fours,sixes,sr,result,opponent){
    let pathOfFile= path.join(__dirname,teamName,playerName +".JSON");

    if(fs.existsSync(pathOfFile)==true){
        let content= fs.readFileSync(pathOfFile);
        let json=JSON.parse(content);
        json.push({

            "Runs": runs,
            "Balls": balls,
            "Fours": fours,
            "Sixes": sixes,
            "SR":sr,
            "Date":date,
            "Venue":venue,
            "Result" : result,
            "Opponent Team": opponent

        });
        fs.writeFileSync(pathOfFile,JSON.stringify(json));
    }
  else if(fs.existsSync(pathOfFile)==false){
       
       writeFile(pathOfFile,venue,date,runs,balls,fours,sixes,sr,result,opponent);
      
     }
   
    
}


function writeFile(pathOfFile,venue,date,runs,balls,fours,sixes,sr,result,opponent){
    let arr=[];
    arr.push({
        "Runs": runs,
        "Balls": balls,
        "Fours": fours,
        "Sixes": sixes,
        "SR":sr,
        "Date":date,
        "Venue":venue,
        "Result" : result,
        "Opponent Team": opponent
    })

     fs.writeFileSync(pathOfFile,JSON.stringify(arr));

}
