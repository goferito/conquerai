
describe.skip('Game with 2 players', function(){

  describe('with lazy AI', function(){

    it('creates an empty history', function(done){

      var lazyConquerors = [
        { name: 'Saa', color: 'pink', ai: lazyAI }
      , { name: 'Ray', color: 'blue', ai: lazyAI }
      ];
      
      const gameConfig = {
        players: lazyConquerors,
        initShips: 5,
        map: map,
        turns: 1
      }

      // Create a game with a fixed map, to avoid the game to
      // generate one. The 5 initial ship argument will be
      // ignored here
      var myGame = new Game(gameConfig);

      var history = myGame.createHistory();

      //console.log('history:', history);
      
      history.should.be.a.Array();
      history.length.should.equal(0);

      done();
    });
  });

  describe('with culoVeo AIa', function(){

    it('creates a history', function(done){

      var conquerors = [
        { name: 'Saa', color: 'pink', ai: culoVeo }
      , { name: 'Ray', color: 'blue', ai: culoVeo }
      ];
      
      const gameConfig = {
        players: conquerors,
        initShips: 5,
        map: map,
        turns: 1
      }

      // Create a game with a fixed map, to avoid the game to
      // generate one. The 5 initial ship argument will be
      // ignored here
      var myGame = new Game(gameConfig);

      var history = myGame.createHistory();

      done();
    });
  });
});

