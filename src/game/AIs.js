
/*
 *
 * Data Structures to use
 *
 * Planet Object:
 *   Stores the information of a planet. Looks like this:
 *     {
 *       x: <Number> Position in the X axis,
 *       y: <Number> Position in the Y axis,
 *       owner: <String> Name of the player owner,
 *       ratio: <Number> Number of ships the planet gets on every turn,
 *       ships: <Number> Number of ships,
 *     }
 *
 * Fleet Object:
 *   Stores the information of a fleet, send from a planet owned
 *   for the user, to another planet (can also be an already owned
 *   planet). Looks like this:
 *     {
 *        origin: <Object> Original Planet,
 *        dest: <Object> Destination Planet,
 *        owner: <String> Owner of the Original Planet in the
 *                        moment when the fleet was sent,
 *        ships: <Number> Ships in the fleet,
 *        start: <Date> When the fleet was sent>
 *     }
 *
 *
 * Player API
 *
 * List with the functions available for each Player:
 *
 *   this.getMyPlanets() 
 *     Returns an array with the planet objects owned by the player
 *
 *   this.getPlanets()
 *     Returns an array with all the planet objects
 *
 *   this.getMyFleets()
 *     Returns an array with the fleets owned by the player
 *
 *   this.getFleets()
 *     Returns any array with all the fleet in the game
 *
 *   this.sendFleet(<Object> Origin, <Object> Destination, <Number> Ships)
 *     Sends a fleet from the origin planet to the destination planet,
 *     containing the specified number of ships.
 *     Returns false if the fleet cannot be sent because:
 *      - Origin's owner doesn't match the player's name
 *      - Origin's ships are less than the requested ships to be sent
 *     Returns true otherwise
 *
 */



/***************************/
/*     My AI Functions     */
/***************************/


/*
 * Example AI function.
 *
 * Implemented Strategy:
 * For each of my planets, check which other planets I can conquer
 * and send just the necessary ships to it.
 *
 */
var culoVeo = function(){
  
  var _this = this;

  _this.getMyPlanets().forEach(function(myPlanet){

    _this.getPlanets().forEach(function(planet){

      // Don't send a fleet to a planet I already own
      if(planet.owner == _this.name) return;

      if(myPlanet.ships > planet.ships){
        _this.sendFleet(myPlanet, planet, planet.ships + 1);
      }
      
    });

  });

};


/*
 * AI that does nothing but reporting the planets situation
 * on every turn
 */
var lazyReporter = function(){
  console.log('I\'m ' + this.name + ', reporting planets situation:');
  console.log(this.getPlanets());
};

