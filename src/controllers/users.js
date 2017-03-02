var User = require('../models/user')
  , AIFunctions = require('../models/aiFunction')
  

var me = module.exports = {};

const placeholderAI = {
  code: (function ai(data) {

    /*
     * This is a placeholder function which is already meant to return valid
     * orders. If you are impatient to see the game in action you can just
     * Save & Run now this function on the button below and edit this later.
     *
     * The goal of the game is to improve this function to return more
     * clever orders to the game.
     *
     * For now, the function receives only an object 'data', with the
     * information about the map and fleets. It looks like this:
     *
     * {
     *   // Your player ID, problably your email for now
     *   playerId: 'player1' } 
     *
     *   // The map, as an array of planets. Each planet specifies the id,
     *   // position, growing ratio, number of ships, and owner if conquered.
     *   // Each planet get each turn a number of ships equal to its growing
     *   // ratio. On the display, the size of the planet reveals its growing
     *   // ratio.
     *   map: 
     *     [ { id: 1, x: 10, y: 10, ratio: 5, ships: 42, owner: 'player1' },
     *       { id: 2, x: 40, y: 15, ratio: 5, ships: 12, owner: 'player2' },
     *       { id: 3, x: 60, y: 60, ratio: 5, ships: 135, owner: 'player3' },
     *       { id: 4, x: 50, y: 25, ratio: 1, ships: 1, owner: 'player2' },
     *       { id: 5, x: 10, y: 70, ratio: 2, ships: 46 },
     *       { id: 6, x: 25, y: 85, ratio: 3, ships: 254 },
     *       { id: 7, x: 30, y: 15, ratio: 4, ships: 73 },
     *       { id: 8, x: 80, y: 55, ratio: 5, ships: 93 } ],
     *
     *   // Traveling fleets. When an order is returned, a fleet is created
     *   // and published to the rest of the players. Each fleet contains data
     *   // about origin and destination, time (turn) of leaving, and expected
     *   // arrival.
     *   fleets: 
     *     [ { origin: 1,
     *         dest: 2,
     *         ships: 3,
     *         player: 'player1',
     *         turn: 6,
     *         arrival: 9.04 },
     *       { origin: 1,
     *         dest: 2,
     *         ships: 3,
     *         player: 'player2',
     *         turn: 7,
     *         arrival: 10.0413 },
     *       { origin: 1,
     *         dest: 2,
     *         ships: 3,
     *         player: 'player1',
     *         turn: 8,
     *         arrival: 11.04138126514911 },
     *       { origin: 2,
     *         dest: 4,
     *         ships: 3,
     *         player: 'player3',
     *         turn: 8,
     *         arrival: 9.414213562373096 }
     *       ],
     *       // When a fleet arrives, if the ships in the destination planet
     *       // are less than the amount of ships in the fleet, the destination
     *       // planet gets conquered.
     * }
     *
     * With this data, the function must return an object like this:
     * {
     *   origin: 1 // Origin's ID
     *   dest: 2   // Destination's ID
     *   ships: 20 // Number of ships to be sent
     * }
     * If you are the owner of 'origin', and it contains at least the number
     * of ships specified, a new fleet will be sent to 'dest'.
     *
     * You can also opt to send null. In that case no fleet will be sent, and
     * you will save ships on your planets for a later turn.
     *
     *
     * Note: I know it's a pain to code this blind. The idea is to have
     * soon a second argument 'log', with a log function so the code
     * can be better debugged.
     * If you feel impatient about this function you can contribute with a PR
     * to the public repo: https://github.com/goferito/conquerai
     */

    // Basic 'AI' that sends ships to the smallest planet
    const me = data.playerId

    // First, get a list with my planets
    const myPlanets = data.map.filter((planet) => {
      return planet.owner === me
    })

    // Then find my planet with most ships
    const myPowerfulPlanet = myPlanets.sort((a, b) => {
      return b.ships - a.ships
    })[0]


    // Pick a victim. Lets choose the planets with the smallest number of
    // ships, which is not already mine
    const weakest = data.map.reduce((chosen, planet) => {
      if (planet.owner === me) return chosen
      if (planet.ships < chosen.ships) return chosen
      return planet
    }, {})

    // And send all the ships to it
    return {
      origin: myPowerfulPlanet.id,
      dest: weakest.id,
      ships: myPowerfulPlanet.ships
    }
  }).toString()
}

me.loadAIs = function(req, res, next){
  // TODO if no ai, put a placeholder ai
  AIFunctions.getByEmail(req.user, function(err, ai){
    req.ai = ai || placeholderAI;
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
}
