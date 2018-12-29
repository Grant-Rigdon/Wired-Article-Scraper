var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var path = require("path");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;


var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({
    defaultLayout: "main",
    partialsDir: path.join(__dirname, "/views/layouts/partials")
}));
app.set("view engine", "handlebars");

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/mongoScraper", { useNewUrlParser: true });

// Show any mongoose errors
mongoose.connection.on("error", function(error) {
    console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
mongoose.connection.once("open", function() {
    console.log("Mongoose connection successful.");
});

// Routes
app.get('/', (req,res) => {
    db.Article
      .find({})
      .then(articles => res.render('index', {articles, active: { home: true }}))
      .catch(err=> res.json(err));
});

app.get("/saved", (req,res) => {
    db.Article
      .find({})
      .then(articles => res.render('saved', {articles, active: { saved: true }}))
      .catch(err=> res.json(err));
});

app.get("/scrape",function(req,res) {
    axios.get("https://www.wired.com").then(function(response){
    var $ = cheerio.load(response.data);

       

    $("li.post-listing-list-item__post").each(function(i, element) {

        var title = $(element).find("h5.post-listing-list-item__title").text()
        var link = $(element).find("a").attr("href")
        var author = $(element).find("span.byline-component__content").text()
        
        db.Article.create({
        title: title,
        link: link,
        author: author
        })
    })
    })
    .then(articles => res.render('index', {articles, active: { home: true }}))

})

app.delete("/clear", (req,res) => {
    db.Article
        .deleteMany({})
        .exec((err, doc) => {
            if (err) {
              console.log(err);
            }
            else {
              res.send(doc);
            }
        })
})

app.post("/save/:id", (req,res) => {
    db.Article
        .update({ "_id": req.params.id }, { "saved": true})
        .exec((err, doc) => {
            if (err) {
              console.log(err);
            }
            else {
              res.send(doc);
            }
        })
        
})

app.post("/delete/:id", (req,res) => {
    db.Article
        .update({ "_id": req.params.id }, { "saved": false})
        .exec((err, doc) => {
            if (err) {
              console.log(err);
            }
            else {
              res.send(doc);
            }
        })
        
})




// Listen on port
app.listen(PORT, function() {
    console.log("App running on port " + PORT);
  });