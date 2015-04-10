//ultimately separate files as per https://github.com/angular/angular-phonecat
//maybe move game stuff from index into a view and use view directive plus route to insert it
//this way you can add a link to about to show you know how to use routers in angular, use the ui_router
//use webstorm or jslint or the like to proof the syntax
// http://www.codecademy.com/blog/78-your-guide-to-semicolons-in-javascript


(function(){                                                          // Anonymous function wrapper for scope control
                                                                      // and to maintain privacy of code (if minified,
                                                                      // matters less)
// MODULE: the scripts for this app are contained in a single module
var app = angular.module('ticTacToe', ['ngAnimate']);

// GLOBAL CONSTANTS
app.constant('WINS_FOR', {                                            // For global accessibility and to signify these
  X: [7, 56, 73, 84, 146, 273, 292, 448],                             // values should remain constant, in Angular this
  O: [3584, 28672, 37376, 43008,                                      // service will keep the object constant, but the
      74752, 139776, 149504, 229376] }                                // members of the object are mutable
)

app.constant('BOARD_SIZE', 9);                                        // Board size, global constant
app.constant('COMPUTER', 'O');                                        // Board size, global constant
app.constant('HUMAN', 'X');                                           // Board size, global constant

// FACTORIES
app.factory('boardFty', function(){
  var boardFty = {};
  boardFty.getNew = function(){
    return {
      inPlay: true,
      asInteger: 0,
      asArray: [
      [{idx: 0, mark: ""},{idx: 1, mark: ""},{idx: 2, mark: ""}],
      [{idx: 3, mark: ""},{idx: 4, mark: ""},{idx: 5, mark: ""}],
      [{idx: 6, mark: ""},{idx: 7, mark: ""},{idx: 8, mark: ""}]
      ]
    };
  }
  return boardFty;
});

// SERVICE CONTAINING GAME LOGIC
app.service('gameLogicSvc',['WINS_FOR', 'BOARD_SIZE', function(WINS_FOR, BOARD_SIZE){
  this.cellAt = function(index, boardIn){
      row = (Math.floor(index/3));
      column = index%3;
      return boardIn[row][column];
    }

  this.open = function(cell){
    return (cell.mark === "");
  }

  this.gameWon = function(turn, boardIn){                             // Search board for win values
      for (var winValue of WINS_FOR[turn]){                           // Choose array for X or O (cut iterations in 1/2)
        if ((winValue | boardIn) === boardIn){                        // Check if x win values are on the board with
          return true;                                                // binary or and return true if value found
        }
      }
    return false;                                                     // If binary or doesn't change intBoard no one won
  }

  this.gameDraw = function(boardIn){
    for (var i=0; i < BOARD_SIZE; i++){
      if (this.open(this.cellAt(i, boardIn))){
        return false;
      }
    }
    return true;
  }

  this.isGameOver = function(turn, boardIn){
    var board = boardIn ? boardIn : this.board;
    if (this.gameWon(turn, board.asInteger)){
      this.gameOverMessage = turn + " HAS WON";
      board.inPlay = false;
    } else if (this.gameDraw(board.asArray)){
      this.gameOverMessage = "IT'S A DRAW";
      board.inPlay = false;
    }
  }
}]);

// SERVICE CONTAINING AI LOGIC
app.service('AIPlayerSvc', function(){
  this.getMinimaxMove = function(board){
    for (var i=0; i < board.asArray.length; i++){
      for (var j=0; j < board.asArray[i].length; j++){
        if (board.asArray[i][j].mark === ""){
          return {row: i, column: j};
        }
      }
    }
  }
});

// CONTROLLER
app.controller('GameCtrl', ['$scope','$timeout',
  'AIPlayerSvc', 'gameLogicSvc','boardFty',
  function($scope, $timeout, AIPlayerSvc, gameLogicSvc,
  boardFty){

    this.newGame = function(){
      this.board = boardFty.getNew();
      this.gameOverMessage = null;
      $scope.showMessage = false;                                     // Remove gameOverMessage faster if button clicked
    }


// responsible for DOM interactions, but should be a messaging service since it's not a dirrective move into a service called messaging
    this.messageIfgameEnded = function(status){
      if (!this.board.inPlay){
        this.gameOverMessage = status;
        $scope.showMessage = true;
        $timeout(function(){                                          // Delay hiding of message for fade in and fade out to run
          $scope.showMessage = false;
        }, 2000);
      }
    }


// responsible for DOM interactions, but mixed with game logic
    this.makeMove = function(index){
      moveCell = gameLogicSvc.cellAt(index, this.board.asArray);
      if (gameLogicSvc.open(moveCell) && this.board.inPlay){                    //add in and only call if X gets passed
        moveCell.mark = "X";                                                    //refactor board update into a svc
        this.board.asInteger += Math.pow(2,index);                              //refactor board update into a svc
        gameLogicSvc.isGameOver("X", this.board);                               //refactor board update into a svc
        this.messageIfgameEnded(gameLogicSvc.gameOverMessage);
        if(this.board.inPlay){ //add in and only call if O gets passed
          //aiMakeMove
          var AImove = AIPlayerSvc.getMinimaxMove(this.board);                    //only if O get's passed
          this.board.asArray[AImove.row][AImove.column].mark = "O";               //refactor board update into a svc
          this.board.asInteger += 512*Math.pow(2,(AImove.row*3 + AImove.column)); //refactor board update into a svc
          gameLogicSvc.isGameOver("O", this.board);                               //refactor board update into a svc
        }
      }
    }

playGame()
  while (this.board.inPlay){
    makeMove(indexIn){
      var move = indexIn ? getHumanMove() : AIPlayerSvc.getMove(this.board);
      updateIntAndArrValsOf(boardIn);
      gameLogicSvc.isGameOver(this.player, this.board);
    }
    this.player = switchPlayer();
    this.messageIfgameEnded(gameLogicSvc.gameOverMessage);
  }
}

gameLogicSvc.updateIntAndArrValsOf(playerIn, boardIn, moveIn){
  var shiftPow = (playerIn === AI) ? 512 : 1;
  moveCell = gameLogicSvc.cellAt(moveIn, boardIn.asArray);
  moveCell.mark = player;
  boardIn.asInteger += Math.pow(2, moveIn)*shiftPow;
}

// responsible for DOM interactions
    // On load this calls the newGame method, because Angular Documentation advises against
    // using ngInit to call a function on load to initialize values on scope
    // Reference: https://docs.angularjs.org/api/ng/directive/ngInit
    this.init = function(){
      return this.newGame();
      return this.playGame(); //????
    }
// responsible for DOM interactions
    this.init();

  }
]);
})();