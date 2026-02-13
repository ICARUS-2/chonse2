import { Component, OnInit } from '@angular/core';
import { Chessboard } from "../chessboard/chessboard/chessboard";
import { PieceType } from '../../lib/piece-type';
import Chonse2 from '../../lib/chonse2';
import { ChessBoardService } from '../chessboard/chessboard/chess-board-service';
import BoardState from '../chessboard/chessboard/board-state';
import { BoardNames } from '../boards';
import ChessComAPI from '../chessboard/api/chesscom-api';
import { ChessComGame } from '../chessboard/api/chesscom-game';

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

  BoardNames = BoardNames;

  constructor(private gameService: ChessBoardService)
  {

  }

  //testGame: Chonse2 = new Chonse2(this.testPieceState);
  testGame: Chonse2 = new Chonse2();

  async ngOnInit(){

    this.gameService.addGame(BoardNames.Analysis, new BoardState());

    //const r: ChessComGame[] = await ChessComAPI.getGamesForUser("ICARUS_2LUM1NOUS");

    //console.log(r);
  }
  
}
