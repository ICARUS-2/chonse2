import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PieceType } from '../../../lib/piece-type';

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
  @Input() isFlipped: boolean = false;
  @Input() isInCheck: boolean = false;
  @Input() isCheckmate: boolean = false;
  @Input() isDraw: boolean = false;
  @Input() isWinner: boolean = false;
  @Input() isClicked: boolean = false;

  @Output() mouseDown = new EventEmitter<{coordinate: string, piece: string, mouse: PointerEvent}>();
  @Output() mouseUp = new EventEmitter<{coordinate: string, mouse: PointerEvent}>();
  @Output() leftClick = new EventEmitter<{coordinate: string, mouse: PointerEvent}>
  @Output() rightClick = new EventEmitter<{coordinate: string}>();

  lightColor: string = "white"
  darkColor: string = "rgb(85,150,242)";
  lightPressedColor: string = "pink";
  darkPressedColor: string = "hotpink"

  constructor()
  {

  }

  getColor(): string
  {
    if (this.isClicked)
    {
      return this.isDark ? this.darkPressedColor : this.lightPressedColor;
    }
    return this.isDark ? this.darkColor : this.lightColor;
  }

  getReverseColor(): string 
  {
    return this.isDark ? this.lightColor : this.darkColor;
  }

  handleMouseDown($event: PointerEvent)
  {
    this.mouseDown.emit( {coordinate: this.coordinate, piece: this.piece, mouse: $event} );
  }

  handleMouseUp($event: PointerEvent)
  {
    this.mouseUp.emit( {coordinate: this.coordinate, mouse: $event} );
  }

  handleRightClick(event: PointerEvent)
  {
    event.preventDefault();
  }

  handleLeftClick(event: PointerEvent)
  {
    if (event.button != 0)
    {
      return;
    }
    this.leftClick.emit();
  }
}
