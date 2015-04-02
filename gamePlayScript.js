//ultimately separate files as per https://github.com/angular/angular-phonecat
//maybe move game stuff from index into a view and use view directive plus route to insert it
//this way you can add a link to about to show you know how to use routers in angular, use the ui_router

(function(){                                                          // Anonymous function wrapper for scope control
                                                                      // and to maintain privacy of code (if minified,
                                                                      // matters less)
var app = angular.module('ticTacToe', ['ngAnimate']);

app.constant('WINS_FOR', {                                             // For global accessibility and to signify these
  X: [7, 56, 73, 84, 146, 273, 292, 448],                             // values should remain constant, in Angular this
  O: [3584, 28672, 37376, 43008,                                      // service will keep the object constant, but the
      74752, 139776, 149504, 229376] }                                // members of the object are mutable
)

app.constant('BOARD_SIZE', 9);                                         // Board size, global constant

app.factory('boardFty', function(){
  var boardFty = {};
  boardFty.getNew = function(){
    return {
      asInteger: 0,
      asArray: [
      [{idx: 0, mark: ""},{idx: 1, mark: ""},{idx: 2, mark: ""}],
      [{idx: 3, mark: ""},{idx: 4, mark: ""},{idx: 5, mark: ""}],
      [{idx: 6, mark: ""},{idx: 7, mark: ""},{idx: 8, mark: ""}]
      ]
    };
  };
  return boardFty;
});

app.service('gameLogicSvc', function(){
  this.cellAt = function(index, boardIn){
      row = (Math.floor(index/3));
      column = index%3;
      return boardIn.asArray[row][column];
    };
});

app.service('AIPlayerSvc', function(){
  this.getMinimaxMove = function(board){
    for (var i=0; i < board.asArray.length; i++){
      for (var j=0; j < board.asArray[i].length; j++){
        if (board.asArray[i][j].mark === ""){
          return {row: i, column: j};
        }
      }
    };
  };
});

app.controller('GameCtrl', ['$scope','$timeout',
  'AIPlayerSvc', 'gameLogicSvc','WINS_FOR','BOARD_SIZE','boardFty',
  function($scope, $timeout, AIPlayerSvc, gameLogicSvc, WINS_FOR, BOARD_SIZE,
  boardFty){
// responsible for DOM interactions
    this.newGame = function(){
      this.board = boardFty.getNew();
      $scope.showMessage = false;                                     // Remove gameOverMessage faster if button clicked
    };
//game logic move to service
    this.cellAt = function(index, boardIn){
      var board = boardIn ? boardIn : this.board.asArray;
      row = (Math.floor(index/3));
      column = index%3;
      return board[row][column];
    };
//game logic move to service
    this.open = function(cell){
      return (cell.mark === "");
    };
//game logic move to service
    this.gameWon = function(turn, boardIn){                           // Search board for win values
        for (var winValue of WINS_FOR[turn]){                          // Choose array for X or O (cut iterations in 1/2)
          if ((winValue | boardIn) === boardIn){                      // Check if x win values are on the board with
            return true;                                              // binary or and return true if value found
          }
        }
      return false;                                                   // If binary or doesn't change intBoard no one won
    };
//game logic move to service
    this.gameDraw = function(boardIn){
      for (var i=0; i < BOARD_SIZE; i++){
        if (this.open(this.cellAt(i, boardIn))){
          return false;
        };
      }
      return true;
    };
// responsible for DOM interactions
    this.showGameOverMessage = function(status){
      this.gameOverMessage = status;
      $scope.showMessage = true;
      $timeout(function(){                                            // Delay hiding of message for fade in and fade out to run
        $scope.showMessage = false;
      }, 2000);
    };

    this.gameOver = function(turn, boardIn){
      var board = boardIn ? boardIn : this.board;
      if (this.gameWon(turn, board.asInteger)){
        this.showGameOverMessage(turn + " HAS WON");
        return true;
      } else if (this.gameDraw(board.asArray)){
        this.showGameOverMessage("IT'S A DRAW");
        return true;
      }
      return false;
    };
// responsible for DOM interactions, but mixed with game logic
    this.makeMove = function(index){
      moveCell = gameLogicSvc.cellAt(index, this.board);
      if (this.open(moveCell) && !Owon){
        moveCell.mark = "X";
        this.board.asInteger += Math.pow(2,index);
        if (!this.gameOver("X")){
          //aiMakeMove
          var AImove = AIPlayerSvc.getMinimaxMove(this.board);
          this.board.asArray[AImove.row][AImove.column].mark = "O";
          this.board.asInteger += 512*Math.pow(2,(AImove.row*3 + AImove.column));
          var Owon = this.gameOver("O");
        };
      };
    }
// responsible for DOM interactions
    // On load this calls the newGame method, because Angular Documentation advises against
    // using ngInit to call a function on load to initialize values on scope
    // Reference: https://docs.angularjs.org/api/ng/directive/ngInit
    this.init = function(){
      return this.newGame();
    };
// responsible for DOM interactions
    this.init();

  }
]);
})();