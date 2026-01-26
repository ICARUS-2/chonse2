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
  @Input() isDark: boolean = false;
  @Input() showRank: boolean = false;
  @Input() showFile: boolean = true;

  darkColor = "rgb(85,150,242)";

  constructor()
  {

  }

  getColor(): string
  {
    return this.isDark ? this.darkColor : "white";
  }

  getReverseColor(): string 
  {
    return this.isDark ? "white" : this.darkColor;
  }
}
