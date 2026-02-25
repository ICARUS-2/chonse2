import { Component, OnInit } from '@angular/core';
import { ChessBoardService } from '../chessboard/chessboard/chess-board-service';
import { BoardNames } from '../boards';
import { Chessboard } from '../chessboard/chessboard/chessboard';
import BoardState from '../chessboard/chessboard/board-state';

@Component({
  selector: 'app-vs-ai',
  imports: [Chessboard],
  templateUrl: './vs-ai.html',
  styleUrl: './vs-ai.css',
})
export class VsAi implements OnInit{

  BoardNames = BoardNames;


  constructor(public gameService: ChessBoardService)
  {

  }

  ngOnInit(): void 
  {
    const bs: BoardState = new BoardState();
    bs.isVsAi = true;
    this.gameService.addGame(BoardNames.VsAi, bs);
  }
}
