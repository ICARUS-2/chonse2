import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BoardNames } from '../boards';
import { InputPositionBoard } from "./input-position-board/input-position-board";
import { InputPositionService } from './input-position-service';
import InputPositionState from './input-position-state';
import { RouteConstants } from '../app.routes';
import { ToastrService } from 'ngx-toastr';
import ChessGameFactory from '../../libs/chess-game-lib/chess-game-factory';

@Component({
  selector: 'app-input-position',
  imports: [InputPositionBoard],
  templateUrl: './input-position.html',
  styleUrl: './input-position.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputPosition implements OnInit {
  BoardNames = BoardNames;

  fen: string = "";

  constructor(public ips: InputPositionService, public toastrService: ToastrService)
  {

  }

  ngOnInit()
  {
    //Router data.
    const state = history.state;
    this.fen = state[RouteConstants.ROUTE_FEN];

    if (this.fen)
    {
      try 
      {
        const newState = new InputPositionState();
        newState.game.set(ChessGameFactory.createFromFen(this.fen));
        this.ips.addGame(BoardNames.InputPosition, newState);
        this.toastrService.success("Successfully imported position");
      }
      catch(ex)
      {
        this.toastrService.error("Invalid FEN, loading default editor state. ");
        this.setDefaultEditorState();
      }
    }
    else 
    {
      this.setDefaultEditorState();
    }
  }

  setDefaultEditorState()
  {
    this.ips.addGame(BoardNames.InputPosition, new InputPositionState());
  }
}
