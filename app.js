(function() {
  var app = angular.module('ticTacToe', []);

  app.service('AIPlayerService', function(){
    this.aiMove = function(){
      console.log('aiPlayer makes a move');
    };
  });

  app.controller('BoardController', function(){
    this.board = board.arrayBoard;
    this.integerBoard = board.integerBoard;

    this.makeMove = function(idx){
      row = (Math.floor(idx/3));
      column = idx%3;
      activeCell = this.board[row][column];
      if (activeCell.mark === "") {
        activeCell.mark = "X";
        power = activeCell.idx;
        this.integerBoard += Math.pow(2,power);
        console.log('integer board value should show updated value: ', this.integerBoard)
        //computer make move
        //evaluate for win or loss
        //message appropriately
      };
    }
  });

  var board = {
    integerBoard: 0,
    arrayBoard: [
      [{idx: 0, mark: ""},{idx: 1, mark: ""},{idx: 2, mark: ""}],
      [{idx: 3, mark: ""},{idx: 4, mark: ""},{idx: 5, mark: ""}],
      [{idx: 6, mark: ""},{idx: 7, mark: ""},{idx: 8, mark: ""}]
    ]
  };

})();