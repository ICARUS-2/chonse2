import { ChangeDetectionStrategy, Component, computed, input, Input } from '@angular/core';
import { PieceColor } from '../../../lib/piece-color';
import ThemeService from '../../themes/theme-service';

@Component({
  selector: 'app-board-player-info',
  imports: [],
  templateUrl: './board-player-info.html',
  styleUrl: './board-player-info.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardPlayerInfo {
  for = input<string>('');
  capturedPieces = input<string[]>([]);
  advantage = input<number>(0);
  playerName = input<string>('Player');
  playerElo = input<string>('');
  clock = input<string>('');

  constructor(public themeService: ThemeService)
  {
    
  }

  //Positive number indicates an advantage for white, negative for black. Only display the advantage if there is one for this color.
  getAbsoluteAdvantage = computed( (): number => 
  {
    if (this.for() == PieceColor.WHITE && this.advantage() > 0)
    {
      return this.advantage()
    }

    if (this.for() == PieceColor.BLACK && this.advantage() < 0)
    {
      return -this.advantage();
    }

    return 0;
  })

  getDisplayMap = computed( (): Map<string, number> => 
  {
    //will map the pieces to how many of each piece are present.
    const map = new Map<string, number>();

    //for each item in the captured pieces, place it into the map alongside its count.
    for(const item of this.capturedPieces())
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
  })

}
