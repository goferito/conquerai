
var me = module.exports = {}

me.ai = {} // to hold the ai functions


/**
 * Example AI function.
 *
 * Implemented Strategy:
 * For each of my planets, check which other planets I can conquer
 * and send just the necessary ships to it.
 *
 * @param 
 * @param Object scene - Example:
 *               {
 *                 map: [
 *                   {
 *                     id: 1
 *                     owner: 'bob'
 *                     ships: 17
 *                     ratio: 5
 *                   }
 *                   ...
 *                 ]
 *                 fleets: [
 *                   {
 *                     destination: 1
 *                     owner: 'Alice'
 *                     ships: 20
 *                     departure: 33 // turn
 *                     arrival: 48.7 // turn
 *                   }
 *                   ...
 *                 ]
 */
me.ai.culoVeo = function(scene){

  var player = scene.playerId;

  var order;
  scene.map.some(function(planetOrigin){

    // If I don't owe the origin planet, I can't send ships from there so...
    if (planetOrigin.owner != player) return false;
    
    return scene.map.some(function(planetDest){
      //console.log('planetDest:', planetDest);

      // Don't send a fleet to a planet I already own
      if (planetDest.owner == player) return false;

      if (!planetOrigin.ships
          || planetOrigin.ships < planetDest.ships) return false;

      order = {
        origin: planetOrigin.id,
        dest: planetDest.id,
        ships: planetOrigin.ships
      };

      return true;
    });
  });

  return order;
};


/**
 * AI that always returns null
 */
me.ai.lazyAI = function(scene){
  return null;
};


/*
 * Example of a map
 */
me.map = [
  { id: 1, x: 100, y: 100, ratio: 5, ships: 3, owner: 'Saa' },
  { id: 2, x: 400, y: 150, ratio: 5, ships: 3, owner: 'Ray' },
  { id: 3, x: 600, y: 300, ratio: 5, ships: 45 },
  { id: 4, x: 50,  y: 200, ratio: 1, ships: 1 },
  { id: 5, x: 100, y: 300, ratio: 2, ships: 10 },
  { id: 6, x: 200, y: 150, ratio: 3, ships: 200 },
  { id: 7, x: 300, y: 150, ratio: 4, ships: 1 },
  { id: 8, x: 400, y: 250, ratio: 5, ships: 3 },
];

