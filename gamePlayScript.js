(function(){

  var app = angular.module('ticTacToe', ['ngAnimate']);
  var COMPUTER = "O";                                                 // Global alias
  var HUMAN    = "X";                                                 // Global alias
  var EMPTY    =  "";                                                 // Global alias

/********************************************************************
*************************** NAMED CONSTANTS *************************
*********************************************************************/

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


/********************************************************************
********************* FACTORIES AND SERVICES ************************
*********************************************************************/

  /*
  ** Returns a blank board for each new game
  */
  app.factory('boardFty', function(){

    var boardFty = {};
    boardFty.getNew = function(){                                     // inPlay keeps game state. b/c board is passed
      return {                                                        // as param -> simpler to let board to track state
        inPlay: true,                                                 // affiliated with its configuration
        asInteger: 0,                                                 // Binary board representation (see header)
        asArray: [
          [{mark: EMPTY},{mark: EMPTY},{mark: EMPTY}],
          [{mark: EMPTY},{mark: EMPTY},{mark: EMPTY}],
          [{mark: EMPTY},{mark: EMPTY},{mark: EMPTY}]
        ]
      };
    };
    return boardFty;

  });


  /************************* BOARD SERVICE *************************
  ** Provides information about the board: whether the game has been
  ** won or ended in a draw, and whether a cell is open. Provides
  ** method to update the board with moves.
  ******************************************************************/
  app.service('boardSvc', ['WINS_FOR', 'BOARD_SIZE',
               function(WINS_FOR, BOARD_SIZE){

    /*
    ** Updates the passed board array and integer value with mark
    ** and move integer value
    */
    this.placeMove = function(board, player, row, col){
      if (player === HUMAN){
        board.asArray[row][col].mark = HUMAN;
        board.asInteger += Math.pow(2,row*3 + col);
      } else {
        board.asArray[row][col].mark = COMPUTER;
        board.asInteger += 512*Math.pow(2,row*3 + col);
      }
    }

    /*
    ** Returns true if cell at row/column on passed board is empty
    */
    this.cellisEmpty = function(board, row, col){
      return (board.asArray[row][col].mark === EMPTY);
    };

    /*
    ** Returns true if one of the winning patters is found on
    ** the board passed
    */
    this.gameWon = function(board, turn){
      var winsToCheck = WINS_FOR[turn];
      for (var i = 0; i < winsToCheck.length; i++){
        if (board.asInteger === (winsToCheck[i] | board.asInteger)){
          return true;
        }
      }
      return false;
    };

    /*
    ** Returns true if every cell on the board is occupied
    */
    this.gameDraw = function(board){
      for (var index = 0; index < BOARD_SIZE; index++){
        var row = (Math.floor(index/3));
        var col = index%3;
        if (this.cellisEmpty(board, row, col)){
          return false;
        }
      }
      return true;
    };

  }])


  /************************* GAME SERVICE *************************
  ** Makes moves for the AI and human player, manages the message
  ** sent upon the game ending for the DOM.
  *****************************************************************/
  app.service('gameSvc',['AISvc', 'boardSvc',
              function(AISvc, boardSvc){

    /*
    ** Updates boolean representing whether game is over and
    ** sets the gameOverMessage to the appropriate value.
    */
    this.updateGameOverStatus = function(board, turn){
      if (boardSvc.gameWon(board, turn)){
        this.gameOverMessage = turn + " HAS WON";
        board.inPlay = false;
      } else if (boardSvc.gameDraw(board)){
        this.gameOverMessage = "IT'S A DRAW";
        board.inPlay = false;
      }
    };

    /*
    ** Updates the board with the human player's move then calls the
    ** minimax function to get the AI player's move and updates the
    ** board with the AI player's move.
    */
    this.makeHumanThenAIMove = function(board, row, col){
      if (boardSvc.cellisEmpty(board, row, col) && board.inPlay){
        boardSvc.placeMove(board, HUMAN, row, col);
        this.updateGameOverStatus(board, HUMAN);
        if (board.inPlay){
          var AImove = AISvc.getAIMove(board);
          boardSvc.placeMove(board, COMPUTER, AImove.row, AImove.col);
          this.updateGameOverStatus(board, COMPUTER);
        };
      };
    }
  }]);


  /*************************** AI SERVICE **************************
  ** Contains the minimax function and helper methods
  *****************************************************************/
  app.service('AISvc', ['boardSvc',
              function(boardSvc){

    /*
    ** Wrapper for minimax move passes starting parameters providing a
    ** cleaner interface to call the AISvc for a move .
    ** (Potential interface for other methods of AI playing).
    */
    this.getAIMove = function(board){
      return this.getMinimaxMove(board, COMPUTER, -100, 100);
    }

    /*
    ** recursively generates all possible board states and uses
    ** minimax to return a move
    */
    this.getMinimaxMove = function(board, player, alpha, beta){

      if(boardSvc.gameWon(board, HUMAN)){
        return xWonScore();
      } else if (boardSvc.gameWon(board, COMPUTER)){
        return oWonScore();
      } else if (boardSvc.gameDraw(board)){
        return drawScore();
      }

      var movePicked = { score: null };

      for (var row=0; row < board.asArray.length; row++){
        for (var col=0; col < board.asArray[row].length; col++){
          if (boardSvc.cellisEmpty(board, row, col)){
            var newBoard = angular.copy(board);

            if (player === HUMAN){
              boardSvc.placeMove(newBoard, HUMAN, row, col);
            } else {
              boardSvc.placeMove(newBoard, COMPUTER, row, col);
            }
            var nextPlayer = (player === COMPUTER) ? HUMAN : COMPUTER;
            var nextMove = this.getMinimaxMove(newBoard,              //recursive call
                                               nextPlayer,
                                               alpha, beta);
            if (playerShouldUpdate(player, movePicked, nextMove)){
              updateMove(movePicked, nextMove, row, col);
            }
            if (player === HUMAN && alpha < nextMove.score){
              alpha = nextMove.score;
            } else if (player === COMPUTER && beta > nextMove.score){
              beta = nextMove.score;
            };
          }
        }
        if (alpha >= beta){
          break;
        };
      }
      return movePicked;
    }

    /*
    ** helper method to return the score for X winning
    */
    var xWonScore = function(){
      return { score:  100,
               alpha:  100,
                beta:  100
              };
    }

    /*
    ** helper method to return the score for O winning
    */
    var oWonScore = function(){
      return { score: -100,
               alpha: -100,
                beta: -100
              };
    }

    /*
    ** helper method to return the score for a draw
    */
    var drawScore = function(){
      return { score:    0,
               alpha:    0,
                beta:    0
              };
    }

    /*
    ** Helper method to determine if move and score should be updated
    */
    var playerShouldUpdate = function(player, movePicked, nextMove){
      if (movePicked.score === null){
        return true;
      }
      if (player === HUMAN){
        return movePicked.score < nextMove.score;
      }
      return movePicked.score > nextMove.score;
    }

    /*
    ** Helper method to update the movePicked object with the chosen
    ** move and its heuristic value
    */
    var updateMove = function(movePicked, nextMove, row, col){
      movePicked.score = nextMove.score;
      movePicked.row   = row;
      movePicked.col   = col;
      return movePicked;
    }

  }]);


  /******************************************************************
  *************************** CONTROLLER ****************************
  *******************************************************************/

  app.controller('GameCtrl', ['$scope','$timeout',
                 'AISvc', 'gameSvc','boardFty',
                 function($scope, $timeout, AISvc, gameSvc, boardFty){

      /*
      ** Generates empty board, resets showMessage (to ensure it
      ** disappears immediately upon click of new game)
      */
      this.newGame = function(){
        this.board = boardFty.getNew();
        $scope.showMessage = false;
      };

      /*
      ** Updates board with user click from DOM, gets AI move and
      ** updates board with AI move
      */
      this.getMoveFromClick = function(tableRow, tableCol){
        gameSvc.makeHumanThenAIMove(this.board, tableRow, tableCol);
        this.showMessageIfGameEnded();
      };

      /*
      ** Flashes message if game ended
      */
      this.showMessageIfGameEnded = function(){
        if (!this.board.inPlay){
          this.gameOverMessage = gameSvc.gameOverMessage;
          $scope.showMessage = true;
          $timeout(function(){
            $scope.showMessage = false;
          }, 2000);
        }
      };

      /*
      ** Loads a new board object on first page load so
      ** user doesn't have to click the newGame button
      */
      this.initializeNewGameOnLoad = function(){
        return this.newGame();
      };

      this.initializeNewGameOnLoad();

    }
  ]);
})();