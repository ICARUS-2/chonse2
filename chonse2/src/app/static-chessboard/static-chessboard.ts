import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { Square } from '../chessboard/square/square';
import { ChessConstants } from '../../libs/chess-game-lib/types/constants';
import IChessGame from '../../libs/chess-game-lib/i-chess-game';
import ChessGameFactory from '../../libs/chess-game-lib/chess-game-factory';

@Component({
  selector: 'app-static-chessboard',
  imports: [Square],
  templateUrl: './static-chessboard.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './static-chessboard.css',
})
export class StaticChessboard {
  COORDS = ChessConstants.COORDS;

  state = input<IChessGame>(ChessGameFactory.create());
  size = input<string>("30vmin");  
}
