var ObjectId = require('mongodb').ObjectID;

var db = require('../plugins/mongo')

db.aiFunctions.bind({
  getByEmail: function(email, cb){
    this.findOne({user: email}, cb)
  }
, store: function(ai, cb){
    if (ai._id) ai._id = ObjectId(ai._id);
    this.save(ai, cb);
  }
})


module.exports = db.aiFunctions

