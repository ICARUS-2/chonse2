import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Square } from '../chessboard/square/square';
import { ChessConstants } from '../../libs/chess-game-lib/types/constants';
import Chonse2 from '../../libs/chess-game-lib/implementations/chonse2-impl/chonse2';

@Component({
  selector: 'app-static-chessboard',
  imports: [Square],
  templateUrl: './static-chessboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './static-chessboard.css',
})
export class StaticChessboard {
  COORDS = ChessConstants.COORDS;

  state = input<Chonse2>(new Chonse2());
  size = input<string>("30vmin");  
}
