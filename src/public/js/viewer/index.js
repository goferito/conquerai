/**
 * Draws the battle on the given canvas context
 * @param {Canvas} canvas - Canvas context
 * @param {Array} map     - List of planets with their positions
 * @param {Array} orders  - List of orders given by the players AIs
 *                          during the battle
 * @param {Number} FPT    - Frames Per Turn
 */
class Viewer {

  constructor (config) {
    this.canvas  = config.canvas
    this.context = config.canvas.getContext('2d')
    this.map     = config.map
    this.orders  = config.orders

    // Points Per Turn (fleet speed). This should match the speed used
    // on the server to create the orders. So... do not touch
    this.PPT = config.FPT || 10
    this.MAX_TURNS = 10
    //TODO get theses values with the history

    this.TPT = config.FPT || 3000  // Time Per Turn (in ms)
    this.FPT = config.FPT || 80    // Frames Per Turn
    this.TPF = this.TPT / this.FPT // Time per Frame (time to spend
                                   // on each frame)

    this.canvas.width  = this.canvas.clientWidth
    this.canvas.height = this.canvas.clientWidth

    // List of colours for the players
    const colors = ['green', 'blue', 'purple', 'red', 'orange']

    // Give colours to players
    this.players = this.map.reduce((players, planet) => {
      if (planet.owner && !players[planet.owner]) {
        players[planet.owner] = {
          color: colors[Object.keys(players).length]
        }
      }
      return players
    }, {})

    //List of moving fleets
    this.fleets = []

    //Current turn
    this.turn = 0
  }


  animateTurn () {

    this.turn ++
    //TODO check if a player already owns all the planets
    // if true, check that all orders have been used, and declare the winner

    if (this.turn > this.MAX_TURNS && !this.fleets.length) {
      console.log('Winner calculation pending...')
      //TODO if no winner yet, count the number of planets or the growth
      return
    }

    this.growPlanets()
    this.sendNewFleets()

    // Check if new fleets are sent

    let drawsLeft = this.FPT //Frames per turn
    const drawInterval = setInterval(() => {

      this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)

      this.fleets.forEach((fleet, i) => {
      
        //Get the position of the fleet for this frame
        const usedFrames = this.FPT * (1 + this.turn - fleet.turn) - drawsLeft
        const percentDrawn = usedFrames / fleet.tripFrames
        if (percentDrawn >= 1) {
          this.resolveArrival(i)
        } else {
          this.drawFleet(fleet, percentDrawn)
        }
      })
      this.map.forEach(this.drawPlanet.bind(this))
      
      if (!--drawsLeft)  {
        clearInterval(drawInterval)
        return this.animateTurn()
      }
    }, this.TPF)
  }


  resolveArrival (fleetIndex) {

    const fleet = this.fleets[fleetIndex]

    // If fleet arrives to owned planet, no battle, and all ships are added
    if (fleet.player === fleet.dest.owner) {
      fleet.dest.ships += fleet.ships
    } else {

      // Check if enough to conquer
      if (fleet.dest.ships <= fleet.ships) {
        fleet.dest.owner = fleet.player
        fleet.dest.ships = Math.abs(fleet.dest.ships - fleet.ships)
      } else {
        fleet.dest.ships -= fleet.ships
      }
    }

    this.fleets.splice(fleetIndex, 1)
  }


  drawFleet (fleet, percentGone) {
    const ctx = this.context
    const radius  = fleet.ships * (1 + 10 / (fleet.ships * fleet.ships))

    const currentX = fleet.origin.x
                      + (fleet.dest.x - fleet.origin.x) * percentGone
    const currentY = fleet.origin.y
                      + (fleet.dest.y - fleet.origin.y) * percentGone

    const centerX = this.canvas.width * (currentX / 100)
    const centerY = this.canvas.height * (currentY / 100)

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = fleet.player ? this.players[fleet.player].color : 'pink'
    ctx.fill()
    ctx.fillStyle = 'black'
    ctx.font = '12px serif'
    ctx.fillText(fleet.ships, centerX, centerY)
  }


  sendNewFleets () {
    for (let order of this.orders) {
      if (order.turn < this.turn) continue
      if (order.turn > this.turn) break

      //Get references to the planet in the map
      const origin = this.map[order.origin - 1]
      const dest   = this.map[order.dest - 1]
      const tripTurns = order.arrival - order.turn
      const tripFrames = tripTurns * this.FPT
      const fleet = Object.assign({}, order, {
        origin,
        dest,
        tripFrames
      })
      this.fleets.push(fleet)
    }
  }


  getDistance (a, b) {
    const distX = a.x - b.x
    const distY = a.y - b.y
    return Math.sqrt(distX * distX + distY * distY)
  }


  play () {
    console.log('canvas.width :' , this.canvas.width)
    console.log('canvas.height:', this.canvas.height)

    this.animateTurn()
  }


  growPlanets () {
    this.map = this.map.map((planet) => {
      planet.ships += planet.ratio
      return planet
    })
  }


  drawPlanet (planet) {
    const ctx = this.context
    const centerX = this.canvas.width * (planet.x / 100)
    const centerY = this.canvas.height * (planet.y / 100)
    const radius  = planet.ratio * 5

    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false)
    ctx.fillStyle = planet.owner ? this.players[planet.owner].color : 'gray'
    ctx.fill()
    ctx.fillStyle = 'black'
    ctx.font = '12px serif'
    ctx.fillText(planet.id + '/' + planet.ships, centerX, centerY)
  }

}

module.exports = Viewer

