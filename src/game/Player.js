
var Player = function(name, color, ai, scene){
  this.name = name;
  this.color = color;
  this.ai = ai || function(){};

  this.scene = scene;

  //console.log(scene);
  //UOLOLOOOOO
  // scene esta recibiendo el global, no el objecto scene
};


/**
 * Returns an array with the planets owned by the player
 */
Player.prototype.getMyPlanets = function(){
  var _this = this;
  return this.scene.getPlanets()
                   .filter(function(p){
                      return p.owner == _this.name;
                    });
};


/**
 * Returns an array with all the planets
 */
Player.prototype.getPlanets = function(){
  return this.scene.getPlanets();
};


/**
 * Returns an array with the fleets owned by the player
 */
Player.prototype.getMyFleets = function(){
  return this.scene.getFleets().filter(function(f){
    return f.owner == this.name;
  });
};


/**
 * Returns an array with all the fleets
 */
Player.prototype.getFleets = function(){
  return this.scene.getFleets();
};


/**
 * Throw a new fleet
 */
Player.prototype.sendFleet = function(origin, dest, ships){
  if(origin.owner != this.name){
    console.error('Player sending a fleet from a not owned Planet');
    return false;
  }

  return this.scene.sendFleet(origin, dest, ships)
  
};



module.exports = Player;

