import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BoardNames } from '../boards';
import { InputPositionBoard } from "./input-position-board/input-position-board";
import { InputPositionService } from './input-position-service';
import InputPositionState from './input-position-state';
import { ChessBoardService } from '../chessboard/chessboard/chess-board-service';

@Component({
  selector: 'app-input-position',
  imports: [InputPositionBoard],
  templateUrl: './input-position.html',
  styleUrl: './input-position.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputPosition implements OnInit {
  BoardNames = BoardNames;

  constructor(public ips: InputPositionService, public boardService: ChessBoardService)
  {

  }

  ngOnInit()
  {
    this.ips.addGame(BoardNames.InputPosition, new InputPositionState());
  }


}
