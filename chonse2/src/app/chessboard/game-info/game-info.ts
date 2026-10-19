import { Component, computed, inject, input, ChangeDetectionStrategy } from '@angular/core';
import BoardState from '../chessboard/board-state';
import ThemeService from '../../themes/theme-service';
import { PositionEval } from '../../../libs/engine-lib/types/eval';
import { CommonModule } from '@angular/common';
import { FormatTermination } from '../chessboard/pgn-misc';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import GameLinkHelper from '../chessboard/game-link-helper';
import { IconButton } from '../../ui/icon-button/icon-button';
import { NotificationService } from '../../ui/notifications/notification-service';

@Component({
  selector: 'app-game-info',
  imports: [CommonModule, IconButton, TranslatePipe],
  templateUrl: './game-info.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './game-info.css',
})
export class GameInfo {
  boardState = input.required<BoardState>();
  themeService = inject(ThemeService);
  translate = inject(TranslateService);
  notificationService = inject(NotificationService)
  router = inject(Router);

  constructor()
  {

  }

  get statusText(): string {
    const headers = this.boardState().pgnHeaders();

    const prefix = FormatTermination(headers);
    return prefix;
  }

  get turn(): string
  {
      const state = this.boardState().getCurrentState().getGameState();

      const translationKey = state.isGameOver
      ? `${state.reason} ${state.gameScore}`
      : this.boardState().getCurrentState().getTurn()
        ? 'chessboard.gameInfo.whiteToMove'
        : 'chessboard.gameInfo.blackToMove';

      return this.translate.instant(translationKey);
  }

  getOpeningDisplay = computed( () : string => 
  {
    if (!this.boardState().eval)
    {
      return "-";
    }

    const recentEval: PositionEval | undefined = this.boardState().getMostRecentEval();

    if (!recentEval)
    {
      return "-";
    }
    else 
    {
      if (recentEval.opening)
      {
        return recentEval.opening;
      }
      else 
      {
        const evaluation = this.boardState().eval();
        if (evaluation?.positions)
        {
          const l = evaluation.positions.length - 1;
          return evaluation.positions[l].opening ?? "-";
        }
      }
    }
    return "-";
  } )

  copyFenClicked()
  {    
    try 
    {
      navigator.clipboard.writeText(this.boardState().getCurrentState().getFEN());
      this.notificationService.notify('info', this.translate.instant("chessboard.gameInfo.toastr.copyFenSuccess"));
    }
    catch(ex)
    {
      this.notificationService.notify('error', this.translate.instant("chessboard.gameInfo.toastr.copyFenError"));
    }
  }

  openFenInEditorClicked()
  {
    try 
    {
      const url = GameLinkHelper.compressStringForUrl(this.boardState().getCurrentState().getFEN());
      
      this.router.navigateByUrl(`/fen/${url}`);
    }
    catch(ex)
    {
      //error occurred with FEN
    }
  }
}
