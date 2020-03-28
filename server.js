const express = require("express");
const logger = require("morgan");
const mongoose = require("mongoose");
const path = require("path");
const Promise = require("bluebird");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
const axios = require("axios");
const cheerio = require("cheerio");

// Require all models
const db = require("./models");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


const PORT = process.env.PORT || 3000;

// Initialize Express
const app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Set Handlebars.
const exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
const databaseUri = "mongodb://localhost/mongoScraper"

if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
}else{
    mongoose.connect(databaseUri)
}

// Show any mongoose errors
mongoose.connection.on("error", (error) => {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
mongoose.connection.once("open", () => {
    console.log("Mongoose connection successful.");
});

// Routes
app.get('/', (req,res) => {
    db.Article
      .find({})
      .then(articles => res.render('index', {articles, active: { home: true }}))
      .catch(err=> res.json(err))
});

app.get("/saved", (req,res) => {
    db.Article
      .find({})
      .populate("note")
      .then(articles => res.render('saved', {articles, active: { saved: true }}))
      .catch(err=> res.json(err))
});

app.get("/scrape",(req,res)=> {
  axios.get("https://untappd.com/beer/top_rated").then((response) => {
  const $ = cheerio.load(response.data)
  
  let options = $("#filter_picker").find("option[data-value-slug]").map(function(){return $(this).attr("data-value-slug");}).get();  
  return Promise.mapSeries(options, option => {      
      axios.get(`https://untappd.com/beer/top_rated?type=${option}`).then((response) => {
        const $ = cheerio.load(response.data)
    
        $("div.beer-details").each((i, element) => {

            const title = $(element).find("p.name").text()
            const link = $(element).find("a").attr("href")
            const author = $(element).find("p.style").eq(1).text()
            const beerId = link.split('/').pop()
            const description = $(element).find("p.desc").last().text()
            
            db.Article.create({
            beerId,
            title,
            link,
            author,
            description
            })
        })
      })
  })
  })
  .then(articles => res.render('index', {articles, active: { home: true }}))
  .catch(err => {
    console.log(err)
  })
})

app.delete("/clear", (req,res) => {
    db.Article
        .deleteMany({})
        .exec((err, doc) => {
            if (err) {
              console.log(err)
            }
            else {
              res.send(doc)
            }
        })
})

app.post("/save/:id", (req,res) => {
    db.Article
        .update({ _id: req.params.id }, { "saved": true})
        .exec((err, doc) => {
            if (err) {
              console.log(err)
            }
            else {
              res.send(doc)
            }
        })
        
})

app.post("/delete/:id", (req,res) => {
    db.Article
        .update({ _id: req.params.id }, { "saved": false})
        .exec((err, doc) => {
            if (err) {
              console.log(err)
            }
            else {
              res.send(doc)
            }
        })
        
})

app.post("/note/:id", (req,res) => {
    db.Note
        .create(req.body)
        .then((dbNote) => {
            console.log(dbNote)
            return db.Article.findOneAndUpdate({ _id: req.params.id }, {$push: {note: dbNote._id }}, { new: true })            
        })
        .then((dbArticle) => {            
            // If we were able to successfully update an Article, send it back to the client
            res.json(dbArticle)
          })
          .catch((err) => {
            // If an error occurred, send it to the client
            res.json(err)
          });
})

app.delete("/note-delete/:id", (req,res) => {
    db.Note
        .deleteOne({_id: req.params.id})
        .exec((err, doc) => {
            if (err) {
              console.log(err)
            }
            else {
              res.send(doc)
            }
        })
})




// Listen on port
app.listen(PORT, () => {
    console.log("App running on port " + PORT);
  });