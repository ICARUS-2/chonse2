import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { BoardNames } from '../boards';
import { InputPositionBoard } from "./input-position-board/input-position-board";
import { InputPositionService } from './input-position-service';
import InputPositionState from './input-position-state';
import { RouteConstants } from '../app.routes';
import EditorState from './editor-state/editor-state';
import { NotificationService } from '../ui/notifications/notification-service';

@Component({
  selector: 'app-input-position',
  imports: [InputPositionBoard],
  templateUrl: './input-position.html',
  styleUrl: './input-position.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InputPosition implements OnInit {
  ips = inject(InputPositionService);
  private notificationService = inject(NotificationService);

  BoardNames = BoardNames;

  fen: string = "";

  constructor()
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
        newState.editorState.set(EditorState.instantiateFromFen(this.fen));
        this.ips.deleteGame(BoardNames.InputPosition);
        this.ips.addGame(BoardNames.InputPosition, newState);
        this.notificationService.notify('success', "Successfully imported position");
      }
      catch(ex)
      {
        this.notificationService.notify('error', "Invalid FEN, loading default editor state. ");
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
