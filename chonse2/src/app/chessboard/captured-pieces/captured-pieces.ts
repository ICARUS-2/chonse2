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
  @Input() playerName: string = "Player";

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

  
  getDisplayMap(): Map<string, number>
  {
    //will map the pieces to how many of each piece are present.
    const map = new Map<string, number>();

    //for each item in the captured pieces, place it into the map alongside its count.
    for(const item of this.capturedPieces)
    {
      //how many of the piece have been counted
      const itemCount = map.get(item);

      //if it doesn't exist, add it.
      if (!itemCount)
      {
        map.set(item, 1);
      }
      else //if it does, increase the count by 1
      {
        map.set(item, itemCount+1);
      }
    }

    return map;
  }
}
