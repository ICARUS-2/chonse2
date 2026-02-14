import { Component, OnInit } from '@angular/core';
import { Chessboard } from "../chessboard/chessboard/chessboard";
import { PieceType } from '../../lib/piece-type';
import Chonse2 from '../../lib/chonse2';
import { ChessBoardService } from '../chessboard/chessboard/chess-board-service';
import BoardState from '../chessboard/chessboard/board-state';
import { BoardNames } from '../boards';
import ChessComAPI from '../chessboard/api/chesscom-api';
import { ChessComGame } from '../chessboard/api/chesscom-game';
import GameLinkHelper from '../chessboard/chessboard/game-link-helper';
import { ToastrService } from 'ngx-toastr';
import { UciEngine } from '../chessboard/engine/uciEngine';
import { EngineName } from '../chessboard/engine/types/enums';
import { GameEval } from '../chessboard/engine/types/eval';

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

  //TESTING PURPOSES
  testPieceState:Array<Array<string>> = [
    [ PieceType.BLACK_KING, PieceType.NONE, PieceType.WHITE_KING, PieceType.NONE, PieceType.NONE, PieceType.NONE,PieceType.NONE, PieceType.WHITE_BISHOP],
    [ PieceType.BLACK_QUEEN, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.BLACK_BISHOP],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE]
  ];

  progress: number = 0;
  setProgress = (n: number) =>
  {
    this.progress = n;
  }

  BoardNames = BoardNames;

  constructor(public gameService: ChessBoardService, private toastrService: ToastrService)
  {

  }

  //testGame: Chonse2 = new Chonse2(this.testPieceState);
  testGame: Chonse2 = new Chonse2();

  async ngOnInit(){
    const state = history.state;
    this.site = state.site;
    this.username = state.username;
    this.gameId = state.gameId;

    if (this.site && this.username && this.gameId)
    {
      if (this.site == GameLinkHelper.CHESSCOM_SOURCE)
      {
        const game = await ChessComAPI.getUserGameById(this.username, this.gameId);

        if (game)
        {
          try 
          {
            this.gameService.addGame(BoardNames.Analysis, BoardState.parsePGN(game.pgn));
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
    else 
    {
      this.setDefaultBoard();
    }
        const pgn = `
[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.01.12"]
[Round "-"]
[White "ICARUS_2LUM1NOUS"]
[Black "Nenartovich"]
[Result "1-0"]
[WhiteElo "709"]
[BlackElo "653"]
[ECO "D00"]
[UTCTime "22:48:48"]
[UTCDate "2026.01.12"]
[TimeControl "900+10"]
[Termination "ICARUS_2LUM1NOUS won by resignation"]
[CurrentPosition "1q1k4/2pb3p/5Q2/8/8/4PNBP/3N1PP1/6K1 b - - 0 27"]
[Timezone "UTC"]
[ECOUrl "https://www.chess.com/openings/Queens-Pawn-Opening-Accelerated-London-System"]
[StartTime "22:48:48"]
[EndDate "2026.01.12"]
[EndTime "23:04:41"]
[Link "https://www.chess.com/game/live/147934856372"]

d4 {[%clk 0:15:09]} d5 {[%clk 0:15:08]} 2. Bf4 {[%clk 0:15:17.6]} f6 {[%clk 0:15:16.2]} 3. e3 {[%clk 0:15:26.7]} e5 {[%clk 0:15:24.6]} 4. dxe5 {[%clk 0:15:30.9]} fxe5 {[%clk 0:15:32.9]} 5. Bxe5 {[%clk 0:15:35.7]} Nc6 {[%clk 0:15:39.9]} 6. Bg3 {[%clk 0:15:00.2]} g6 {[%clk 0:15:17.2]} 7. Bb5 {[%clk 0:14:42.9]} Bg7 {[%clk 0:15:23.9]} 8. c3 {[%clk 0:14:22.1]} a6 {[%clk 0:15:27]} 9. Bxc6+ {[%clk 0:14:30.6]} bxc6 {[%clk 0:15:34.4]} 10. Qa4 {[%clk 0:13:41.3]} Bd7 {[%clk 0:15:30.3]} 11. Nf3 {[%clk 0:12:59]} Qb8 {[%clk 0:15:37.1]} 12. Qc2 {[%clk 0:12:32]} Ra7 {[%clk 0:15:34.1]} 13. b3 {[%clk 0:12:32.2]} a5 {[%clk 0:15:41.2]} 14. Qxg6+ {[%clk 0:12:34.5]} Kf8 {[%clk 0:15:42.1]} 15. O-O {[%clk 0:12:15.2]} a4 {[%clk 0:15:48.5]} 16. Nbd2 {[%clk 0:11:37.8]} axb3 {[%clk 0:15:53.8]} 17. axb3 {[%clk 0:11:36.9]} Rxa1 {[%clk 0:16:00.5]} 18. Rxa1 {[%clk 0:11:44.8]} Bxc3 {[%clk 0:16:06.7]} 19. Qb1 {[%clk 0:10:29.8]} Bxa1 {[%clk 0:14:39.7]} 20. Qxa1 {[%clk 0:10:32.6]} c5 {[%clk 0:13:52.1]} 21. Qxh8 {[%clk 0:10:36.2]} c4 {[%clk 0:14:00]} 22. bxc4 {[%clk 0:09:29.3]} dxc4 {[%clk 0:13:56.4]} 23. h3 {[%clk 0:09:31.7]} c3 {[%clk 0:13:52.6]} 24. Qxc3 {[%clk 0:09:35.7]} Nf6 {[%clk 0:13:53]} 25. Qc5+ {[%clk 0:09:14.2]} Ke8 {[%clk 0:13:55.3]} 26. Qe5+ {[%clk 0:09:12.4]} Kd8 {[%clk 0:13:59.1]} 27. Qxf6+ {[%clk 0:09:19.1]} 1-0`.trim();
          
const pgn2 = `[Event "Live Chess"]
[Site "Chess.com"]
[Date "2026.02.13"]
[Round "-"]
[White "farxodaxmedjonov"]
[Black "Zaklovenw01"]
[Result "0-1"]
[WhiteElo "953"]
[BlackElo "982"]
[ECO "C44"]
[UTCTime "18:05:20"]
[UTCDate "2026.02.13"]
[TimeControl "600"]
[Termination "Zaklovenw01 won by resignation"]
[CurrentPosition "r1b1kbnr/pppp1ppp/5q2/3P1P2/3QPB2/5nP1/PPP4P/RN2KB1R w KQkq - 3 11"]
[Timezone "UTC"]
[ECOUrl "https://www.chess.com/openings/Kings-Pawn-Opening-Kings-Knight-Variation-2...Nc6"]
[StartTime "18:05:20"]
[EndDate "2026.02.13"]
[EndTime "18:06:40"]
[Link "https://www.chess.com/game/live/164645294650"]

1. e4 {[%clk 0:09:58.5]} e5 {[%clk 0:09:58.9]} 2. Nf3 {[%clk 0:09:49.6]} Nc6 {[%clk 0:09:57]} 3. Nxe5 {[%clk 0:09:45]} Nxe5 {[%clk 0:09:55.2]} 4. d4 {[%clk 0:09:43]} Nc6 {[%clk 0:09:46.2]} 5. d5 {[%clk 0:09:41.3]} Ne5 {[%clk 0:09:44.7]} 6. f4 {[%clk 0:09:38.4]} Ng6 {[%clk 0:09:35.1]} 7. f5 {[%clk 0:09:36.9]} Ne5 {[%clk 0:09:34.4]} 8. Bf4 {[%clk 0:09:32.9]} Qh4+ {[%clk 0:09:32.2]} 9. g3 {[%clk 0:09:31.2]} Qf6 {[%clk 0:09:27.7]} 10. Qd4 {[%clk 0:09:28.9]} Nf3+ {[%clk 0:09:22.8]} 0-1`
  
    
    //const bs = BoardState.parsePGN(pgn);
    //const engine = await UciEngine.getEngine(EngineName.Stockfish18Lite);
    //const params = bs.getEvaluateGameParams();
    //params.setEvaluationProgress = this.setProgress;
    //const result: GameEval = await engine.evaluateGame(params);
    //console.log(result);
  }
  
  setDefaultBoard()
  {
    this.gameService.addGame(BoardNames.Analysis, new BoardState());
  }
}
