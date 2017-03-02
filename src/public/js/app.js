const Viewer = require('./viewer')

const orders = window.battleHistory
const map    = window.initialMap

if (!orders || !orders.length) {
  console.error('No orders received')
} else {
  const viewer = new Viewer({
    canvas: document.getElementById('viewer'),
    legend: document.getElementById('legend'),
    map,
    orders
  })

  viewer.play()
}
