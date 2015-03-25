(function() {
  var app = angular.module('ticTacToe', []);

  app.controller('BoardController', function(){
    this.board = board;

    this.makeMove = function(idx){
      row = (Math.floor(idx/3));
      column = idx%3;
      if (this.board[row][column].player === "") {
        this.board[row][column].player = "X";
        //computer make move
        //evaluate for win or loss
        //message appropriately
      };
    }
  });

  var board = [
    [{idx: 0, player: ""},{idx: 1, player: ""},{idx: 2, player: ""}],
    [{idx: 3, player: ""},{idx: 4, player: ""},{idx: 5, player: ""}],
    [{idx: 6, player: ""},{idx: 7, player: ""},{idx: 8, player: ""}]
  ];
})();