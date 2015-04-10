
  app.service('AIPlayerService', function(){
    this.getMinimaxMove = function(board){
      if(/*xwins*/){
        return { score:  100,
                   row:   -1,
                column:   -1,
                 alpha:  100,
                  beta:  100
                };
      } else if (/*owins*/){
        return { score: -100,
                   row:   -1,
                column:   -1,
                 alpha: -100,
                  beta: -100
                };
      } else if (/*draw*/){
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
        //if move is possible make move on a copy of the board
          var nextMove = //minimax move on new board copy with move made
            // if
              // it's the first move (ie score = 1000)
              // || it's x's turn && lastMove.score < nextMove.score
              // || it's o's turn && lastMove.score > nextMove.score
              // update lastMove score since a better one is found for the player who is currently deciding
              // which move to make
                // update position to place move (row and column) and score of move (shift this off into helper method
                // once get code running and refactor so that first move, x move and 0 move are each their own if and
                //  the alpha and beta updates are done inside the if via ternary):
                  // lastMove.score = nextMove.score;
                  // lastMove.row = nextMove.row;
                  // lastMove.column = nextMove.column;
            // update alpha and beta
            // if it's x's turn && lastMove.alpha < nextMove.score
              // update alpha
            // if it's o's turn && lastMove.beta > nextMove.score
              // update alpha
            // if we find a case where alpha > beta (and therefore beta is less than alpha, we can cease exploring
            // the rest of the branches below
              // explanation:
              //             alpha = best found option (ie largest value) ALONG PATH TO ROOT for MAXIMIZER
              //             beta = best found option (ie smallest value) ALONG PATH TO ROOT for MINIMIZER
              // and thus when alpha > beta, the player who is deciding one move up the tree will never allow the other
              // player one move down the tree do better than the current best move, because that player already has a
              // better option along another branch and will thus never go down a branch that can only yeild a worse
              // outcome. Ie if always thinking from the human's perspective as maximizer, as soon as the human sees
              // that the AI has a value that's worse than it's best value somewhere down the tree, it will assume the
              // AI will try to make this move or a worse move, and thus, it will never allow the game to go down that
              // branch so any sub-branches do not matter.
            // since winning sooner is better than winning later, docking the move score by 1 for each step further
            // down the tree will cause the AI to choose the shortest path (note this doesn't update alpha and beta and
            // thus doesn't affect pruning, since all terminal nodes have equivalent scores and since we prune whenever
            // the score is greater than or equal to. Thus our pruning is already as efficient as it can be.
            // lastMove.score += (turn === "x" ? -1 : 1);
            // now we return lastMove (which is where we persist the score of the last chosen move
            // as well as the alpha and beta values)
            // return lastMove
    };
  });
