import { Component, Input } from '@angular/core';
import { PieceColor } from '../../../lib/piece-color';
import { Square } from "../../chessboard/square/square";
import { PieceType } from '../../../lib/piece-type';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-piece-selector',
  imports: [Square, CommonModule],
  templateUrl: './piece-selector.html',
  styleUrl: './piece-selector.css',
})
export class PieceSelector {
  PieceType = PieceType;
  PieceColor = PieceColor;

  @Input() for: PieceColor = PieceColor.WHITE;

  constructor()
  {

  }
}
