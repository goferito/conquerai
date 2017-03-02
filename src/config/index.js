
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

  // List of allowed emails to pass auth
  , allowedPlayers: [
      'goferito@gmail.com'
    , 'sadoht@gmail.com'
    , 'ray@urge.io'
    , 'matthew.torres211@gmail.com'
  ]

}



module.exports = process.env.NODE_ENV === 'production'
                   ? Object.assign(defaults, require('./production'))
                   : defaults

