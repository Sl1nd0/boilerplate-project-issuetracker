'use strict';

var express     = require('express');
var bodyParser  = require('body-parser');
var expect      = require('chai').expect;
var cors        = require('cors');
var dotenv        = require('dotenv').config();

var apiRoutes         = require('./routes/api.js');
var fccTestingRoutes  = require('./routes/fcctesting.js');
var runner            = require('./test-runner');
var MongoClient = require('mongodb').MongoClient; 
var ObjectId = require('mongodb').ObjectID; 
const CONNECTION_STRING = process.env.DB;

var app = express();

app.use('/public', express.static(process.cwd() + '/public'));

app.use(cors({origin: '*'})); //For FCC testing purposes only



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Sample front-end
//app.route('/:project/')
app.route('/test')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/issue.html');
  });

app.route('/close/:ToDo')
  .get(function (req, res) {

    var id = decodeURI(req.params.ToDo);    
    console.log(' I LIvz ' + id);
    DbTransactionsUpdate(id , res, function(res1) {
      console.log("Gets to callback");         
     res1.sendFile(process.cwd() + '/views/issue.html');
    });
});

app.route('/delete/:ToDo')
  .get(function (req, res) {

    var id = decodeURI(req.params.ToDo);    
    console.log(' I deld ' + id);
    res.sendFile(process.cwd() + '/views/issue.html');
    
    DbTransactionDelete(id , res, function(res1) {
      console.log("Gets to callback");         
     res1.sendFile(process.cwd() + '/views/issue.html');
    });
});

app.route('/rest')
  .get(function (req, res) {
    //res.json({"name":"Slindo"});
     DbTransactions(res, function(res1, jsonData)  {
       res1.json(jsonData);
     });

  });

  
app.route('/Todo')
  .get(function (req, res) {
    //res.json({"name":"Slindo"});
    console.log("Punka");
     DbTransactions(res, function(res1, jsonData)  {
       res1.json(jsonData);
     });
  });
  
  function DbTransactions(resData, callback) {    
    MongoClient.connect(CONNECTION_STRING, function(err, db) {
       if (err) throw err;
      var dbo = db.db("slidb");
      dbo.collection("issues").find({}).toArray(function(err1, doc) {
        if (err1) throw err1;
        console.log(doc[0]);
        console.log("document  database");
        db.close();
        return callback(resData, doc);
        });        
    });
  }

  function DbTransactionsUpdate(idData, resData, callback) {
    console.log("eer");

    MongoClient.connect(CONNECTION_STRING, function(err, db) {  
       if (err) throw err;
       var dbo = db.db("slidb");     
        dbo.collection("issues").findOne({'_id' : ObjectId(idData)}, function(err1, doc) {
        if (err1) throw err1;
        console.log(doc.issue + "    DODOD   ");
        doc.open = "closed";
        dbo.collection("issues").save(doc);
        console.log("document  Found");
        db.close();
        return callback(resData);
        });
    });
  }

  function DbTransactionDelete(idData, resData, callback) {

    console.log("deleting");
    MongoClient.connect(CONNECTION_STRING, function(err, db) {  
       if (err) throw err;
       var dbo = db.db("slidb");     
        dbo.collection("issues").deleteOne({'_id' : ObjectId(idData)}, function(err1, doc) {
        if (err1) throw err1;
       // console.log(doc.issue + "    DODOD   ");
        doc.open = "closed";
        dbo.collection("issues").save(doc);
        console.log("document  Found");
        db.close();
        return callback(resData);
        });
    });
  }
    
//Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  });

//For FCC testing purposes
fccTestingRoutes(app);

//Routing for API 
apiRoutes(app);  
    
//404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

//Start our server and tests!
app.listen(process.env.PORT || 3000, function () {
  console.log("Listening on port " + process.env.PORT);
  if(process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch(e) {
        var error = e;
          console.log('Tests are not valid:');
          console.log(error);
      }
    }, 3500);
  }
});

module.exports = app; //for testing
