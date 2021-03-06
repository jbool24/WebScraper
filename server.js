// Dependencies
const path        = require("path");
const express     = require("express");
const logger      = require("morgan");
const request     = require("request");
const cheerio     = require("cheerio");
const mongoose    = require("mongoose");
const bodyParser  = require("body-parser");
const exphbs      = require("express-handlebars");

const env = process.env.NODE_ENV

mongoose.Promise = Promise;

if (env === 'development') 
    // development env variables
    require('dotenv').config();

// Require our models
const Article = require("./models/Articles.js");
const Note = require("./models/Notes.js")

// Initialize Express
const app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));

// server public directory
app.use(express.static("public"));

// Template engine setup : Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main", layoutsDir: "./views/layouts/"}));
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "./views"))

/****************************************
 Database configuration with mongoose
 ****************************************/
const conStr = process.env.NODE_ENV === "development"
    ? process.env.MONGO_URI
    : process.env.MONGODB_URI

mongoose.connect(conStr);
const db = mongoose.connection;

db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

db.once("open", function() {
  console.log(`Mongoose connected on port ${db.port}.`);
});
//------------------------------------------------------------------------------

// Routes
// ======
app.get("/", function(req,res) {
    Article.find({}, function(error, docs) {
      if (error) {
        console.log(error);
      }
      else {
        res.render('index', {articles: docs});
      }
    });
});

// endpoint to activate scraper and store in DB
app.get("/scrape-it", function(req, res) {

  request("https://www.nyunews.com/category/arts/", function(error, response, html) {

    var $ = cheerio.load(html);
    var stuff = [];

    $(".sno-animate").each(function(i, element) {

      let result = {};

      const classList = $(this).attr('class').split(/\s+/);
      if (classList.length === 1) {
        result.title = $(this).children(".searchheadline").text();
        result.link = $(this).children("a").attr("href");
        result.date = $(this).children($("p:nth-child(3)")).children("span.time-wrapper").text();
        result.preview = $(this).find("p:nth-child(4)").text();

        stuff.push(result);
      }

      const entry = new Article(result);
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          console.log(doc);
        }
      });

    });
    console.log(stuff)
  });
  res.send("Scrape Complete");

});

// Get all articles
app.get("/api/articles", function(req, res) {

  Article.find({}, function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});

// Get article by ObjectId
app.get("/api/articles/:id", function(req, res) {
  Article.findOne({ "_id": req.params.id })
  .populate("note")
  .exec(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      res.json(doc);
    }
  });
});


// Create a new note or replace an existing note
app.post("/api/articles/:id", function(req, res) {
  var newNote = new Note(req.body);

  // And save the new note the db
  newNote.save(function(error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, { "note": doc._id })
      .exec(function(err, doc) {
        if (err) {
          console.log(err);
        }
        else {
          res.send(doc);
        }
      });
    }
  });
});

const port = process.env.PORT;
// Listen on port 3000
app.listen(port, function() {
  console.log("App running on port 3000!");
});
