import { Component, input, output } from '@angular/core';
import BoardState from '../chessboard/board-state';
import { MoveClassification } from '../../../libs/engine-lib/types/enums';
import { CommonModule } from '@angular/common';
import { DivergenceTableEntry } from '../divergence-table-entry/divergence-table-entry';
import ChessboardHelper from '../helpers';
import ThemeService from '../../themes/theme-service';

@Component({
  selector: 'app-moves-table',
  imports: [DivergenceTableEntry, CommonModule],
  templateUrl: './moves-table.html',
  styleUrl: './moves-table.css',
})
export class MovesTable {
  ChessboardHelper = ChessboardHelper

  //Inputs
  boardState = input.required<BoardState>();

  //Outputs
  moveClicked = output<number>();

  //Expose enum to template
  protected readonly MoveClassification = MoveClassification;

  constructor(public themeService: ThemeService)
  {

  }
}
