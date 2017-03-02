const Viewer = require('./viewer')

const orders = window.battleHistory
const map    = window.initialMap
const config = window.gameConfig

if (!orders || !orders.length) {
  console.error('No orders received')
} else {
  const viewer = new Viewer({
    canvas: document.getElementById('viewer'),
    legend: document.getElementById('legend'),
    initialShips: config.initialShips,
    players: config.players,
    map,
    orders
  })

  viewer.play()
}
