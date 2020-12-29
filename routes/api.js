/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID; 

const CONNECTION_STRING = process.env.DB;
 
module.exports = function(app) {

  app.route('/api/issues/:project')

    .get(function(req, res) {
      var project = req.params.project;

    })

    .post(function(req, res) {
      var project = JSON.parse(decodeURI(req.params.project));
      console.log(project.text + ' Insert'); 
      //res.json({"name":"sli"});
      DbTransactions(project, res, 'insert', function(res1, project) {
        console.log('inside callback');
        res1.json(project);
      });
    })

    .put(function(req, res) {
      //var project = req.params.project;
      var project = JSON.parse(decodeURI(req.params.project));
      console.log(project.id + ' Update '); 
      DbTransactions(project, res, 'update', function(res1, project) {
        console.log('inside callback');
        res1.json(project);
      });      
    })

    .delete(function(req, res) {
      
      var project = JSON.parse(decodeURI(req.params.project));
      console.log('Got Dere');
      
      console.log(project.id + ' delete '); 
      DbTransactions(project, res, 'delete', function(res1, project) {
        console.log('inside callback');
        res1.json(project);
      });  

    });

    
  function DbTransactions(jsonData, resData, type, callback) {
    
    MongoClient.connect(CONNECTION_STRING, function(err, db) {
      if (err) throw err;
      var dbo = db.db("slidb");
      
      if (type == 'insert') {
        dbo.collection("issues").insertOne(jsonData, function(err, res) {
        if (err) throw err;
        console.log("document inserted into database");
        db.close();
        return callback(resData, jsonData);
        });
      } else if (type == 'update') {
            /* 
            let data1 = {
            "id": $('[name="_id2"]').val(),
            "title":$('[name="issue_title2"]').val(),
            "issue":  $('[name="issue_text2"]').val(),
            "status": $('[name="status_text2"]').val(),
            "created_by": $('[name="created_by2"]').val(),
            "assigned_to": $('[name="assigned_to2"]').val()
          }
          */

        dbo.collection("issues").findOne({'_id': ObjectId(jsonData.id)}, function(err, res) {
        
        if (jsonData.title) { 
          res.title = jsonData.title;
        }
        if (jsonData.issue) { 
          res.issue = jsonData.issue;
        } 
        if (jsonData.status) {
           res.status = jsonData.status;
        }
        
        if (jsonData.created_by) {
            res.created_by = jsonData.created_by;
        }
        
        if (jsonData.assigned_to) {
            res.assigned_to = jsonData.assigned_to;
        } 

        if (err) throw err;
        console.log(res);
         dbo.collection("issues").save(res);
         console.log("document updated in database");
        db.close();
        return callback(resData, jsonData);
        });
      } else if (type == 'delete') {
        console.log(jsonData.id + " Delete ")
        dbo.collection("issues").deleteOne({'_id': ObjectId(jsonData.id)}, function(err, res) {
          
            if (err) throw err;

             db.close();
            return callback(resData, jsonData);
        });      
      }

    });
    
  }

};
