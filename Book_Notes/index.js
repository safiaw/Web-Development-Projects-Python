import express, { query } from "express";
import pg from "pg";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";

const app = express();
const port = 3000;
const saltRounds = 10;

const db = new pg.Client({
   user: "postgres",
   host: "localhost",
   database: "booknotes",
   password: "mpglp@SQL24",
   port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));


async function queryDB(queryObj){

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
let currentUserId = 0;
let users = [{
    id:1,
    name: 'Wahdat Safia',
    email: 'wahdat.safia@gmail.com',
    
}];
let books = [{

    isbn: '978-0123-189-234',
    title: 'Harry Potter - Goblet of Fire',
    author: 'J.K. Rowling',
    summary: 'A wizarding world best portrayed this time with another series of tails and adventure rolling in. The new Hogwarts challenges assigned to Harry was best carried out under the  guidance of professor Dumbledore.',
    rating: 8,
    read_date: 'Aug 12, 2023',
    review: 'A wizarding world best portrayed this time with another series of tails and adventure rolling in. The new Hogwarts challenges assigned to Harry was best carried out under the  guidance of professor Dumbledore.',
    cover_url:'https://covers.openlibrary.org/b/isbn/0385472579-M.jpg',
    amazon_url:'https://amazon.com/',
},{
    isbn: '978-0123-189-897',
    title: 'Harry Potter - Prisoners of Azkaban',
    author: 'J.K. Rowling',
    summary: 'A wizarding world best portrayed this time with another series of tails and adventure rolling in. The new Hogwarts challenges assigned to Harry was best carried out under the  guidance of professor Dumbledore.',
    rating: 8,
    read_date: 'Aug 12, 2023',
    review: 'A wizarding world best portrayed this time with another series of tails and adventure rolling in. The new Hogwarts challenges assigned to Harry was best carried out under the  guidance of professor Dumbledore.',
    cover_url:'https://covers.openlibrary.org/b/isbn/0385472579-M.jpg',
    amazon_url:'https://amazon.com/',
},
{
    isbn: '978-0123-189-389',
    title: 'Harry Potter - The socceres stone',
    author: 'J.K. Rowling',
    summary: 'A wizarding world best portrayed this time with another series of tails and adventure rolling in. The new Hogwarts challenges assigned to Harry was best carried out under the  guidance of professor Dumbledore.',
    rating: 8,
    read_date: 'Aug 12, 2023',
    review: 'A wizarding world best portrayed this time with another series of tails and adventure rolling in. The new Hogwarts challenges assigned to Harry was best carried out under the  guidance of professor Dumbledore.',
    cover_url:'https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1655988385l/40121378._SY500_.jpg',
    amazon_url:'https://amazon.com/',
}];

let sortBy = 'title';
let order = 'desc';

// get all books read and reviews written by the current user from the database
app.get("/", async(req,res)=>{

    // get all users and their books list along with reviews
    // this includes without add, edit and delete button
    const result = await queryDB({text:"select id,name,email from users", values:[]});
    users = result.rows;

    if (currentUserId > 0){
      const user = users.find((currUser) => currUser.id === currentUserId);
      users = user;
      console.log(user);
    }
   
    console.log(users[0].id);
    res.render("index.ejs",{users: users, books:});
});

app.post("/user", (req, res)=>{

   if (req.body.user){
    currentUserId = parseInt(req.body.user);
   }
   res.redirect("/");
});

// get current user books list and their reviews
app.get("/:currUserId", async (req,res)=>{

        // the current user detail 
        const user = users.find((currUser) => currUser.id === currentUserId);
        console.log(user);
        // all book details and their reviews and its rating read by the above user
        const bookDetails = await queryDB({
            text: `select b.isbn, b.title as title, b.author, b.summary, b.cover_url, b.amazon_url, r.review, r.rating as rating, r.create_date as read_date from books b join reviews r on r.book_id = b.isbn where b.isbn in (select book_id from user_book where user_id = $1) order by ${sortBy} ${order}`,
            values: [currentUserId]
        });
        console.log(bookDetails.rows);
        // render all these datails into the index.ejs 
        res.render("index.ejs",{user: user, books: bookDetails.rows});

});
app.post("/user", (req,res)=>{
   if(req.body.all){
      res.redirect("/all");
   }
   if (req.body.currentUser){
        currentUserId = parseInt(req.body.currentUser);
        res.redirect(`/${currentUserId}`);
   }
});
app.get("/new/:userId",(req,res)=>{
    currentUserId = parseInt(req.params.userId);
    res.render("new.ejs",{heading: "Add a new book and its review", submit: "Create the book review"});
});

app.get("/edit/:id", async(req,res)=>{
    const bookId = req.params.id;
    const reviewRes = await queryDB({
        text: "select isbn, title, author, summary, cover_url, amazon_url, review, rating from books join reviews on reviews.book_id = books.isbn where books.isbn = $1",
        values: [bookId]
    });
    console.log(reviewRes.rows);
    res.render("new.ejs", {heading: "Edit the book review", review:reviewRes.rows[0], submit:" Submit the updated book review"});
});
// create a new book review - render a new form which takes the following book details
// isbn, title, author, summary, rating, read_date, review, amazon_url, cover_url
// For later work: put the isbn and fetch rest of the book details from a public api and fill them in the respective form fields
// user will just enter his rating, read_date, and review for the book
// user will click on submit the new book review
// The submit post request will come on the server on path /new
// the server will then store all the form fields by fetching from its request body and saving them in the database
// after successfully adding the new record into the database redirect to re render the index.ejs file with the added new book review of the current user
app.post("/new", async(req,res)=>{
    // create a new book record in books table
    const bookRec = await queryDB({
        text: "insert into books(isbn, title, author, summary, cover_url, amazon_url) values($1,$2,$3,$4,$5,$6) returning isbn",
        values: [req.body.isbn, req.body.title, req.body.author, req.body.summary, req.body.coverUrl, req.body.amazonUrl]
    });

    // create the book review record in reviews table
    await queryDB({
        text: "insert into reviews(review, rating, create_date, update_date, book_id) values($1,$2,$3,$4,$5)",
        values: [req.body.review, parseInt(req.body.rating), new Date(), new Date(), req.body.isbn]
    });
    // create a user book record in user_book table
    await queryDB({
        text: "insert into user_book(user_id, book_id) values($1,$2)",
        values: [currentUserId, bookRec.rows[0].isbn]
    });
    res.redirect("/");

});

// edit an existing book review, partially update its content
app.post("/edit/:id", async(req,res)=>{
    const bookId = req.params.id;
    await queryDB({
        text: "update reviews set rating=$1, review=$2, update_date=$3 where book_id=$4",
        values: [req.body.rating, req.body.review, new Date(), bookId]
    });
    res.redirect("/");

});

// delete an existing book review
app.post("/delete/:user_id/:book_id",async(req,res)=>{
    console.log("Deleting the book detail!!!!");
    console.log(req.params);
    const userId = req.params.user_id;
    const bookId = req.params.book_id;
    try {
    // delete record from user_book table - user want to remove this book
    await queryDB({
       text: "delete from user_book where user_id = $1 and book_id = $2",
       values: [userId, bookId]
    });
    // delete the book review
    await queryDB({
      text: "delete from reviews where book_id=$1",
      values: [bookId]
    });
    res.redirect("/");    
    } catch (error) {
    res.status(500).json({message:"Error deleting book details"});
    }
   
});

// sort all books on home page by their title, read date, or rating
app.get("/books/:sortby", (req,res)=>{
   sortBy = req.params.sortby;
   console.log(sortBy);
   res.redirect("/");
});

app.get("/login",(req,res)=>{
    res.render("login.ejs");
});

app.get("/signup", (req,res)=>{
    res.render("signup.ejs");
});

app.post("/login",async (req,res)=>{
   const email = req.body.email;
   const plainPassword = req.body.password;
   try {
    const checkResult = await queryDB({
        text: "select * from users where email=$1",
        values: [email]
    });
    if (checkResult.rows.length > 0){
       const resulthash = await queryDB({
         text: "select passhash,id as userId from users where email=$1",
         values: [email]
       });
       bcrypt.compare(plainPassword, resulthash.rows[0].passhash, function(err, result) {
        // result == true
        if(err){
           console.log(err);
        }
        else{
            if (result == true){
                currentUserId = parseInt (resulthash.rows[0].userId);
                res.redirect("/");
            }
            else {
                res.send("Incorrect password!");
            }
        }
     
    });

    }
    else {
        res.send(" User not found. Email address do not exist");
    }
   } catch (error) {
    console.log(error);
   }
});

app.post("/signup", async (req,res)=>{
   const username = req.body.fullname;
   const email = req.body.email;
   const plainPassword = req.body.password;

   try {
    await bcrypt.genSalt(saltRounds, async function(err, salt) {
        if (err){
          console.log(err);
        }
        else{
            await bcrypt.hash(plainPassword, salt, async function(err, hash) {
                // Store hash in your password DB.
                if (err){
                   console.log(err);
                }
                else {
                    const userId = await queryDB({
                        text: "insert into users(name, email, salt, passhash) values($1,$2,$3,$4) returning id",
                        values:[username, email, salt, hash]
                    });
                    currentUserId = parseInt(userId);
                    res.redirect("/");
                }
            });
        }
        
    });
    
   } catch (error) {
    console.log(error);
   }
});

// server listening on port 3000
app.listen(port, ()=>{
   console.log(`Server listening on port ${port}`);
});
