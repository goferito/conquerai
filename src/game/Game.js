
/**
 * Constructor for the Game object. This holds the entire logic of a game
 * @param {Object} gameConfig - Example of config:
 *   {
 *     players: [
 *       { name: 'saa', color: 'red',  ai: [Function] },
 *       { name: 'ray', color: 'blue', ai: [Function] }
 *     ],
 *     initShips: 5,
 *     map: { [ObjectMap] },
 *     turns: 300,
 *     initRatio: 5 // Growing ratio for the starting, planet
 *   }
 */
var Game = function(gameConfig){
  
  if (!gameConfig.players || !gameConfig.players.length) {
    throw new Error("Can't create a game without players")
  }

  //TODO make this with private vars
  this.initShips = gameConfig.initShips || 5
  this.initRatio = gameConfig.initRatio || 5
  this.players = gameConfig.players
  this.map = gameConfig.map || this.generateMap()
  this.fleets = [] // List of moving fleets
  this.kPlanets = this.map.reduce(function(kPlanets, p){
    kPlanets[p.id] = p;
    return kPlanets;
  }, {});
  this.MAXTURNS = gameConfig.turns || 300
  this.turn = 1 // Current turn
  this.PPT = 10 // Points or Positions that fleets move Per Turn (speed)
  this.history = []
  this.playersLog = []
};


/**
 * Runs the game
 */
Game.prototype.createHistory = function() {

  // Starting at turn 0, let the AIs to take their decisions
  // Store each AI decision in the history, and add the fleets
  // to the movingFleets list with the arrival turn
  //
  // On each iteration:
  // * Check for fleets that have arrived at that moment, and
  //   make the updates on the arrival planet
  // * Add the arrival to history, including the ships after the
  //   arrival
  // * Let the AIs send new fleets, storing the number of ships
  //   leaving the planet, and the number of ships staying on the
  //   planet

  while (this.turn < this.MAXTURNS) {
    this.updateFleets()
    this.growPlanets()
    this.processOrders(this.requestOrders())
    this.turn++
  }

  return {
    orders: this.history,
    log: this.playersLog
  }
}


/**
 * Update the scenario with the given orders
 */
Game.prototype.processOrders = function (orders) {

  // Process orders
  orders.forEach(order => {

    if (!order) return;

    this.history.push(order)

    // Update planets
    this.map.some(p => {
      if (p.id === order.origin) {
        p.ships -= order.ships;
        return true;
      }
      return false;
    });
    
    // Calculate arriving turn, to help checking on every
    // turn the arrived fleets
    var dist = getDistance(this.kPlanets[order.origin]
                         , this.kPlanets[order.dest])
    order.arrival = this.turn + dist / this.PPT
    
    // Update fleets
    this.fleets.push(order);
  });
  
}


/**
 * Grow planets respecting their growing ratio
 */
Game.prototype.growPlanets = function () {

  // Update planet regarding the growing rates
  this.map.forEach((planet) => {
    planet.ships += planet.ratio;
    return planet;
  })
}

/**
 * Run playes AIs, and returns the orders they command
 * For each player it creates the scene object with the data they
 * need to make decisions
 */
Game.prototype.requestOrders = function () {

  // For each conqueror, run their AI. It should return
  // an order, that should be added to the history
  var orders = this.players.map((player) => {
    let order

    // Create a scene object with the data the player needs to decide an order
    let scene = this.getScene()
    scene.playerId = player.name;

    try {
      order = player.ai(scene, this.playersLog)

      var orderErrors = getOrderErrors(order, player, this.kPlanets)
      if (!orderErrors) {

        order.player = player.name
        order.turn = this.turn

        return order;
      } else {
        throw new Error('Not valid order: "' + JSON.stringify(order)
                       + '" ' + orderErrors)
      }
    }
    catch (e) {
      //TODO Add error to player logs
      console.error(e)
    }
  })

  return orders
}

/**
 * Creates an object with the current scenario. It should provide the info
 * that a player needs to make decisions
 */
Game.prototype.getScene = function () {
  return {
    map: JSON.parse(JSON.stringify(this.map)),
    fleets: JSON.parse(JSON.stringify(this.fleets))
  }
}

/**
 * Check the fleets that would have arrived at the current turn,
 * remove them from the fleets list, and update the arrival planet
 */
Game.prototype.updateFleets = function () {

  // Filter arrived fleets
  const arrivals = []
  this.fleets = this.fleets.filter((fleet) => {
    if (fleet.arrival < this.turn) {
      arrivals.push(fleet)
      return false
    }
    return true
  })

  // Update the map with the arrivals
  arrivals.forEach((fleet) => {
    this.map.some((planet) => {
      if (planet.id === fleet.dest) {
        planet.ships -= fleet.ships

        // Check if conquered
        if (planet.ships < 0) planet.owner = fleet.player
        planet.ships = Math.abs(planet.ships)
        return true
      }
      return false
    })
  })
  
}


/**
 * Modifies the scene with the given orders. Return a new scene object
 */
Game.prototype.applyOrders = function (orders) {

}

Game.prototype.generateMap = function(){

  //TODO create more maps or make a random generator that
  //  only creates cool maps
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
  ]

  var mapPos = Math.floor(Math.random() * maps.length)
    , map = maps[mapPos]

  //Put the players in the first positions
  this.players.forEach(function(player, i){
    map[i].owner = player.name
    map[i].ratio = this.initRatio
    map[i].ships = this.initShips
  });

  return map
};


/**
 * @returns {String} out of the input @param
 */
function stringify (input) {
  return typeof input === 'object'
    ? JSON.stringify(input)
    : input.toString()
}

/**
 * Stores a log msg in this.playersLog, so it can be displayed to them
 * in the viewer
 */
Game.prototype.log = function (...msg) {

  //TODO the log should be player-separated, so each player only
  //     gets the log for their own code

  this.playersLog.push(msg.map(stringify).join(' '))
}


/**
 * Calculates the distance between two planets
 * @param <Object> origin {x: <Number>, y: <Number>}
 * @param <Object> dest {x: <Number>, y: <Number>}
 * @return <Number>
 */
function getDistance(origin, dest){
  return Math.sqrt(  Math.pow(origin.x - dest.x, 2)
                   + Math.pow(origin.y - dest.y, 2));
}


/**
 * @param order
 * @param player
 * @param planets
 */
function getOrderErrors(order, player, planets){
  if (!order) {
    return 'No order found';
  }
  if (!player) {
    return 'No player found';
  }
  if (!order.origin || !order.dest || !order.ships) {
    return 'Order misses fields';
  }
  if (!planets[order.origin]) {
    return 'Origin does not exist in the scene';
  }
  if (!planets[order.dest]) {
    return 'Destination does not exist in the scene';
  }
  if (planets[order.origin].owner != player.name) {
    return 'Player does not own origin';
  }
  if (planets[order.origin].ships < order.ships) {
    return 'Origin has not enough ships';
  }

  return '';
}

module.exports = Game;

