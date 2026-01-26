import { Component, Input } from '@angular/core';
import { PieceType } from '../piece-type';

@Component({
  selector: 'app-square',
  imports: [],
  templateUrl: './square.html',
  styleUrl: './square.css',
})
export class Square {
  @Input() coordinate: string = "";
  @Input() piece: string = PieceType.NONE;

  constructor()
  {

  }
}
