
/* ******** *
 * Not used *
 * ******** */
//But I leave to code here to help with the viewer implementation
var Scene = function(conquerors,
                     initialShips,
                     context){

  this._numConquerors = conquerors.length;
  this._conquerors = conquerors.reduce(function(conqs, c){
    conqs[c.name] = c;
    return conqs;
  }, {});
  this._initialShips = initialShips;
  this._initialPlanetRatio = 5;
  this._context = context;
  this._planets = this.generatePlanets(conquerors,
                                       this._initialPlanetRatio,
                                       this._initialShips);
  this._fleets = [];
  this._speed = 0.05;
  this._drawingInterval = 100;

};


Scene.prototype.generatePlanets = function(conquerors,
                                           conquerorsRatio,
                                           conquerorsShips){
  //TODO create more maps
  var maps =  [
    [
      { x: 100, y: 100, ratio: 5, ships: 3 },
      { x: 400, y: 150, ratio: 5, ships: 25 },
      { x: 600, y: 300, ratio: 5, ships: 45 },
      { x: 50,  y: 200, ratio: 1, ships: 1 },
      { x: 100, y: 300, ratio: 2, ships: 10 },
      { x: 200, y: 150, ratio: 3, ships: 200 },
      { x: 300, y: 150, ratio: 4, ships: 1 },
      { x: 400, y: 250, ratio: 5, ships: 3 },
    ]
  ];

  //TODO test this
  var mapPos = Math.floor(Math.random() * maps.length)
    , map = maps[mapPos]

  //Put the players in the first planets
  conquerors.forEach(function(conq, i){
    map[i].owner = conq.name;
    map[i].ratio = conquerorsRatio;
    map[i].ships = conquerorsShips;
  });

  return map;
};


Scene.prototype.growRatios = function(){
  for(var i in this._planets){
    var p = this._planets[i];
    p.ships += p.ratio;
  }
};


/**
 * Returns the planets array
 */
Scene.prototype.getPlanets = function(){
  this.updateFleets();
  return this._planets;
};


/**
 * Returns the fleets array
 */
Scene.prototype.getFleets = function(){
  this.updateFleets();
  return this._fleets;
};
  

/**
 * Return the color established for the given conqueror
 *
 * @param <String> conqId - Id of the requested conqueror
 * @return <String> color
 */
Scene.prototype.getConquerorColor = function(conqId){
  return !conqId
           ? 'gray'
           : this._conquerors[conqId].color || 'gray';
};


/**
 * Draws the scene into a canvas context
 * @param <context> ctx - The canvas context
 * @returns <Scene> 
 */
Scene.prototype.drawScene = function(ctx){

  var _this = this;

  this._planets.forEach(function(planet){

    // Draw coloured circle
    ctx.globalAlpha = 1;
    ctx.shadowColor = '#999';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    ctx.beginPath();
    ctx.arc(planet.x,
            planet.y,
            planet.ratio * 5 + 10,
            0,
            2 * Math.PI,
            false);
    ctx.fillStyle = _this.getConquerorColor(planet.owner);
    ctx.fill();

    // Draw number of contained ships
    ctx.fillStyle = 'white'
    ctx.fillText(planet.ships,
                 planet.x - 6,
                 planet.y + 4);

  });

  // Current time, to check how far the fleets have already gone
  var t = new Date();

  // Draw travelling fleets
  this._fleets.forEach(function(fleet, i){
    
    // Calculate fleet position
    var dist = getDistance(fleet.origin, fleet.dest)

      // Trip time
      , tt = dist / _this._speed

      // Elapsed time
      , elapsed = t - fleet.start

      // Percent travelled
      , pTravelled = elapsed / tt

      // X trip distance
      , dx = fleet.dest.x - fleet.origin.x

      // Current X
      , cx = fleet.origin.x + dx * pTravelled

      // Y trip distance
      , dy = fleet.dest.y - fleet.origin.y

      // Current X
      , cy = fleet.origin.y + dy * pTravelled


    // If already there, don't draw
    if(pTravelled >= 1) return;

    // Draw coloured circle
    ctx.globalAlpha = 0.5;
    ctx.shadowColor = '#999';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.beginPath();
    ctx.arc(cx,
            cy,
            3 + fleet.ships, // radio
            0,
            2 * Math.PI,
            false);
    ctx.fillStyle = _this.getConquerorColor(fleet.owner);
    ctx.fill();

    // Draw fleet route
    ctx.globalAlpha = 0.3;
    ctx.shadowBlur = 1;
    ctx.shadowOffsetX = 3;
    ctx.shadowOffsetY = 3;
    ctx.beginPath();
    ctx.moveTo(fleet.origin.x, fleet.origin.y);
    ctx.lineTo(fleet.dest.x, fleet.dest.y);
    ctx.stroke();
    
    // Draw number of contained ships
    ctx.globalAlpha = 0.8;
    ctx.fillStyle = 'white'
    ctx.fillText(fleet.ships, cx - 2, cy + 3);

  });
}

Scene.prototype.startDrawing = function(){
  var _this = this;
  setInterval(function(){
    _this._context.clearRect(0,
                            0,
                            _this._context.canvas.offsetWidth,
                            _this._context.canvas.offsetHeight);
    _this.updateFleets();
    _this.drawScene(_this._context);
  }, this._drawingInterval);
};


/**
 * Removes the fleets that have already got to their destination
 */
Scene.prototype.updateFleets = function(){

    var t = new Date()
      , fleet;

    for(var i in this._fleets){
      fleet = this._fleets[i];

      var dist = getDistance(fleet.origin, fleet.dest)

        // Trip time
        , tt = dist / this._speed

        // Elapsed time
        , elapsed = t - fleet.start

        // Percent travelled
        , pTravelled = elapsed / tt;
      

      // If travelled 100% percent of the trip
      if(elapsed >= tt){

        // Add ships to the new planet
        if(fleet.owner != fleet.dest.owner){
          fleet.dest.ships -= fleet.ships;

          // If fleet contained more ships than the planet
          if(fleet.dest.ships < 0){
            fleet.dest.ships *= -1;

            // Planet Conquered!!
            fleet.dest.owner = fleet.owner;
          }

        }else{
          fleet.dest.ships += fleet.ships;
        }

        // Remove fleet from fleets list
        this._fleets.splice(i, 1);
        
      }

    }

};


Scene.prototype.sendFleet = function (origin, dest, ships){

  // Check it's not trying to send more ships than the available
  if(origin.ships < ships) return false;

  // Substract the ships to be sent
  origin.ships -= ships;

  // Add the fleet to the fleets array
  this._fleets.push({
    origin: origin,
    dest: dest,
    owner: origin.owner,
    ships: ships,
    start: new Date()
  });

  return true;

};


/**
 * Calculates the distance between two planets
 * @param <Object> origin
 * @param <Object> dest
 * @return <Number>
 */
function getDistance(origin, dest){
  return Math.sqrt(  Math.pow(origin.x - dest.x, 2)
                   + Math.pow(origin.y - dest.y, 2));
}


