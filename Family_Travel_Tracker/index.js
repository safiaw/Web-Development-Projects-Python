import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "mpglp@SQL24",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


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
     });

  });
}

let currentUserId = 1;
// on home screen, show all users's tab with its name and color. show first user countries visited in map. 
app.get("/", async (req, res) => {
  const query1 = {
     text: "select * from users",
     values: [],
  };
  let users  = await queryDB(query1);
  //console.log(users);
  const query2 = {
    text: "select c.country_code, u.color from visited_countries vc join users u on vc.user_id = u.id join countries c on vc.country_id=c.id where u.id=$1;",
    values: [currentUserId],
  };
  const result  = await queryDB(query2);
  let countries = [];
  result.rows.forEach((row) => {
    countries.push(row.country_code);
  });
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: users.rows,
    color: users.rows[currentUserId-1].color,
  });
});

// when a particular user add a new country in its visited list
app.post("/add", async (req, res) => {
  const country = req.body.country;
  try {
    const result = await db.query(
      "SELECT id FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [country.toLowerCase()]
    );
    const countryId = result.rows[0].id;
    try {
      await db.query(
        "INSERT INTO visited_countries (country_id, user_id) VALUES ($1,$2)",
        [countryId, currentUserId]
      );
      res.redirect("/");
    } catch (err) {
      console.log(err);
      res.render("index.ejs",{error: "Country name already exist. Please add another name and try again."});
    }
  } catch (err) {
    console.log(err);
    res.render("index.ejs",{error: "Country name do not exist. Please check the name and try again."});
  }
});

// when click on a particular user, fetch all its countries visited and its color
app.post("/user", async (req, res) => {
  if (req.body.add){ 
    res.render("new.ejs");
  }
  if (req.body.user){
  currentUserId = parseInt(req.body.user);
  res.redirect("/");
  }
});

//  whena new user is added, add its details in db
app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  const userName = req.body.name;
  const userColor = req.body.color;
  const query = {
    text: "insert into users (name,color) values($1,$2) returning id",
    values: [userName, userColor],
  };
  const userId = await queryDB(query);
  console.log(userId.rows[0].id);
  currentUserId = parseInt(userId.rows[0].id);
  res.redirect("/");

});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});


