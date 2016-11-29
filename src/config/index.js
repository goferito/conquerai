
const secrets = require('../../secrets')
const util = require('util')
  

const defaults = {

  // Gmail credentials
  gmail: secrets.gmail

  // Mailgun creds
, mailgun: secrets.mailgun

  //
, mongoURI: 'mongodb://localhost/conquerai'


, cookieSecret: secrets.cookie

, host: 'localhost:3000'

}



module.exports = process.env.NODE_ENV === 'production'
                   ? util._extend(require('./production'), defaults)
                   : defaults

