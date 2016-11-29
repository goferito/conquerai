
const Game = require('../game/Game')

const me = module.exports = {}

const map = [
  { id: 1, x: 10, y: 10, ratio: 5, ships: 3  },
  { id: 2, x: 40, y: 15, ratio: 5, ships: 3  },
  { id: 3, x: 60, y: 60, ratio: 5, ships: 45 },
  { id: 4, x: 50, y: 25, ratio: 1, ships: 1 },
  { id: 5, x: 10, y: 70, ratio: 2, ships: 10 },
  { id: 6, x: 25, y: 85, ratio: 3, ships: 200 },
  { id: 7, x: 30, y: 15, ratio: 4, ships: 1 },
  { id: 8, x: 80, y: 55, ratio: 5, ships: 3 },
]

const colours = [
  'pink'
, 'blue'
, 'red'
, 'orange'
, 'purple'
, 'black'
, 'white'
, 'yellow'
, 'green'
, 'gray'
]

me.createHistory = function (req, res, next) {

  var conquerors = req.ais.map(function(ai, i) {

    // Place conqueror on a planet
    // TODO make this properly
    map[i].owner = ai.user;

    return {
      name: ai.user,
      color: colours[i],
      ai: new Function(ai.code + ' return ai(arguments["0"], arguments["1"])')
    }

  })

  const gameConfig = {
    players: conquerors,
    initShips: 5,
    turns: 10,
    map
  }
  
  const battle = new Game(gameConfig)

  req.history = battle.createHistory();

  //TODO name this properly
  req.log = req.history.log;
  req.history = req.history.orders;
  req.initialMap = map

  //console.log('history', req.history);
  //console.log('log:', req.log);

  next();
}

