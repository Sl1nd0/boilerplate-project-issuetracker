var mongoose = require('mongoose')
var Schema = mongoose.Schema

var pickListMongoSchema = new Schema({
  title: {type: String, default: null},  
  issue: {type: String, default: null}, 
  text: {type: String, default: null}, 
  created_by: {type: String, default: null}, 
  assigned_to: {type: String, default: null},
})

module.exports = mongoose.model('issues', pickListMongoSchema)