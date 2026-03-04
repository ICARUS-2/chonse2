import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { PieceColor } from '../../../lib/piece-color';
import { Square } from "../../chessboard/square/square";
import { PieceType } from '../../../lib/piece-type';
import { CommonModule } from '@angular/common';

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
  
  @Input() for: PieceColor = PieceColor.WHITE;
  @Input() isKingActive: boolean = true;

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
    if (!this.isKingActive && (piece == PieceType.WHITE_KING || piece == PieceType.BLACK_KING))
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
