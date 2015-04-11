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
        var AImove = AIPlayerSvc.getMinimaxMove(boardIn, "O");
        console.log('getMinimaxMove called')
        boardIn.asArray[AImove.row][AImove.column].mark = "O";
        boardIn.asInteger += 512*Math.pow(2,(AImove.row*3 + AImove.column));
        this.updateGameOverStatus("O", boardIn);
      };
    }
  }]);

// SERVICE CONTAINING AI LOGIC
  app.service('AIPlayerSvc', ['WINS_FOR', 'BOARD_SIZE', function(WINS_FOR, BOARD_SIZE){

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

    this.getMinimaxMove = function(boardIn, activePlayer){
      // var board = this.simpleArray(boardIn);
      // console.log("boardIn is", boardIn);
      if(this.gameWon("X", boardIn.asInteger)){
        return { score:  100,
                   row:   -1,
                column:   -1,
                 alpha:  100,
                  beta:  100
                };
      } else if (this.gameWon("O", boardIn.asInteger)){
        return { score: -100,
                   row:   -1,
                column:   -1,
                 alpha: -100,
                  beta: -100
                };
      } else if (this.gameDraw(boardIn.asArray)){
        return { score:    0,
                   row:   -1,
                column:   -1,
                 alpha:    0,
                  beta:    0
                };
      }
      // Object to hold the last evaluated move for either x or o, since this value is only needed for the comparison
      // to the next turn turn, a single object can be used and updated for X or O depending on who is playing,
      // thus it will either hold the minimum or maximum evaluated value for that move once it hits a leaf node
      // depending on whose turn it is on the leaf node
      var lastMove = { score: 1000,
                         row:   -1,
                      column:   -1,
                       alpha: -100,
                        beta:  100
                      };
      //for every board position
      for (var i=0; i < boardIn.asArray.length; i++){
        for (var j=0; j < boardIn.asArray[i].length; j++){
          if (boardIn.asArray[i][j].mark === ""){
            var newBoard = angular.copy(boardIn);
            console.log("newBoard on this ", i, ",", j, " iteration is:");
            console.log(newBoard.asArray[0][0].mark, "|", newBoard.asArray[0][1].mark, "|", newBoard.asArray[0][2].mark);
            console.log(newBoard.asArray[1][0].mark, "|", newBoard.asArray[1][1].mark, "|", newBoard.asArray[1][2].mark);
            console.log(newBoard.asArray[2][0].mark, "|", newBoard.asArray[2][1].mark, "|", newBoard.asArray[2][2].mark);
            console.log("lastMove score is ", lastMove.score)
            //copy the board, place the mark and call minimax on it
            if (activePlayer === "X") {
              newBoard.asArray[i][j].mark = "X";
              newBoard.asInteger += Math.pow(2,((3*i)+j));
            } else {
              newBoard.asArray[i][j].mark = "O";
              newBoard.asInteger += 512*Math.pow(2,((3*i)+j));
            }
            activePlayer = (activePlayer === "O") ? "X" : "O";
            console.log("activePlayer going next time is ", activePlayer);
            var nextMove = this.getMinimaxMove(newBoard, activePlayer);
            if (lastMove.score === 1000 || activePlayer === "X" && lastMove.score < nextMove.score || activePlayer === "O" && lastMove.score > nextMove.score) {
              lastMove.score = nextMove.score;
              lastMove.row = i;
              lastMove.column = j;
            }
          }
        }
      }
      // var bestPosition = {};
      // bestPosition.row = lastMove.row;
      // bestPosition.column = lastMove.column;
      console.log(lastMove);
      console.log(newBoard);
      return lastMove;
    }
  }]);

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