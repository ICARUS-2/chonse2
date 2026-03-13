import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Chessboard } from "../chessboard/chessboard/chessboard";
import Chonse2 from '../../chonse2-lib/chonse2';
import { ChessBoardService } from '../chessboard/chessboard/chess-board-service';
import BoardState from '../chessboard/chessboard/board-state';
import { BoardNames } from '../boards';
import { ChessComAPI }from '../chessboard/api/chesscom-api';
import GameLinkHelper from '../chessboard/chessboard/game-link-helper';
import { ToastrService } from 'ngx-toastr';
import { GameState } from '../../chonse2-lib/game-state';
import { RouteConstants } from '../app.routes';
import { PgnHeaders } from '../chessboard/chessboard/pgn-misc';
import { LichessAPI } from '../chessboard/api/lichess-api';
import ThemeService from '../themes/theme-service';

@Component({
  selector: 'app-homepage',
  imports: [Chessboard],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Homepage implements OnInit{

  //Import from chess site.
  site: string | undefined;
  username: string | undefined;
  gameId: string | undefined;
  
  //Import from board editor
  inputtedPosition: Chonse2 | undefined;

  //Import from PGN link
  pgnFromLink: string | undefined;

  vsAiStates: Array<Chonse2> | undefined;
  vsAiGameStates: Array<GameState> | undefined;
  vsAiMoves: Array<IMoveResult> | undefined;
  vsAiPgnHeaders: PgnHeaders | undefined;

  progress: number = 0;
  setProgress = (n: number) =>
  {
    this.progress = n;
  }

  BoardNames = BoardNames;

  constructor(public gameService: ChessBoardService, 
    private toastrService: ToastrService, 
    public themeService: ThemeService,
    private cdr: ChangeDetectorRef)
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
    this.pgnFromLink = state[RouteConstants.ROUTE_PGN];

    //Game vs AI.
    this.vsAiStates = state[RouteConstants.ROUTE_VSAI_STATES];
    this.vsAiGameStates = state[RouteConstants.ROUTE_VSAI_GAMESTATES];
    this.vsAiMoves = state[RouteConstants.ROUTE_VSAI_MOVES];
    this.vsAiPgnHeaders = state[RouteConstants.ROUTE_VSAI_PGNHEADERS];

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
            boardState.doEvaluateGame.set(true);
            this.gameService.deleteGame(BoardNames.Analysis);
            this.gameService.addGame(BoardNames.Analysis, boardState);
            this.cdr.markForCheck();
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
      else if (this.site == GameLinkHelper.LICHESS_SOURCE)
      {
        const game = await LichessAPI.getUserGameById(this.username, this.gameId);

        if (game)
        {
          try 
          {
            const boardState = BoardState.parsePGN(game.pgn);
            boardState.doEvaluateGame.set(true);
            this.gameService.deleteGame(BoardNames.Analysis);
            this.gameService.addGame(BoardNames.Analysis, boardState);
            this.cdr.markForCheck();
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
    else if (this.inputtedPosition) //from board editor
    {
      //Reconstructs the passed data into a Chonse2 object and reinitializes the game state.
      const restoredPosition = Object.assign(new Chonse2(), this.inputtedPosition);
      restoredPosition.gameState = new GameState();

      restoredPosition.checkIsGameOver();

      //Places it into a valid board state and adds it.
      const boardState = new BoardState([restoredPosition]);
      boardState.isReadOnly.set(true); //TODO WHY THE FUCK DOES THIS FIX IT
      this.gameService.deleteGame(BoardNames.Analysis);
      this.gameService.addGame(BoardNames.Analysis, boardState);
      boardState.doEvaluateGame.set(true);
    }
    else if (this.vsAiMoves && this.vsAiStates && this.vsAiGameStates && this.vsAiPgnHeaders)
    {
      //Set up board state.
      const bs = new BoardState();
      bs.isReadOnly.set(true);
      bs.doEvaluateGame.set(true);
      
      //Set positions.
      const restoredPositions = this.vsAiStates.map( s => Object.assign(new Chonse2, s) );
      bs.mainStateStack.set(restoredPositions);

      //Set game states for the positions.
      const restoredGameStates = this.vsAiGameStates?.map( s => Object.assign(new GameState, s) );
      restoredPositions.forEach( (s: Chonse2, idx: number) => s.gameState = restoredGameStates[idx]);
  
      //Set move stack.
      bs.mainMoveStack.set(this.vsAiMoves);

      //Set pgn headers.
      bs.pgnHeaders.set(this.vsAiPgnHeaders);

      //Add game to service.
      this.gameService.deleteGame(BoardNames.Analysis);
      this.gameService.addGame(BoardNames.Analysis, bs);
    }
    else if (this.pgnFromLink)
    {
      try 
      {
        const boardState = BoardState.parsePGN(this.pgnFromLink.trim());
        boardState.doEvaluateGame.set(true);
        this.gameService.deleteGame(BoardNames.Analysis);
        this.gameService.addGame(BoardNames.Analysis, boardState);
        this.cdr.markForCheck();
        this.toastrService.success("Game import successful.");
      }
      catch(ex) //If PGN parse failed.
      {
        this.toastrService.error("Import failed - PGN parse failed.")
        this.setDefaultBoard();
      }
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
