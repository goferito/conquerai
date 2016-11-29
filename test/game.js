const Game = require('../src/game/Game')
const fix = require('./fixtures')

describe('Game', () => {

  it('creates a simple instance', () => {
    const myGame = new Game({
      players: [ { name: 'Saa', color: 'pink', ai: fix.ai.lazyAI } ]
    })

    myGame.should.be.ok
  })
  
  it('generates a map if none provided', () => {
    const myGame = new Game({
      players: [
        { name: 'Saa', color: 'pink', ai: fix.ai.lazyAI }
      , { name: 'Ray', color: 'blue', ai: fix.ai.lazyAI }
      ]
    })

    myGame.should.be.ok
    myGame.map.should.be.a.Array()
    //TODO run proper tests here. Check it puts the players on the positions,
    //with proper ratio and ships
  })
  
  it.skip('wins the player with the biggest grow ratio', () => {
    myGame.getWinner().should.equal('saa')
  })
  
  it.skip('AI that crashes should lose', () => {
    
  })

  it.skip('copes with AI returning invalid orders', () => {
    
  })

  it('logs a msg', () => {
    const myGame = new Game({
      players: [ { name: 'Saa', color: 'pink', ai: fix.ai.lazyAI } ]
    })

    myGame.playersLog.length.should.equal(0)
    myGame.log('Hi, this is dog')
    myGame.playersLog.length.should.equal(1)
  })
  
  

  describe('with a simple map and single user', () => {

    const players = [ { name: 'Saa', color: 'pink', ai: fix.ai.culoVeo } ]
    const simpleMap = [
      { id: 'home', x: 100, y: 100, ratio: 5, ships: 3, owner: 'Saa' },
      { id: 'koln', x: 100, y: 200, ratio: 1, ships: 1 },
    ]

    const myGame = new Game({
      players: players,
      map: simpleMap
    })
  

    it('creates the game object properly', () => {
      myGame.should.be.ok
      myGame.players.should.eql(players)
      myGame.map.should.eql(simpleMap)
    })

    it('grows planets respecting ratio', () => {
      myGame.growPlanets()
      const expectedMap = [
        { id: 'home', x: 100, y: 100, ratio: 5, ships: 8, owner: 'Saa' },
        { id: 'koln', x: 100, y: 200, ratio: 1, ships: 2 },
      ]
      expectedMap.should.eql(myGame.map)
    })

    let scene
    it('creates a scene object to give to the users', () => {
      scene = myGame.getScene()
      scene.map.should.eql(simpleMap)

      scene.fleets.should.exist
      scene.fleets.should.be.Array()
      scene.fleets.length.should.equal(0)
    })
    
    let orders
    it('requests players orders', () => {
      orders = myGame.requestOrders()
      orders.length.should.equal(1)
      orders[0].origin.should.equal('home')
      orders[0].dest.should.equal('koln')
      orders[0].ships.should.equal(8)
      orders[0].turn.should.equal(1)
    })

    it('updates scenario with given orders', () => {
      myGame.processOrders(orders)

      myGame.history.length.should.equal(1)
      myGame.history.should.eql(orders)

      const expectedMap = [
        { id: 'home', x: 100, y: 100, ratio: 5, ships: 0, owner: 'Saa' },
        { id: 'koln', x: 100, y: 200, ratio: 1, ships: 2 },
      ]
      myGame.map.should.eql(expectedMap)

      const expectedFleets = [
        {
          origin: 'home',
          dest: 'koln',
          player: 'Saa',
          turn: 1,
          ships: 8,
          arrival: 3
        }
      ]
      expectedFleets.should.eql(myGame.fleets)
    })

    it('updates fleets', () => {
      myGame.turn = 2
      myGame.updateFleets()

      // Fleet shouln't have yet arrived
      let expectedFleets = [
        {
          origin: 'home',
          dest: 'koln',
          player: 'Saa',
          turn: 1,
          ships: 8,
          arrival: 3
        }
      ]
      expectedFleets.should.eql(myGame.fleets)

      myGame.growPlanets()

      // Map should be updated with their grow ratios
      let expectedMap = [
        { id: 'home', x: 100, y: 100, ratio: 5, ships: 5, owner: 'Saa' },
        { id: 'koln', x: 100, y: 200, ratio: 1, ships: 3 },
      ]
      expectedMap.should.eql(myGame.map)

      // At turn 3 fleets should arrive to destination
      myGame.turn = 3
      myGame.updateFleets()

      // Fleet shoud have yet arrived
      expectedFleets = []
      myGame.fleets.should.eql(expectedFleets)

      // Map should be updated with the arrivals
      expectedMap = [
        { id: 'home', x: 100, y: 100, ratio: 5, ships: 5, owner: 'Saa' },
        { id: 'koln', x: 100, y: 200, ratio: 1, ships: 5, owner: 'Saa' },
      ]
      expectedMap.should.eql(myGame.map)
    })
    
     
  })
  
})

