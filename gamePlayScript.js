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
  );

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
    };
    return boardFty;
  });

// SERVICE CONTAINING GAME LOGIC
  app.service('gameLogicSvc',['WINS_FOR', 'BOARD_SIZE', 'AIPlayerSvc', function(WINS_FOR, BOARD_SIZE, AIPlayerSvc){
    this.cellAt = function(index, boardIn){
      var row = (Math.floor(index/3));
      var column = index%3;
      return boardIn[row][column];
    };

    this.open = function(cell){
      return (cell.mark === "");
    };

    this.gameWon = function(turn, boardIn){                             // Search board for win values
      var winsToCheck = WINS_FOR[turn];
      for (var i = 0; i < winsToCheck.length; i++){                           // Choose array for X or O (cut iterations in 1/2)
        if (boardIn === (winsToCheck[i] | boardIn)) {                        // Check if x win values are on the board with
          return true;                                                // binary or and return true if value found
        }
      }
      return false;                                                     // If binary or doesn't change intBoard no one won
    };

    this.gameDraw = function(boardIn){
      for (var i=0; i < BOARD_SIZE; i++){
        if (this.open(this.cellAt(i, boardIn))){
          return false;
        }
      }
      return true;
    };

    this.updateGameOverStatus = function(turn, boardIn){
      var board = boardIn ? boardIn : this.board;
      if (this.gameWon(turn, board.asInteger)){
        this.gameOverMessage = turn + " HAS WON";
        board.inPlay = false;
      } else if (this.gameDraw(board.asArray)){
        this.gameOverMessage = "IT'S A DRAW";
        board.inPlay = false;
      }
    };

    this.boardUpdate = function(boardIn, moveIn){
      var moveCell = this.cellAt(moveIn, boardIn.asArray);
      if (this.open(moveCell) && boardIn.inPlay) {
        moveCell.mark = "X";
        boardIn.asInteger += Math.pow(2,moveIn);
        this.updateGameOverStatus("X", boardIn);
      }
      if (boardIn.inPlay) {
        var AImove = AIPlayerSvc.getMinimaxMove(boardIn);
        boardIn.asArray[AImove.row][AImove.column].mark = "O";
        boardIn.asInteger += 512*Math.pow(2,(AImove.row*3 + AImove.column));
        this.updateGameOverStatus("O", boardIn);
      };
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
      };

// responsible for DOM interactions, but should be a messaging service since it's not a directive move into a service called messaging
      this.showMessageIfgameEnded = function(messageIn){
        if (!this.board.inPlay){
          this.gameOverMessage = messageIn;
          $scope.showMessage = true;
          $timeout(function(){                                          // Delay hiding of message for fade in and fade out to run
            $scope.showMessage = false;
          }, 2000);
        }
      };

      this.makeMove = function(index){
        gameLogicSvc.boardUpdate(this.board, index);
          this.showMessageIfgameEnded(gameLogicSvc.gameOverMessage);
      };

      // On load this calls the newGame method, because Angular Documentation advises against
      // using ngInit to call a function on load to initialize values on scope
      // Reference: https://docs.angularjs.org/api/ng/directive/ngInit
      this.init = function(){
        return this.newGame();
      };

      this.init();

    }
  ]);
})();