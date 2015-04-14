(function(){

  var app = angular.module('ticTacToe', ['ngAnimate']);

  /******************************************************************
  ************************* NAMED CONSTANTS *************************
  *******************************************************************/
  app.constant('WINS_FOR', {                                          // Array of wins for the binary board
        X: [           //         273                84               // representation, (see header for details)
                 7,    //           \               /
                56,    //             1 |   2 |   4  == 7
                73,    //          -----+-----+-----
                84,    //             8 |  16 |  32  == 56
               146,    //          -----+-----+-----
               273,    //            64 | 128 | 256  == 448
               292,    //          =================
               448     //            73   146   292
           ],
        O: [           //    273*2^9                 84*2^9
              3584,    //           \               /
             28672,    //           2^9 | 2^10| 2^11 ==  7*2^9
             37376,    //          -----+-----+-----
             43008,    //           2^12| 2^13| 2^14 == 56*2^9
             74752,    //          -----+-----+-----
            139776,    //           2^15| 2^16| 2^17 == 448*2^9
            149504,    //          =================
            229376     //        73*2^9 146*2^9 292*2^9
           ]
  });

  app.constant('BOARD_SIZE', 9);                                      // Can't adjust board (just named for readability)
  app.constant('COMPUTER', 'O');                                      // In this simple implementation human and
  app.constant('HUMAN',    'X');                                      // computer players are always the same char's


  /******************************************************************
  ********************* FACTORIES AND SERVICES **********************
  *******************************************************************/

  app.factory('boardFty', function(){                                 // Returns a blank board for each new game
    var boardFty = {};
    boardFty.getNew = function(){                                     // inPlay keeps game state. b/c board is passed
      return {                                                        // as param -> simpler to let board to track state
        inPlay: true,                                                 // affiliated with its configuration
        asInteger: 0,                                                 // Binary board representation (see header)
        asArray: [
          [{idx: 0, mark: ""},{idx: 1, mark: ""},{idx: 2, mark: ""}], // idx used for angular to label board on dom
          [{idx: 3, mark: ""},{idx: 4, mark: ""},{idx: 5, mark: ""}], // to get click location
          [{idx: 6, mark: ""},{idx: 7, mark: ""},{idx: 8, mark: ""}]
        ]
      };
    };
    return boardFty;
  });


  app.service('boardSvc', ['WINS_FOR', 'BOARD_SIZE', function(WINS_FOR, BOARD_SIZE){
    this.cellAt = function(index, boardIn){
      var row = (Math.floor(index/3));
      var column = index%3;
      return boardIn[row][column];
    };

    this.open = function(cell){
      return (cell.mark === "");
    };

    this.gameWon = function(turn, boardIn){
      var winsToCheck = WINS_FOR[turn];
      for (var i = 0; i < winsToCheck.length; i++){
        if (boardIn === (winsToCheck[i] | boardIn)) {
          return true;
        }
      }
      return false;
    };

    this.gameDraw = function(boardIn){
      for (var i=0; i < BOARD_SIZE; i++){
        if (this.open(this.cellAt(i, boardIn))){
          return false;
        }
      }
      return true;
    };

  }])

  app.service('gameSvc',['AISvc', 'boardSvc',
              function(AISvc, boardSvc){

    this.updateGameOverStatus = function(turn, boardIn){
      var board = boardIn ? boardIn : this.board;
      if (boardSvc.gameWon(turn, board.asInteger)){
        this.gameOverMessage = turn + " HAS WON";
        board.inPlay = false;
      } else if (boardSvc.gameDraw(board.asArray)){
        this.gameOverMessage = "IT'S A DRAW";
        board.inPlay = false;
      }
    };

    this.boardUpdate = function(boardIn, moveIn){
      var moveCell = boardSvc.cellAt(moveIn, boardIn.asArray);
      if (boardSvc.open(moveCell) && boardIn.inPlay) {
        moveCell.mark = "X";
        boardIn.asInteger += Math.pow(2,moveIn);
        this.updateGameOverStatus("X", boardIn);
        if (boardIn.inPlay) {
          var AImove = AISvc.getMinimaxMove(boardIn, "O", 0);
          boardIn.asArray[AImove.row][AImove.column].mark = "O";
          boardIn.asInteger += 512*Math.pow(2,(AImove.row*3 + AImove.column));
          this.updateGameOverStatus("O", boardIn);
        };
      };
    }
  }]);


  app.service('AISvc', ['boardSvc',
              function(boardSvc){

    this.getMinimaxMove = function(boardIn, activePlayer){

      if(boardSvc.gameWon("X", boardIn.asInteger)){
        return { score:  100,
                   row:   -1,
                column:   -1,
                 alpha:  100,
                  beta:  100
                };
      } else if (boardSvc.gameWon("O", boardIn.asInteger)){
        return { score: -100,
                   row:   -1,
                column:   -1,
                 alpha: -100,
                  beta: -100
                };
      } else if (boardSvc.gameDraw(boardIn.asArray)){
        return { score:    0,
                   row:   -1,
                column:   -1,
                 alpha:    0,
                  beta:    0
                };
      }

      var bestMoveFoundSoFar = { score: 1000,
                                   row:   -1,
                                column:   -1,
                                 alpha: -100,
                                  beta:  100
                                            };

      for (var i=0; i < boardIn.asArray.length; i++){
        for (var j=0; j < boardIn.asArray[i].length; j++){
          if (boardIn.asArray[i][j].mark === ""){
            var newBoard = angular.copy(boardIn);

            if (activePlayer === "X") {
              newBoard.asArray[i][j].mark = "X";
              newBoard.asInteger += Math.pow(2,((3*i)+j));
            } else {
              newBoard.asArray[i][j].mark = "O";
              newBoard.asInteger += 512*Math.pow(2,((3*i)+j));
            }
            var nextPlayer = (activePlayer === "O") ? "X" : "O";
            var nextMove = this.getMinimaxMove(newBoard, nextPlayer);
            if (isMoveGoodFor(activePlayer, bestMoveFoundSoFar, nextMove)) {
              bestMoveFoundSoFar.score = nextMove.score;
              bestMoveFoundSoFar.row = i;
              bestMoveFoundSoFar.column = j;
            }
          }
        }
      }

        return bestMoveFoundSoFar;
    }

  var isMoveGoodFor = function(player, bestMoveFoundSoFar, nextMoveToCompare){
    if (bestMoveFoundSoFar.score === 1000){
      return true;
    }
    if (player === "X"){
      return bestMoveFoundSoFar.score < nextMoveToCompare.score;
    }
    return bestMoveFoundSoFar.score > nextMoveToCompare.score;
  };

  }]);


  app.service('messageSvc', ['$scope', function($scope){

  }])


  app.controller('GameCtrl', ['$scope','$timeout',
    'AISvc', 'gameSvc','boardFty',
    function($scope, $timeout, AISvc, gameSvc,
             boardFty){

      this.newGame = function(){
        this.board = boardFty.getNew();
        this.gameOverMessage = null;
        $scope.showMessage = false;
      };


      this.showMessageIfgameEnded = function(messageIn){
        if (!this.board.inPlay){
          this.gameOverMessage = messageIn;
          $scope.showMessage = true;
          $timeout(function(){
            $scope.showMessage = false;
          }, 2000);
        }
      };

      this.makeMove = function(index){
        gameSvc.boardUpdate(this.board, index);
          this.showMessageIfgameEnded(gameSvc.gameOverMessage);
      };

      this.init = function(){
        return this.newGame();
      };

      this.init();

    }
  ]);
})();