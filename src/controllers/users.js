var User = require('../models/user')
  , AIFunctions = require('../models/aiFunction')
  

var me = module.exports = {};


me.loadAIs = function(req, res, next){
  // TODO if no ai, put a placeholder ai
  AIFunctions.getByEmail(req.user, function(err, ai){
    req.ai = ai;
    next();
  });
};


me.loadAllAIs = function(req, res, next){
  AIFunctions.find({}).toArray(function(err, ais){
    req.ais = ais;
    next();
  });
};


me.saveAI = function(req, res, next){

  //TODO validation and stuff
  var ai = req.body;
  ai.user = req.user;
  ai.date = new Date();
  AIFunctions.store(ai, next);
};
