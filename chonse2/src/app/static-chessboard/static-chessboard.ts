import { Component, input } from '@angular/core';
import Chonse2 from '../../libs/chonse2-lib/chonse2';
import { Square } from '../chessboard/square/square';

@Component({
  selector: 'app-static-chessboard',
  imports: [Square],
  templateUrl: './static-chessboard.html',
  styleUrl: './static-chessboard.css',
})
export class StaticChessboard {
  COORDS = Chonse2.COORDS;

  state = input<Chonse2>(new Chonse2());
  size = input<string>("30vmin");  
}
