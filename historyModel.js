var mongoose = require('mongoose')
mongoose.Promise = require('bluebird')
var Schema = mongoose.Schema

var imageSchema = new Schema({
  src: String,
  thumbSrc: String,
  url: String,
  height: Number,
  width: Number,
  timestamp: Date,
  queryId: String,
  isCollected: Boolean,
  collectionIds: {
    type: [String],
    default: []
  },
  colors: {
    type: [],
    default: []
  }
})

var querySchema = new Schema({
  q: String,
  url: String,
  timestamp: Date
})

var collectionSchema = new Schema({
  name: String,
  timestamp: Date
})

var historySchema = new Schema({
  userId: String,
  lastCheck: Date,
  images: {
    type: [imageSchema],
    default: []
  },
  queries: {
    type: [querySchema],
    default: []
  },
  collections: {
    type: [collectionSchema],
    default: []
  }
})

module.exports = mongoose.model('History', historySchema)
