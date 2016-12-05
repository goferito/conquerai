const express      = require('express')
const bodyParser   = require('body-parser')
const morgan       = require('morgan')
const session      = require('express-session')
const RedisStore   = require('connect-redis')(session)
const path         = require('path')
const passwordless = require('passwordless')
const MongoStore   = require('passwordless-mongostore')
const nodemailer   = require('nodemailer')
const mg           = require('nodemailer-mailgun-transport')

  
const config  = require('./config')
const users   = require('./controllers/users')
const battles = require('./controllers/battles')
  
const app  = express()
const http = require('http').Server(app)

const mgAuth = config.mailgun
const mailergun = nodemailer.createTransport(mg(mgAuth))

//TODO make it env dependant
const host = config.host

passwordless.init(new MongoStore(config.mongoURI))
passwordless.addDelivery(function(token, uid, mail, cb){
  const encUID = encodeURIComponent(uid)
  const accessLink = `http://${host}?token=${token}&uid=${encUID}`

  // Log access link to avoid waiting for the email
  if (process.env.NODE_ENV !== 'production') {
    console.log('accessLink:', accessLink)
  }

  mailergun.sendMail({
    from: "Galaxy Conquer <galaxyconquer@locksha.de>",
    to: mail,
    subject: "Hi, this is dog",
    text: `Hello! Access to your account here: <br /> \n ${accessLink}`
          + `<i>The link will expire in one hour.</i>`
  }, cb)
},
{
  ttl: 1000 * 60 * 60
})

// Set up express server
app.set('trust proxy', 1)
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname + '/views'))
app.set('view engine', 'jade')

app.use(session({
  secret: config.cookieSecret,
  store: new RedisStore({
    ttl: 365 * 24 * 60 * 60,
    prefix: 'cnkrai:'
  }),
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 365 * 24 * 60 * 60 * 1000
  }
}))
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(passwordless.sessionSupport())
app.use(passwordless.acceptToken({ successRedirect: '/'}))
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, '/../build')))


/* ****** *
 * Routes *
 * ****** */

app.get('/login', function(req, res){
  res.render('loginForm');
})


app.post('/login'
, passwordless.requestToken(function(user, delivery, cb, req){
    cb(null, user);
  })
, function(req, res){
    res.render('tokenSent');
  })


app.use('*'
, passwordless.restricted({ failureRedirect: '/login' }))


app.get('/logout'
, passwordless.logout()
, function(req, res){
    res.redirect('/')
})


app.get('/'
, users.loadAIs
, function(req, res){
    req.out = {
      title: 'Galaxy Conquer',
      user: req.user,
      ai: req.ai
    }

    res.render('landing', req.out)
})


app.get('/user/userId', function (req, res, next) {
  res.send('This is ment to change the alias')
})


app.post('/submitAI'
  , users.saveAI
  , users.loadAllAIs
  , battles.createHistory
  , function (req, res, next) {
      req.out = {
          title     : 'Ranking | Galaxy Conquer'
        , user      : req.user
        , history   : req.history
        , initialMap: req.initialMap
        , log       : req.log
      }

      res.render('ranking', req.out)
  }
)



http.listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'))
})

