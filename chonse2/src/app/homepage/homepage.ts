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

    const pgn2 = `[Event "Demonstration Game"]
[Site "Chess.com"]
[Date "2023.10.27"]
[Round "1"]
[White "Player A"]
[Black "Player B"]
[Result "1-0"]

1. e4 d5 2. exd5 Qxd5 3. Nc3 Qa5 4. d4 c6 5. Nf3 Bg4 6. Be2 e6 7. O-O Nf6 8. Ne5 Bxe2 9. Qxe2 Nbd7 10. Nc4 Qc7 11. Ne4 Nxe4 12. Qxe4 Nf6 13. Qf3 Be7 14. Bf4 Qd8 15. Rad1 O-O 16. Rfe1 Nd5 17. Be5 Bf6 18. Nd6 Bxe5 19. dxe5 Qb6 20. c4 Ne7 21. b3 Rad8 22. Rd3 Nc8 23. Red1 Nxd6 24. exd6 Rd7 25. Qe3 Qxe3 26. fxe3 Rfd8 27. c5 b6 28. b4 Kf8 29. a4 Ke8 30. a5 bxc5 31. bxc5 Rb8 32. Rd4 Rb5 33. Ra4 a6 34. Rc1 f5 35. Kf2 Kf7 36. Kf3 Kf6 37. g4 g6 38. h3 e5 39. gxf5 gxf5 40. Rh4 Kg6 41. Rg1+ Kf6 42. Rh6+ Kf7 43. Rxh7+ Ke6 44. Rg6+ Kd5 45. Rxd7 Rxa5 46. Rf7 Rxc5 47. d7 e4+ 48. Kf4 Kc4 49. d8=Q Rd5 50. Rxc6+ Kb5 51. Qb6+ Kxa4 52. Qxa6+ Kb4 53. Rb7# 1-0`
    

  const b = BoardState.parsePGN(pgn);

    console.log(b);

    this.gameService.addGame("2player", b);

  }
  
}
