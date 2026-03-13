import { ChangeDetectionStrategy, Component, EventEmitter, input, Input, Output } from '@angular/core';
import { Square } from "../../chessboard/square/square";
import { CommonModule } from '@angular/common';
import { PieceType } from '../../../chonse2-lib/piece-type';
import { PieceColor } from '../../../chonse2-lib/piece-color';

@Component({
  selector: 'app-piece-selector',
  imports: [Square, CommonModule],
  templateUrl: './piece-selector.html',
  styleUrl: './piece-selector.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PieceSelector {
  PieceType = PieceType;
  PieceColor = PieceColor;
  PieceSelector = PieceSelector;
  
  for = input<PieceColor>(PieceColor.WHITE);
  isKingActive = input<boolean>(true);

  @Output() pieceSquareMouseDownEvent: EventEmitter<{piece: string, event: PointerEvent}> = new EventEmitter<{piece: string, event: PointerEvent}>();
  @Output() deleteSquareMouseUpEvent: EventEmitter<string> = new EventEmitter<string>();
  
  static pieceOrder:ReadonlyArray<{white: string, black: string}> = 
  [
    { white: PieceType.WHITE_PAWN,   black: PieceType.BLACK_PAWN },
    { white: PieceType.WHITE_KNIGHT, black: PieceType.BLACK_KNIGHT },
    { white: PieceType.WHITE_BISHOP, black: PieceType.BLACK_BISHOP },
    { white: PieceType.WHITE_ROOK,   black: PieceType.BLACK_ROOK },
    { white: PieceType.WHITE_QUEEN,  black: PieceType.BLACK_QUEEN },
    { white: PieceType.WHITE_KING,   black: PieceType.BLACK_KING },
  ];

  constructor()
  {

  }

  
  pieceSquareMouseDown(piece: string, event: PointerEvent)
  {
    if (!this.isKingActive() && (piece == PieceType.WHITE_KING || piece == PieceType.BLACK_KING))
    {
      return;
    }

    //Fixes drag issue on mobile.
    (event.target as Element).releasePointerCapture?.(event.pointerId);

    this.pieceSquareMouseDownEvent.emit({piece, event});
  }

  deleteMouseUp()
  {
    this.deleteSquareMouseUpEvent.emit();
  }
  
}
