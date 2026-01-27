import { Component, EventEmitter, Input, Output } from '@angular/core';
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
  @Input() isLegalMove: boolean = false;
  @Input() showPiece: boolean = true;

  @Output() mouseDown = new EventEmitter<{coordinate: string, piece: string, mouse: MouseEvent}>();
  @Output() mouseUp = new EventEmitter<{coordinate: string}>();

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

  handleMouseDown($event: MouseEvent)
  {
    this.mouseDown.emit( {coordinate: this.coordinate, piece: this.piece, mouse: $event} );
  }

  handleMouseUp()
  {
    this.mouseUp.emit( {coordinate: this.coordinate} );
  }
}
