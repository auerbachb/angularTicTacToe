describe('Controller: GameCtrl', function() {
  var scope,
  GameCtrl,
  serviceMock;

  beforeEach(module('ticTacToe'));

  beforeEach(inject(
    function ($controller, $rootScope) {
      scope = $rootScope.$new();

      GameCtrl = $controller('GameCtrl', {
        $scope: scope
      });

    }
  ));

  it('should attach board to controller', function() {
    expect(GameCtrl.board).toBeDefined();
    expect(GameCtrl.board.inPlay).toBeTruthy();
    expect(GameCtrl.board.asInteger).toEqual(0);
    expect(GameCtrl.board.asArray[0][0].mark).toEqual("");
  });

  it('should update board on click and AI place O in middle', function() {
    GameCtrl.getMoveFromClick(0,0);
    expect(GameCtrl.board.asArray[0][0].mark).toEqual("X");
    expect(GameCtrl.board.asArray[1][1].mark).toEqual("O");
    expect(GameCtrl.board.asInteger).toEqual(8193);
  });

  it('should not update board when filled cell is clicked', function() {
    GameCtrl.getMoveFromClick(0,0);
    GameCtrl.getMoveFromClick(0,0);
    expect(GameCtrl.board.asArray[0][0].mark).toEqual("X");
    expect(GameCtrl.board.asArray[1][1].mark).toEqual("O");
    expect(GameCtrl.board.asInteger).toEqual(8193);
  });

  it('should reset the board when newGame is called', function(){
    GameCtrl.getMoveFromClick(0,0);
    GameCtrl.newGame();
    expect(GameCtrl.board.inPlay).toBeTruthy();
    expect(GameCtrl.board.asInteger).toEqual(0);
    expect(GameCtrl.board.asArray[0][0].mark).toEqual("");
  });


});