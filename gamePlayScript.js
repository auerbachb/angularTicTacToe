(function() {
  var app = angular.module('ticTacToe', ['ngAnimate']);

  app.service('AIPlayerService', function(){
    this.aiMove = function(){
      console.log('aiPlayer makes a move');
    };
  });

  app.controller('BoardController', function(){

    this.activePlayer = "X"
    this.XWINS = [7, 56, 73, 84, 146, 273, 292, 448];                 // Integer values representing wins
    this.OWINS = [3584, 28672, 37376, 43008,
               74752, 139776, 149504, 229376];

    this.newBoard = function(){
      return {
        integerBoard: 0,
        arrayBoard: [
        [{idx: 0, mark: ""},{idx: 1, mark: ""},{idx: 2, mark: ""}],
        [{idx: 3, mark: ""},{idx: 4, mark: ""},{idx: 5, mark: ""}],
        [{idx: 6, mark: ""},{idx: 7, mark: ""},{idx: 8, mark: ""}]
        ]
      };
    };

    this.newGame = function(){
      this.board = this.newBoard();
      this.arrayBoard = this.board.arrayBoard;
      this.integerBoard = this.board.integerBoard;
    }

    this.gameWon = function(turn, intBoard) {                         // Tests board for win values
    if (turn === "X") {                                               // If it's x's turn
      for (var i = 0; i < this.XWINS.length; i++) {
        if ((this.XWINS[i] | intBoard) === intBoard) {                // Check if x win values are on the board with
          console.log("X won")
          return {won: true, msg: "X has won."};                      // binary or and return true if value found
        }
      }
    } else {                                                          // If it's o's turn
      for (var i = 0; i < this.OWINS.length; i++) {
        if ((this.OWINS[i] | intBoard) === intBoard) {                // Check if o win values are on the board with
          console.log("O won")
          return {won: true, msg: "O has won."};                      // binary or and return true if value found
        }
      }
    }
    return false;                                                     // If no wins found, no one has won, return false
  }

    this.makeMove = function(idx){
      row = (Math.floor(idx/3));
      column = idx%3;
      activeCell = this.arrayBoard[row][column];
      if (activeCell.mark === "") {
        activeCell.mark = "X";
        power = activeCell.idx;
        this.integerBoard += Math.pow(2,power);
        console.log('integer board value should show updated value: ', this.integerBoard)
        winner = this.gameWon("X", this.integerBoard);
        if (winner.won === true){
          alert(winner.msg);
        };
        // else
          //computer make move
        //evaluate for win or loss
        //message appropriately
      };
    }
  });
})();