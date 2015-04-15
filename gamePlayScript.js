// add alpha beta pruning
//ultimately separate files as per https://github.com/angular/angular-phonecat
//maybe move game stuff from index into a view and use view directive plus route to insert it
//this way you can add a link to about to show you know how to use routers in angular, use the ui_router
//use webstorm or jslint or the like to proof the syntax
// http://www.codecademy.com/blog/78-your-guide-to-semicolons-in-javascript
//how to use js doc?

(function(){

  var app = angular.module('ticTacToe', ['ngAnimate']);

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
  app.constant('COMPUTER', 'O');                                      // In this simple implementation human and
  app.constant('HUMAN',    'X');                                      // computer players are always the same char's


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
          [{idx: 0, mark: ""},{idx: 1, mark: ""},{idx: 2, mark: ""}], // idx used for angular to label board on dom
          [{idx: 3, mark: ""},{idx: 4, mark: ""},{idx: 5, mark: ""}], // to get click location
          [{idx: 6, mark: ""},{idx: 7, mark: ""},{idx: 8, mark: ""}]
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
    this.cellAt = function(index, boardIn, tableRow, tableCol){ // REFACTOR using row and col
      var row = (Math.floor(index/3));
      var column = index%3;
      return boardIn[row][column];
    };

    /*
    ** Returns true if the cell is blank
    */
    this.openCellAt = function(cell){
      return (cell.mark === "");
    };

    /*
    ** Checks if the current move making player has won the game
    */
    this.gameWon = function(turn, boardIn){
      var winsToCheck = WINS_FOR[turn];
      for (var i = 0; i < winsToCheck.length; i++){
        if (boardIn === (winsToCheck[i] | boardIn)){
          return true;
        }
      }
      return false;
    };

    /*
    ** Checks if every cell on the board is occupied
    */
    this.gameDraw = function(boardIn){
      for (var i=0; i < BOARD_SIZE; i++){
        if (this.openCellAt(this.cellAt(i, boardIn))){
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
    this.updateGameOverStatus = function(turn, boardIn){
      if (boardSvc.gameWon(turn, boardIn.asInteger)){
        this.gameOverMessage = turn + " HAS WON";
        boardIn.inPlay = false;
      } else if (boardSvc.gameDraw(boardIn.asArray)){
        this.gameOverMessage = "IT'S A DRAW";
        boardIn.inPlay = false;
      }
    };

    /*
    ** Updates the board with the human player's move then calls the
    ** minimax function to get the AI player's move and updates the
    ** board with the AI player's move.
    */
    this.addHumanMoveThenGetAiMove = function(boardIn, moveIn, tableRow, tableCol){
      var cellToMark = boardSvc.cellAt(moveIn, boardIn.asArray);
      if (boardSvc.openCellAt(cellToMark) && boardIn.inPlay){
        cellToMark.mark = "X";                                        //use symbol HUMAN
        boardIn.asInteger += Math.pow(2,moveIn);                      //use symbol and call addMoveAsPowerOf2 for HUMAN
        this.updateGameOverStatus("X", boardIn);
        if (boardIn.inPlay){
          var AImove = AISvc.getMinimaxMove(boardIn, "O", 0);
          boardIn.asArray[AImove.row][AImove.column].mark = "O";
          boardIn.asInteger += 512*Math.pow(2,(AImove.row*3 + AImove.column)); //use symbol and call addMoveAsPowerOf2 for COMPUTER
          this.updateGameOverStatus("O", boardIn);
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
    this.getMinimaxMove = function(boardIn, turn){
      if(boardSvc.gameWon("X", boardIn.asInteger)){
        return xWonScore();
      } else if (boardSvc.gameWon("O", boardIn.asInteger)){
        return oWonScore();
      } else if (boardSvc.gameDraw(boardIn.asArray)){
        return drawScore();
      }

      var movePicked = { score: 1000 };

      for (var i=0; i < boardIn.asArray.length; i++){
        for (var j=0; j < boardIn.asArray[i].length; j++){
          if (boardIn.asArray[i][j].mark === ""){
            var newBoard = angular.copy(boardIn);

            if (turn === "X"){
              newBoard.asArray[i][j].mark = "X";
              newBoard.asInteger += Math.pow(2,((3*i)+j));
            } else {
              newBoard.asArray[i][j].mark = "O";
              newBoard.asInteger += 512*Math.pow(2,((3*i)+j));
            }
            var nextPlayer = (turn === "O") ? "X" : "O";
            var nextMove = this.getMinimaxMove(newBoard, nextPlayer);
            if (isMoveGoodFor(turn, movePicked, nextMove)){
              movePicked.score = nextMove.score;
              movePicked.row = i;
              movePicked.column = j;
            }
            if (turn === "X" && movePicked.alpha < nextMove.score){
              movePicked.alpha = nextMove.score;
            } else if (turn === "O" && movePicked.beta > nextMove.score){
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
      if (player === "X"){
        return movePicked.score < nextMoveToCompare.score;
      }
      return movePicked.score > nextMoveToCompare.score;
    };

  }]);

/*
app.directive('notification', function($timeout){
  return {
    restrict: 'E',
    replace: true,
    scope: {
      ngModel: '='
    },
    template: '<div class="alert fade" bs-alert="ngModel"></div>',
    link: function(scope, element, attrs){
      $timeout(function(){
        element.hide();
      }, 3000);
    }
  }
});

app.controller('AlertController', function($scope){
    $scope.message = {
      "type": "info",
      "title": "Success!",
      "content": "alert directive is working pretty well with 3 sec timeout"
    };
});

<notification ng-model="message"></notification>
*/


  /******************************************************************
  *************************** CONTROLLER ****************************
  *******************************************************************/

  app.controller('GameCtrl', ['$scope','$timeout',
    'AISvc', 'gameSvc','boardFty',
    function($scope, $timeout, AISvc, gameSvc,
             boardFty){

      this.newGame = function(){
        this.board = boardFty.getNew();
        this.gameOverMessage = null;
        $scope.showMessage = false;
      };

      this.getMoveFromClick = function(tableRow, tableCol){
        console.log(tableRow, tableCol);
        var index = (tableRow*3 + tableCol);
        gameSvc.addHumanMoveThenGetAiMove(this.board, index, tableRow, tableCol);
        this.showMessageIfgameEnded();
      };

      this.showMessageIfgameEnded = function(){                       // HOW TO PULL OUT INTO A DIRECTIVE OR STH, POSSIBILITY ABOVE
        if (!this.board.inPlay){ // needs be passed
          this.gameOverMessage = gameSvc.gameOverMessage;
          $scope.showMessage = true;
          $timeout(function(){
            $scope.showMessage = false;
          }, 2000);
        }
      };

      this.initializeNewGameOnLoad = function(){                      // Loads a new board object on first page load so
        return this.newGame();                                        // user doesn't have to click the newGame button
      };

      this.initializeNewGameOnLoad();                                 // Calls initializeNewGameOnLoad


    }
  ]);
})();