import { ChangeDetectionStrategy, Component, TemplateRef, inject, input, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PieceColor } from '../../../../libs/chess-game-lib/types/piece-color';
import { BoardPlayerInfo } from '../../board-player-info/board-player-info';
import BoardState from '../../chessboard/board-state';
import { GameInfo } from '../../game-info/game-info';
import ThemeService from '../../../themes/theme-service';

@Component({
  selector: 'app-compact-board-player-info-modal',
  imports: [CommonModule, BoardPlayerInfo, GameInfo],
  templateUrl: './compact-board-player-info-modal.html',
  styleUrl: './compact-board-player-info-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompactBoardPlayerInfoModal {
  boardState = input.required<BoardState>();
  whiteClock = input<string>("");
  blackClock = input<string>("");

  readonly PieceColor = PieceColor;
  readonly themeService = inject(ThemeService);

  private readonly modalService = inject(NgbModal);
  private readonly modalTemplate = viewChild.required<TemplateRef<unknown>>('infoModal');

  open(): void {
    this.modalService.open(this.modalTemplate(), {
      centered: true,
      scrollable: true,
    });
  }
}