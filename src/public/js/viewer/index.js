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
    this.legend  = config.legend

    // Points Per Turn (fleet speed). This should match the speed used
    // on the server to create the orders. So... do not touch
    this.PPT = config.FPT || 10
    this.MAX_TURNS = this.orders[this.orders.length -1].turn
    //TODO get theses values with the history

    this.TPT = config.FPT || 3000  // Time Per Turn (in ms)
    this.FPT = config.FPT || 80    // Frames Per Turn
    this.TPF = this.TPT / this.FPT // Time per Frame (time to spend
                                   // on each frame)

    this.canvas.width  = this.canvas.clientWidth
    this.canvas.height = this.canvas.clientWidth

    this.players = config.players.reduce((kPlayers, player) => {
      kPlayers[player.name] = player
      return kPlayers
    }, {})

    //List of moving fleets
    this.fleets = []

    //Current turn
    this.turn = 0
  }

  updatePlayerStats () {

    // Calculate the number of conquered planets, growing ratio, and
    // total ships of each player
    //TODO include moving ships (fleets)
    const stats = this.map.reduce((counts, planet) => {

      if (!planet.owner) {
        return counts
      }

      if (!counts[planet.owner]) {
        counts[planet.owner] = {
          ratio: 0,
          planets: 0,
          ships: 0
        }
      }
      counts[planet.owner].ratio += planet.ratio
      counts[planet.owner].planets += 1
      counts[planet.owner].ships += planet.ships
      return counts
    }, {})

    // Update the players with the counts
    Object.keys(this.players).forEach((playerId) => {
      this.players[playerId].ratio = (stats[playerId] || {}).ratio || 0
      this.players[playerId].planets = (stats[playerId] || {}).planets || 0
      this.players[playerId].ships = (stats[playerId] || {}).ships || 0
    })
  }

  drawLegend () {
    this.updatePlayerStats()

    this.legend.innerHTML = '<table>'
      + '<tr><td>Player</td><td>Ratio</td><td>Planets</td><td>Ships</td></tr>'
      + Object.keys(this.players).map((id) => {
        const player = this.players[id]
        const color = player.color
        const ratio = player.ratio || '-'
        const planets = player.planets || '-'
        const ships = player.ships || '-'

        return `<tr style='color:${color}'>`
          + `<td>${id}</td>`
          + `<td>${ratio}</td>`
          + `<td>${planets}</td>`
          + `<td>${ships}</td>`
          + `</tr>`
        }).join('')
      + '</table>'
  }


  alertWinner () {
    this.updatePlayerStats()

    // Sort players by ratio - planets - ships, and pich #1
    const winner = Object.keys(this.players).sort((a, b) => {
      const p1 = this.players[a]
      const p2 = this.players[b]

      // Player with bigger ration wins
      if (p1.ratio !== p2.ratio) return p2.ratio - p1.ratio

      // If same ration, number of planets wins
      if (p1.planets !== p2.planets) return p2.planets - p1.planets

      // If same planets, number of ships wins
      if (p1.ships !== p2.ships) return p2.ships - p1.ships
    })[0]
    alert(winner.split('@')[0] + " wins!")

  }


  animateTurn () {

    this.drawLegend()

    this.turn ++
    //TODO check if a player already owns all the planets
    // if true, check that all orders have been used, and declare the winner

    // Check if all turn have been displayed
    if (this.turn > this.MAX_TURNS && !this.fleets.length) {
      console.log('Game Over')
      return this.alertWinner()
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
      origin.ships -= order.ships
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

