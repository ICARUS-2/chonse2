import { Component, OnInit } from '@angular/core';
import { Chessboard } from "../chessboard/chessboard/chessboard";
import { PieceType } from '../../lib/piece-type';
import Chonse2 from '../../lib/chonse2';
import { ChessBoardService } from '../chessboard/chessboard/chess-board-service';
import BoardState from '../chessboard/chessboard/board-state';

@Component({
  selector: 'app-homepage',
  imports: [Chessboard],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit{

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

  constructor(private gameService: ChessBoardService)
  {

  }

  //testGame: Chonse2 = new Chonse2(this.testPieceState);
  testGame: Chonse2 = new Chonse2();

  ngOnInit(): void {
    //TESTING PURPOSES
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
[Date "2026.02.11"]
[Round "-"]
[White "taherayadi"]
[Black "Zaklovenw01"]
[Result "1-0"]
[WhiteElo "977"]
[BlackElo "967"]
[ECO "D02"]
[UTCTime "15:00:31"]
[UTCDate "2026.02.11"]
[TimeControl "600"]
[Termination "taherayadi won by checkmate"]
[CurrentPosition "8/7R/6p1/5p1k/7P/6K1/8/8 b - - 0 46"]
[Timezone "UTC"]
[ECOUrl "https://www.chess.com/openings/Queens-Pawn-Opening-Zukertort-Variation-2...Bf5-3.Bf4"]
[StartTime "15:00:31"]
[EndDate "2026.02.11"]
[EndTime "15:10:52"]
[Link "https://www.chess.com/game/live/164544153722"]

1. d4 {[%clk 0:09:59.1]} d5 {[%clk 0:09:58.9]} 2. Nf3 {[%clk 0:09:59]} Bf5 {[%clk 0:09:50.9]} 3. Bf4 {[%clk 0:09:58.9]} e5 {[%clk 0:09:43.5]} 4. c3 {[%clk 0:09:58.8]} exf4 {[%clk 0:09:42.6]} 5. Nbd2 {[%clk 0:09:56.5]} Bd6 {[%clk 0:09:33.7]} 6. e3 {[%clk 0:09:54.9]} fxe3 {[%clk 0:09:31.2]} 7. fxe3 {[%clk 0:09:54.2]} Nf6 {[%clk 0:09:26.1]} 8. Bb5+ {[%clk 0:09:51.2]} c6 {[%clk 0:09:18.4]} 9. Ba4 {[%clk 0:09:48.5]} O-O {[%clk 0:09:17.1]} 10. O-O {[%clk 0:09:46.4]} Ne4 {[%clk 0:09:00.4]} 11. Nxe4 {[%clk 0:09:36.5]} Bxe4 {[%clk 0:08:59.3]} 12. Nd2 {[%clk 0:09:07.3]} Qg5 {[%clk 0:08:55.4]} 13. Nxe4 {[%clk 0:09:00.4]} dxe4 {[%clk 0:08:50.2]} 14. g3 {[%clk 0:08:43.4]} Nd7 {[%clk 0:08:41.4]} 15. Qe2 {[%clk 0:08:32.7]} Rae8 {[%clk 0:08:39.9]} 16. Bc2 {[%clk 0:08:24.2]} Nf6 {[%clk 0:08:36.4]} 17. Rf2 {[%clk 0:08:17.4]} Re6 {[%clk 0:08:26.7]} 18. Rg2 {[%clk 0:08:14]} a5 {[%clk 0:08:20.2]} 19. h4 {[%clk 0:08:12.2]} Qf5 {[%clk 0:08:11.1]} 20. g4 {[%clk 0:08:04.2]} Qb5 {[%clk 0:07:46.1]} 21. b3 {[%clk 0:06:53.7]} Qxe2 {[%clk 0:07:40.5]} 22. Rxe2 {[%clk 0:06:52.4]} Nxg4 {[%clk 0:07:39.3]} 23. Rf1 {[%clk 0:06:30.6]} Rg6 {[%clk 0:07:28.3]} 24. Rg2 {[%clk 0:06:17.2]} Nxe3 {[%clk 0:07:15.2]} 25. Rxg6 {[%clk 0:06:08.5]} Nxf1 {[%clk 0:07:10.9]} 26. Rxd6 {[%clk 0:05:56.8]} Ne3 {[%clk 0:07:06.2]} 27. Bxe4 {[%clk 0:05:52.5]} Re8 {[%clk 0:06:57.7]} 28. Rd7 {[%clk 0:05:10.1]} g6 {[%clk 0:06:43.2]} 29. Bg2 {[%clk 0:04:58.6]} Nxg2 {[%clk 0:06:39.8]} 30. Kxg2 {[%clk 0:04:57.1]} Re2+ {[%clk 0:06:39.1]} 31. Kg3 {[%clk 0:04:53.8]} Rxa2 {[%clk 0:06:39]} 32. Rxb7 {[%clk 0:04:52.5]} Rb2 {[%clk 0:06:31.9]} 33. c4 {[%clk 0:04:33.9]} Rd2 {[%clk 0:06:26.5]} 34. Rd7 {[%clk 0:04:22.2]} Rd3+ {[%clk 0:06:25.2]} 35. Kf2 {[%clk 0:04:06.4]} Rxb3 {[%clk 0:06:25.1]} 36. d5 {[%clk 0:04:00.3]} Rc3 {[%clk 0:06:17.5]} 37. dxc6 {[%clk 0:03:58.9]} Rxc4 {[%clk 0:06:16.6]} 38. c7 {[%clk 0:03:57.4]} a4 {[%clk 0:06:13.8]} 39. Rd8+ {[%clk 0:03:54.1]} Kg7 {[%clk 0:06:12.3]} 40. c8=Q {[%clk 0:03:52.9]} Rxc8 {[%clk 0:06:11.4]} 41. Rxc8 {[%clk 0:03:52.2]} a3 {[%clk 0:06:11.3]} 42. Ra8 {[%clk 0:03:49.3]} a2 {[%clk 0:06:11.2]} 43. Rxa2 {[%clk 0:03:48]} Kh6 {[%clk 0:06:11.1]} 44. Kg3 {[%clk 0:03:45.3]} Kh5 {[%clk 0:06:11]} 45. Ra7 {[%clk 0:03:42.3]} f5 {[%clk 0:06:10.9]} 46. Rxh7# {[%clk 0:03:40.4]} 1-0`

  const b = BoardState.parsePGN(pgn2);

    console.log(b);

    this.gameService.addGame("2player", b);

  }
  
}
