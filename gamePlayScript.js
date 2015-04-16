// add alpha beta pruning
//ultimately separate files as per https://github.com/angular/angular-phonecat
//maybe move game stuff from index into a view and use view directive plus route to insert it
//this way you can add a link to about to show you know how to use routers in angular, use the ui_router
//use webstorm or jslint or the like to proof the syntax
// http://www.codecademy.com/blog/78-your-guide-to-semicolons-in-javascript
//how to use js doc?

(function(){

  var app = angular.module('ticTacToe', ['ngAnimate']);
  var COMPUTER = 'O';                                                 // Global alias
  var HUMAN    = 'X';                                                 // Global alias

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
          [{mark: ""},{mark: ""},{mark: ""}],
          [{mark: ""},{mark: ""},{mark: ""}],
          [{mark: ""},{mark: ""},{mark: ""}]
        ]
      };
    };
    return boardFty;

  });


  /************************* BOARD SERVICE *************************
  ** Provides information about the board: whether the game has been
  ** won or ended in a draw, whether a cell is open, and what the
  ** relative cell is from the 1d to 2d array.
  *****************************************************************/
  app.service('boardSvc', ['WINS_FOR', 'BOARD_SIZE',
               function(WINS_FOR, BOARD_SIZE){

    /*
    ** Returns the cell on the board object based on its index by
    ** converting the index 0-8 into it's row/column equivalent for
    ** the 2 dimensional board
    */
    this.cellAt = function(board, row, col){
      return board[row][col];
    };

    /*
    ** Returns true if the cell is blank
    */
    this.cellIsOpen = function(cell){
      return (cell.mark === "");
    };

    /*
    ** Checks if the current move making player has won the game
    */
    this.gameWon = function(turn, board){
      var winsToCheck = WINS_FOR[turn];
      for (var i = 0; i < winsToCheck.length; i++){
        if (board === (winsToCheck[i] | board)){
          return true;
        }
      }
      return false;
    };

    /*
    ** Checks if every cell on the board is occupied
    */
    this.gameDraw = function(board){
      for (var index = 0; index < BOARD_SIZE; index++){
        var row = (Math.floor(index/3));
        var col = index%3;
        if (this.cellIsOpen(this.cellAt(board, row, col))){
          return false;
        }
      }
      return true;
    };

  }])


  /************************* GAME SERVICE *************************
  ** Makes moves for the AI and human player, manages the message
  ** sent upon the game ending for the DOM.
  */
  app.service('gameSvc',['AISvc', 'boardSvc',
              function(AISvc, boardSvc){

    /*
    ** Updates boolean representing whether game is over and
    ** sets the gameOverMessage to the appropriate value.
    */
    this.updateGameOverStatus = function(turn, board){
      if (boardSvc.gameWon(turn, board.asInteger)){
        this.gameOverMessage = turn + " HAS WON";
        board.inPlay = false;
      } else if (boardSvc.gameDraw(board.asArray)){
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
      var cellToMark = boardSvc.cellAt(board.asArray, row, col);
      if (boardSvc.cellIsOpen(cellToMark) && board.inPlay){
        cellToMark.mark = HUMAN;                                        //use symbol HUMAN
        board.asInteger += Math.pow(2,row*3 + col);                      //use symbol and call addMoveAsPowerOf2 for HUMAN
        this.updateGameOverStatus(HUMAN, board);
        if (board.inPlay){
          var AImove = AISvc.getMinimaxMove(board, COMPUTER, 0); //<--getAIMove if board has only 1 move on it then do x, otherwise call y
          board.asArray[AImove.row][AImove.column].mark = COMPUTER;
          board.asInteger += 512*Math.pow(2,(AImove.row*3 + AImove.column)); //use symbol and call addMoveAsPowerOf2 for COMPUTER
          this.updateGameOverStatus(COMPUTER, board);
        };
      };
    }
  }]);


  /*
  ** Contains the minimax function and helper methods
  */
  app.service('AISvc', ['boardSvc',
              function(boardSvc){

    /*
    ** recursively generates all possible board states and uses
    ** minimax to return a move
    */
    this.getMinimaxMove = function(board, turn){
      if(boardSvc.gameWon(HUMAN, board.asInteger)){
        return xWonScore();
      } else if (boardSvc.gameWon(COMPUTER, board.asInteger)){
        return oWonScore();
      } else if (boardSvc.gameDraw(board.asArray)){
        return drawScore();
      }

      var movePicked = { score: 1000 };

      for (var i=0; i < board.asArray.length; i++){
        for (var j=0; j < board.asArray[i].length; j++){
          if (board.asArray[i][j].mark === ""){
            var newBoard = angular.copy(board);

            if (turn === HUMAN){
              newBoard.asArray[i][j].mark = HUMAN;
              newBoard.asInteger += Math.pow(2,((3*i)+j));
            } else {
              newBoard.asArray[i][j].mark = COMPUTER;
              newBoard.asInteger += 512*Math.pow(2,((3*i)+j));
            }
            var nextPlayer = (turn === COMPUTER) ? HUMAN : COMPUTER;
            var nextMove = this.getMinimaxMove(newBoard, nextPlayer);
            if (isMoveGoodFor(turn, movePicked, nextMove)){
              movePicked.score = nextMove.score;
              movePicked.row = i;
              movePicked.column = j;
            }
            if (turn === HUMAN && movePicked.alpha < nextMove.score){
              movePicked.alpha = nextMove.score;
            } else if (turn === COMPUTER && movePicked.beta > nextMove.score){
              movePicked.beta = nextMove.score;
            }
          }
        }
        if (movePicked.alpha >= movePicked.beta){
          break;
        }
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
    var isMoveGoodFor = function(player, movePicked, nextMoveToCompare){
      if (movePicked.score === 1000){
        return true;
      }
      if (player === HUMAN){
        return movePicked.score < nextMoveToCompare.score;
      }
      return movePicked.score > nextMoveToCompare.score;
    };

  }]);


  /******************************************************************
  *************************** CONTROLLER ****************************
  *******************************************************************/

  app.controller('GameCtrl', ['$scope','$timeout',
    'AISvc', 'gameSvc','boardFty',
    function($scope, $timeout, AISvc, gameSvc,
             boardFty){

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
        this.showMessageIfgameEnded();
      };

      /*
      ** Flashes message if game ended
      */
      this.showMessageIfgameEnded = function(){
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