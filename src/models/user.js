var db = require('../plugins/mongo')

db.users.bind({
  getByEmail: function(email, cb){
    this.findOne({email: email, cb})
  }
})


module.exports = db.users

