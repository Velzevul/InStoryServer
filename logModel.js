var mongoose = require('mongoose');
mongoose.Promise = require('bluebird');
var Schema = mongoose.Schema;

var logItemSchema = new Schema({
  timestamp: Date,
  message: String
});

var logSchema = new Schema({
  userId: String,
  items: {
    type: [logItemSchema],
    default: []
  }
});

module.exports = mongoose.model('Log', logSchema)