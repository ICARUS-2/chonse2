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

  progress: number = 0;
  setProgress = (n: number) =>
  {
    this.progress = n;
  }

  BoardNames = BoardNames;

  constructor(public gameService: ChessBoardService, private toastrService: ToastrService)
  {

  }
  
  testGame: Chonse2 = new Chonse2();

  async ngOnInit(){
    const state = history.state;
    this.site = state.site;
    this.username = state.username;
    this.gameId = state.gameId;
    this.inputtedPosition = state.inputtedPosition;

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
