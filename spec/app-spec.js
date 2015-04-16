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

  //if I click on the board that index should get populated and the
  //correct value of my move should get added to the integer value
  it('should update board on click and AI place O in middle', function() {
    GameCtrl.getMoveFromClick(0,0);
    expect(GameCtrl.board.asArray[0][0].mark).toEqual("X");
    expect(GameCtrl.board.asArray[1][1].mark).toEqual("O");
    // expect(GameCtrl.board.asInteger).toEqual(8193);
  });


});

/*



3.

4. check that all 16 winning positions are found by the function that
checks for wins

5. expect minimax move to return max value if mocked with x win,
expect min value if mocked with o win, expect 0 value if mocked with
draw, expect to predict correct cell if obvious win and no loss for x,
expect to predict correct cell if obvious win and no loss for 0:
xx-
---
---

o--
-o-
---*/