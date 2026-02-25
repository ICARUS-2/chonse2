import { Component, OnInit } from '@angular/core';
import { ChessBoardService } from '../chessboard/chessboard/chess-board-service';
import { BoardNames } from '../boards';
import { Chessboard } from '../chessboard/chessboard/chessboard';
import BoardState from '../chessboard/chessboard/board-state';
import Chonse2 from '../../lib/chonse2';
import { RouteConstants } from '../app.routes';

@Component({
  selector: 'app-vs-ai',
  imports: [Chessboard],
  templateUrl: './vs-ai.html',
  styleUrl: './vs-ai.css',
})
export class VsAi implements OnInit{

  BoardNames = BoardNames;

  inputtedPosition: Chonse2 | undefined;
  
  constructor(public gameService: ChessBoardService)
  {

  }

  ngOnInit(): void 
  {
    const routeState = history.state;

    const inputtedPosition = routeState[RouteConstants.ROUTE_INPUTTED_POSITION]

    if (inputtedPosition)
    {

    }
    else 
    {
      this.setDefault();
    }
  }

  setDefault()
  {
    const bs: BoardState = new BoardState();
    bs.isVsAi = true;
    this.gameService.addGame(BoardNames.VsAi, bs);
  } 
}
