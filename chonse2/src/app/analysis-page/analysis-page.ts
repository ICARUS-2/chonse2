import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Chessboard } from "../chessboard/chessboard/chessboard";
import { ChessBoardService } from '../chessboard/chessboard/chess-board-service';
import BoardState from '../chessboard/chessboard/board-state';
import { BoardNames } from '../boards';
import { ChessComAPI }from '../../libs/server-api-lib/chesscom-api';
import GameLinkHelper from '../chessboard/chessboard/game-link-helper';
import { ToastrService } from 'ngx-toastr';
import { RouteConstants } from '../app.routes';
import { PgnHeaders } from '../chessboard/chessboard/pgn-misc';
import { LichessAPI } from '../../libs/server-api-lib/lichess-api';
import ThemeService from '../themes/theme-service';
import Chonse2, { PreviousStateCache } from '../../libs/chonse2-lib/chonse2';
import { GameState } from '../../libs/chonse2-lib/game-state';
import MoveResult from '../chessboard/chessboard/move-result';
import LocalStorageHelper from '../../libs/local-storage-helper';
import { compress } from 'lz-string';

@Component({
  selector: 'app-analysis-page',
  imports: [Chessboard],
  templateUrl: './analysis-page.html',
  styleUrl: './analysis-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnalysisPage implements OnInit{

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
  vsAiMoves: Array<MoveResult> | undefined;
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
      //if game was imported from chess.com source
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

            if (boardState.pgnHeaders().white.toLowerCase() != this.username.toLowerCase())
            {
              boardState.isFlipped.set(true);
            }

            this.cdr.markForCheck();
            this.toastrService.success("Game import successful.");

            //save as the most recent pgn analyzed
            LocalStorageHelper.setString(LocalStorageHelper.LAST_PGN, GameLinkHelper.compressStringForUrl(game.pgn));
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
      else if (this.site == GameLinkHelper.LICHESS_SOURCE) //if game was imported from lichess
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

            if (boardState.pgnHeaders().white.toLowerCase() != this.username.toLowerCase())
            {
              boardState.isFlipped.set(true);
            }


            this.cdr.markForCheck();
            this.toastrService.success("Game import successful.");

            //save as the most recent pgn analyzed
            LocalStorageHelper.setString(LocalStorageHelper.LAST_PGN, GameLinkHelper.compressStringForUrl(game.pgn));
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
      restoredPosition.stateCache = new PreviousStateCache();

      restoredPosition.checkIsGameOver();

      //Places it into a valid board state and adds it.
      const boardState = new BoardState([restoredPosition]);
      boardState.isReadOnly.set(true);
      this.gameService.deleteGame(BoardNames.Analysis);
      this.gameService.addGame(BoardNames.Analysis, boardState);
      boardState.doEvaluateGame.set(true);
    }
    else if (this.vsAiMoves && this.vsAiStates && this.vsAiGameStates && this.vsAiPgnHeaders) //if it was imported from vs ai
    {
      //Set up board state.
      const bs = new BoardState();
      bs.isReadOnly.set(true);
      bs.doEvaluateGame.set(true);
      
      //Set positions.
      const restoredPositions = this.vsAiStates.map( s => Object.assign(new Chonse2, s) );
      bs.mainStateStack.set(restoredPositions);

      //ensures that every state has a cache
      restoredPositions.forEach(p => 
        {
          p.stateCache = new PreviousStateCache();  
        }
      )

      //Set game states for the positions.
      const restoredGameStates = this.vsAiGameStates?.map( s => Object.assign(new GameState, s) );
      restoredPositions.forEach( (s: Chonse2, idx: number) => s.gameState = restoredGameStates[idx]);
  
      //Set move stack.
      const restoredMoveStack = this.vsAiMoves.map( m => Object.assign(new MoveResult, m) )
      bs.mainMoveStack.set(restoredMoveStack);

      //Set pgn headers.
      bs.pgnHeaders.set(this.vsAiPgnHeaders);

      //Add game to service.
      this.gameService.deleteGame(BoardNames.Analysis);
      this.gameService.addGame(BoardNames.Analysis, bs);
    }
    else if (this.pgnFromLink) //if it was imported via PGN Link
    {
      try 
      {
        const boardState = BoardState.parsePGN(this.pgnFromLink.trim());
        boardState.doEvaluateGame.set(true);
        this.gameService.deleteGame(BoardNames.Analysis);
        this.gameService.addGame(BoardNames.Analysis, boardState);
        this.cdr.markForCheck();
        this.toastrService.success("Game import successful.");

        //save as the most recent pgn analyzed
        LocalStorageHelper.setString(LocalStorageHelper.LAST_PGN, GameLinkHelper.compressStringForUrl(this.pgnFromLink));
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
