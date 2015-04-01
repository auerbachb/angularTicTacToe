(function(){
  var app = angular.module('ticTacToe', ['ngAnimate']);

  app.constant('winsFor', {
                           X: [7, 56, 73, 84, 146, 273, 292, 448],
                           O: [3584, 28672, 37376, 43008,
                               74752, 139776, 149504, 229376]
                          }
  )

  app.constant('boardSize', 9);

  app.service('AIPlayerService', function(){
    this.getMinimaxMove = function(board){
      for (var i=0; i < board.arrayBoard.length; i++){
        for (var j=0; j < board.arrayBoard[i].length; j++){
          if (board.arrayBoard[i][j].mark === ""){
            return {row: i, column: j};
          }
        }
      };
    };
  });

  app.controller('BoardController', ['$scope', '$timeout', 'AIPlayerService', 'winsFor', 'boardSize',
    function($scope, $timeout, AIPlayerService, winsFor, boardSize){

      this.newBoard = function(){
        return{
          integerBoard: 0,
          arrayBoard: [
          [{idx: 0, mark: ""},{idx: 1, mark: ""},{idx: 2, mark: ""}],
          [{idx: 3, mark: ""},{idx: 4, mark: ""},{idx: 5, mark: ""}],
          [{idx: 6, mark: ""},{idx: 7, mark: ""},{idx: 8, mark: ""}]
          ]
        };
      };

      this.newGame = function(){
        this.gameOverVal = false;
        this.board = this.newBoard();
      };

      this.gameWon = function(turn, intBoard){                        // Search board for win values
          for (var winValue of winsFor[turn]){                        // Choose array for X or O (cut iterations in 1/2)
            if ((winValue | intBoard) === intBoard){                  // Check if x win values are on the board with
              return true;                                            // binary or and return true if value found
            }
          }
        return false;                                                 // If binary or doesn't change intBoard no one won
      };

      this.gameOver = function(turn, board){
        this.winner = this.gameWon(turn, board.integerBoard);
        if (this.winner === true){
            this.gameOverMessage = turn + " HAS WON";
            $scope.showMessage = true;
            $timeout(function(){                             // Delay hiding of message for fade in and fade out to run
              $scope.showMessage = false;
            }, 2000);
            return true;
        } else {
          for (var i=0; i < boardSize; i++){
            if (this.open(this.cellAt(i))){
              return false;
            };
          }
        this.gameOverMessage = "IT'S A DRAW";
        $scope.showMessage = true;
        $timeout(function(){                                // Delay hiding of message for fade in and fade out to run
          $scope.showMessage = false;
        }, 2000);
        return true;
        }
      };

      this.cellAt = function(index){
        row = (Math.floor(index/3));
        column = index%3;
        return this.board.arrayBoard[row][column];
      };

      this.open = function(cell){
        return (cell.mark === "");
      };

      this.makeMove = function(index){
        moveCell = this.cellAt(index);
        if (this.open(moveCell) && !this.gameOverVal){ //O went last so test if O won
          moveCell.mark = "X";
          this.board.integerBoard += Math.pow(2,index);
          console.log('integer board value should show updated value: ', this.board.integerBoard);
          this.gameOverVal = this.gameOver("X", this.board);
          console.log('gameOverVal: ', this.gameOverVal)
          if (!this.gameOverVal){
            //aiMakeMove
            this.openMove = AIPlayerService.getMinimaxMove(this.board);
            this.board.arrayBoard[this.openMove.row][this.openMove.column].mark = "O";
            this.board.integerBoard += 512*Math.pow(2,(this.openMove.row*3 + this.openMove.column));
            console.log('integer board value should show updated value: ', this.board.integerBoard);
            this.gameOverVal = this.gameOver("O", this.board);
          };
        };
      }
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