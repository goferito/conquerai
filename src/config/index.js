
var secrets = require('../../secrets')
  , util = require('util')
  

var defaults = {

  // Gmail credentials
  gmail: secrets.gmail

  // Mailgun creds
, mailgun: secrets.mailgun

  //
, mongoURI: 'mongodb://localhost/galaxyconquer'


, cookieSecret: secrets.cookie

};



module.exports = process.env.NODE_ENV === 'production'
                   ? util._extend(require('./production'), defaults)
                   : defaults;
