var mongo = require('mongoskin')

var config = require('../config')


var uri = config.mongoURI
  , db = mongo.db(uri, {native_parse: true})

db.bind('users')
db.bind('aiFunctions')

module.exports = db

