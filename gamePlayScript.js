(function(){
  var app = angular.module('ticTacToe', ['ngAnimate']);

  app.service('AIPlayerService', function(){
    this.aiMove = function(){
      console.log('aiPlayer makes a move');
    };
  });

  app.controller('BoardController', ['$scope', '$timeout',
    function($scope, $timeout){

      this.activePlayer = "X"
      this.XWINS = [7, 56, 73, 84, 146, 273, 292, 448];               // Integer values representing wins
      this.OWINS = [3584, 28672, 37376, 43008,
      74752, 139776, 149504, 229376];

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

      this.gameWon = function(turn, intBoard){                        // Tests board for win values
        if (turn === "X"){                                            // If it's x's turn
          for (var i = 0; i < this.XWINS.length; i++){
            console.log("intBoard ", intBoard);
            if ((this.XWINS[i] | intBoard) === intBoard){             // Check if x win values are on the board with
              console.log("X won");
              return{won: true, msg: "X HAS WON"};                    // binary or and return true if value found
            }
          }
        } else{                                                       // If it's o's turn
          for (var i = 0; i < this.OWINS.length; i++){
            if ((this.OWINS[i] | intBoard) === intBoard){             // Check if o win values are on the board with
              console.log("O won");
              return{won: true, msg: "O HAS WON"};                    // binary or and return true if value found
            }
          }
        }
        return {won: false};;                                         // If no wins found, no one has won, return false
      };

      this.gameOver = function(turn, board){
        this.winner = this.gameWon(turn, board.integerBoard);
        console.log("this.winner.won ", this.winner.won);
        if (this.winner.won === true){
            console.log('in this.winner.won === true scenario')
            this.gameOverMessage = this.winner.msg;
            $scope.showMessage = true;
            $timeout(function(){                                      // Delay hiding of message for fade in and fade out to run
              $scope.showMessage = false;
            }, 2000);
            return true;
            console.log('no one won')
        } else {
          for (var i=0; i < board.arrayBoard.length; i++){
            for(var j=0; j < board.arrayBoard[i].length; j++){
              if (board.arrayBoard[i][j].mark === ""){
                return false;
              }
            }
          };
        this.gameOverMessage = "IT'S A DRAW";
        $scope.showMessage = true;
        $timeout(function(){                                      // Delay hiding of message for fade in and fade out to run
          $scope.showMessage = false;
        }, 2000);
        return true;
        }
      };

      this.makeMove = function(idx){
        row = (Math.floor(idx/3));
        column = idx%3;
        activeCell = this.board.arrayBoard[row][column];
        if (activeCell.mark === "" && !this.gameOverVal){
          activeCell.mark = "X";
          power = activeCell.idx;
          this.board.integerBoard += Math.pow(2,power);
          console.log('integer board value should show updated value: ', this.board.integerBoard);
          this.gameOverVal = this.gameOver("X", this.board);
          console.log('gameOverVal: ', this.gameOverVal)
        };

        if (!this.gameOverVal){
          //aiMakeMove
          this.pickMove = function(){
            for (var i=0; i < this.board.arrayBoard.length; i++){
              for(var j=0; j < this.board.arrayBoard[i].length; j++){
                if (this.board.arrayBoard[i][j].mark === ""){
                  return {row: i, column: j};
                }
              }
            };
          };
          this.openMove = this.pickMove();
          this.board.arrayBoard[this.openMove.row][this.openMove.column].mark = "O";
          this.board.integerBoard += 512*Math.pow(2,(this.openMove.row*3 + this.openMove.column));
          console.log('integer board value should show updated value: ', this.board.integerBoard);
          this.gameOverVal = this.gameOver("O", this.board);
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