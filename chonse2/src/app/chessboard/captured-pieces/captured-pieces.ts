import { Component, Input } from '@angular/core';
import { PieceColor } from '../../../lib/piece-color';

@Component({
  selector: 'app-captured-pieces',
  imports: [],
  templateUrl: './captured-pieces.html',
  styleUrl: './captured-pieces.css',
})
export class CapturedPieces {
  @Input() for: string = "";
  @Input() capturedPieces: Array<string> = [];
  @Input() advantage: number = 0;

  //Positive number indicates an advantage for white, negative for black. Only display the advantage if there is one for this color.
  getAbsoluteAdvantage(): number
  {
    if (this.for == PieceColor.WHITE && this.advantage > 0)
    {
      return this.advantage
    }

    if (this.for == PieceColor.BLACK && this.advantage < 0)
    {
      return -this.advantage;
    }

    return 0;
  }
}
