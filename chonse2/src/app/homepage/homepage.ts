import { Component, OnInit } from '@angular/core';
import { Chessboard } from "../chessboard/chessboard/chessboard";
import { PieceType } from '../../lib/piece-type';
import Chonse2 from '../../lib/chonse2';
import { ChessBoardService } from '../chessboard/chessboard/chess-board-service';
import BoardState from '../chessboard/chessboard/board-state';
import { BoardNames } from '../boards';
import ChessComAPI from '../chessboard/api/chesscom-api';
import GameLinkHelper from '../chessboard/chessboard/game-link-helper';
import { ToastrService } from 'ngx-toastr';
import { GameState } from '../../lib/game-state';
import { RouteConstants } from '../app.routes';

@Component({
  selector: 'app-homepage',
  imports: [Chessboard],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit{

  site: string | undefined;
  username: string | undefined;
  gameId: string | undefined;
  inputtedPosition: Chonse2 | undefined;

  vsAiStates: Array<Chonse2> | undefined;
  vsAiGameStates: Array<GameState> | undefined;
  vsAiMoves: Array<IMoveResult> | undefined;

  progress: number = 0;
  setProgress = (n: number) =>
  {
    this.progress = n;
  }

  BoardNames = BoardNames;

  constructor(public gameService: ChessBoardService, private toastrService: ToastrService)
  {

  }

  async ngOnInit(){
    //Router data.
    const state = history.state;

    //Import game.
    this.site = state[RouteConstants.ROUTE_SITE];
    this.username = state[RouteConstants.ROUTE_USERNAME];
    this.gameId = state[RouteConstants.ROUTE_GAMEID];
    this.inputtedPosition = state[RouteConstants.ROUTE_INPUTTED_POSITION];

    //Game vs AI.
    this.vsAiStates = state[RouteConstants.ROUTE_VSAI_STATES];
    this.vsAiGameStates = state[RouteConstants.ROUTE_VSAI_GAMESTATES];
    this.vsAiMoves = state[RouteConstants.ROUTE_VSAI_MOVES];

    if (this.site && this.username && this.gameId)
    {
      if (this.site == GameLinkHelper.CHESSCOM_SOURCE)
      {
        const game = await ChessComAPI.getUserGameById(this.username, this.gameId);

        if (game)
        {
          try 
          {
            const boardState = BoardState.parsePGN(game.pgn);
            boardState.doEvaluateGame = true;
            this.gameService.addGame(BoardNames.Analysis, boardState);
            this.toastrService.success("Game import successful.");
          }
          catch(ex) //If PGN parse failed.
          {
            this.toastrService.error("Import failed - PGN parse failed.")
            this.setDefaultBoard();
          }
        }
        else //If the game was not found.
        {
          this.toastrService.error("Import failed - Game not found.")
          this.setDefaultBoard();
        }
      }
      else //If the site source is not valid
      {
        this.toastrService.error("Import failed - Invalid source.");
        this.setDefaultBoard();
      }
    }
    else if (this.inputtedPosition)
    {
      //Reconstructs the passed data into a Chonse2 object and reinitializes the game state.
      const restoredPosition = Object.assign(new Chonse2(), this.inputtedPosition);
      restoredPosition.gameState = new GameState();

      restoredPosition.checkIsGameOver();

      //Places it into a valid board state and adds it.
      const boardState = new BoardState([restoredPosition]);
      boardState.doEvaluateGame = true;

      this.gameService.deleteGame(BoardNames.Analysis);
      this.gameService.addGame(BoardNames.Analysis, boardState);
    }
    else if (this.vsAiMoves && this.vsAiStates && this.vsAiGameStates)
    {
      const bs = new BoardState();
      bs.isReadOnly = true;
      bs.doEvaluateGame = true;
      
      const restoredPositions = this.vsAiStates.map( s => Object.assign(new Chonse2, s) );
      bs.mainStateStack = restoredPositions;

      const restoredGameStates = this.vsAiGameStates?.map( s => Object.assign(new GameState, s) );
      restoredPositions.forEach( (s: Chonse2, idx: number) => s.gameState = restoredGameStates[idx]);

      bs.mainMoveStack = this.vsAiMoves;

      this.gameService.deleteGame(BoardNames.Analysis);
      this.gameService.addGame(BoardNames.Analysis, bs);
    }
    else 
    {
      this.setDefaultBoard();
    }
  }
  
  setDefaultBoard()
  {
    this.gameService.addGame(BoardNames.Analysis, new BoardState());
  }
}
