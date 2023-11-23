// create web server
const express = require('express');
const app = express();
const port = 3000;

// add body-parser middleware
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));

// add express-session middleware
const session = require('express-session');
app.use(
  session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
  })
);

// add express-messages middleware
const flash = require('express-flash');
app.use(flash());

// add express-messages middleware
const expressMessages = require('express-messages');
app.use(expressMessages());

// add express-validator middleware
const expressValidator = require('express-validator');
app.use(
  expressValidator({
    errorFormatter: function(param, msg, value) {
      let namespace = param.split('.');
      let root = namespace.shift();
      let formParam = root;

      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }

      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
  })
);

// add mongoose middleware
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

// check connection
db.once('open', function() {
  console.log('Connected to MongoDB');
});

// check for db errors
db.on('error', function(err) {
  console.log(err);
});

// bring in models
let Article = require('./models/article');

// set public folder
app.use(express.static(__dirname + '/public'));

// express fileUpload middleware
const fileUpload = require('express-fileupload');
app.use(fileUpload());

// set view engine
app.set('view engine', 'ejs');

// set views folder
app.set('views', __dirname + '/views');

// home route
app.get('/', function(req, res) {
  Article.find({}, function(err, articles) {
    if (err) {
      console.log(err);
    } else {
      res.render('index', {
        title: 'Articles',
        articles: articles
      });
    }
  });
});

// route files
let articles = require('./routes/articles');
app.use('/articles', articles);

// start server
app.listen(port, function() {
  console.log('Server started on port ' + port);
});
