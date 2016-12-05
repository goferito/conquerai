const Viewer = require('./viewer')

const orders = window.battleHistory
const map    = window.initialMap
console.log('orders:', orders)
console.log('map:', map)

if (!orders || !orders.length) {
  console.error('No orders received')
} else {
  const viewer = new Viewer({
    canvas: document.getElementById('viewer'),
    map,
    orders
  })

  //TODO print legend
  console.log('players:', viewer.players)

  viewer.play()
}
