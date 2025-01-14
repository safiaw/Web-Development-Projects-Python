import express from "express";

const app = express();
const port = 3000;
app.use(express.static("public"));

app.get("/", (req,res) => {
   res.render("index.ejs");
});

app.get("/projects", (req,res) => {

});

app.get("/skills", (req,res) => {

});

app.listen(port, ()=>{
  console.log(`server listening on port ${port}`);
});


