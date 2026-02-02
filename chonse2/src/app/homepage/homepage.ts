import { Component } from '@angular/core';
import { Chessboard } from "../chessboard/chessboard/chessboard";
import { PieceType } from '../../lib/piece-type';
import Chonse2 from '../../lib/chonse2';

@Component({
  selector: 'app-homepage',
  imports: [Chessboard],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage {

  testPieceState:Array<Array<string>> = [
    [ PieceType.BLACK_ROOK, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.BLACK_KING, PieceType.NONE, PieceType.NONE, PieceType.BLACK_ROOK],
    [ PieceType.BLACK_PAWN,       PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE,       PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE,       PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE,       PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.NONE,       PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.WHITE_PAWN,       PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.NONE],
    [ PieceType.WHITE_ROOK, PieceType.NONE, PieceType.NONE, PieceType.NONE, PieceType.WHITE_KING, PieceType.NONE, PieceType.NONE, PieceType.WHITE_ROOK]
];

  testGame: Chonse2 = new Chonse2(this.testPieceState);
}
