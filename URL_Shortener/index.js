import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import {check, validationResult} from "express-validator";


const app = express();
const port = 3000;


const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "urlshortener",
    password: "mpglp@SQL24",
    port: 5432,
});


//connect to database
db.connect();

//middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(express.json());

// GET home page
app.get("/", (req,res) => {
    console.log("Routing path /");
    res.render("index.ejs");
});

// POST - shorten the big url
app.post("/shorten", [check('enteredURL', 'The url is not valid').isURL()], async function(req,res){
   
    console.log("Routing path /Shorten");
    var bigURL = req.body.enteredURL;
    console.log("Big url", bigURL);

    // validate url
    const result = validationResult(req);
    // if url is valid
    if (result.isEmpty()){
    // check if the original url exists in the db
    const query = {
        text: "select shortURL from url where bigURL=$1",
        values: [bigURL],
    }
    const queryRes = await queryDB(query);

    console.log("Big url already exists", queryRes);
     // if original url do not exists in db
    if (queryRes.rowCount === 0){
        // encode original url and store in db in a new entry
        // return the short url
        var shortURL = encodeURL(bigURL);
        const query = {
            text: "insert into url (id,bigURL,shortURL,clicks) values(DEFAULT,$1,$2,$3)",
            values: [bigURL,shortURL,0],
        }
        const queryRes = await queryDB(query);
        console.log("Created a new entry into db", queryRes);
        var shortUrlStr = "http://localhost:3000/"+shortURL;
        res.render("index.ejs", {shortURL:shortUrlStr});
     }
    // if the original url exists in db
    // query the db to get its corresponding short url
    else{
        console.log("The corresponding short url already exists: ", queryRes.rows[0].shorturl);
        var shortUrlStr = "http://localhost:3000/"+ queryRes.rows[0].shorturl;
        res.render("index.ejs", {shortURL: shortUrlStr});
    }


    }
    else {
    // if url is not valid
    console.log(result.array());
    res.render("index.ejs",{errors: result.array()});
    }
    //res.render("index.ejs");
});

// app listening on port 3000
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`)
});


// redirect short url to its original big url page
app.get("/:shortURL([A-Za-z0-9=+\/]{8})",async (req,res)=>{
    console.log("Routing path /shrt.url/");
    console.log(req.params);
    var shortURL = req.params.shortURL;
    console.log(shortURL);
    //const shorturlStr = "http://localhost:3000/shrt.url/"+shortURL;
   
    const query1 = {
        text: "update url set clicks = clicks + 1 where shortURL=$1",
        values: [shortURL],
    };
    const query2 = {
        text: "select bigURL from url where shortURL=$1",
        values: [shortURL],

    };
   
    const queryRes1 = await queryDB(query1);
    const queryRes2 = await queryDB(query2);
    console.log(queryRes2.rows[0].bigurl);
    res.redirect(queryRes2.rows[0].bigurl);
});

async function queryDB(queryObj){
    
    //var queryRes;
    console.log(queryObj.text, queryObj.values);

    return new Promise((resolve,reject)=>{
        db.query(queryObj, (err, res) => {
        if (err) {
            console.log("Error executing query: ", err.stack);
            reject(err);
        }
        else {
            console.log(res.rows);
            //queryRes = res.rows;
            resolve(res);
        }
        //db.end();
       });
  
    });
}

function encodeURL(bigURL){
    var urlObject = new URL(bigURL);
    var strToEncode = Date.now() + urlObject.host + urlObject.pathname; 
    var base64Str = Buffer.from(strToEncode).toString('base64',9,14);

    return base64Str;
}