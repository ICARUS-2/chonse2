import { Component, computed, input } from '@angular/core';
import { EngineInformation, EngineType } from '../../../libs/engine-lib/types/enums';
import { EvalSource } from '../../../libs/engine-lib/types/eval';
import { CommonModule } from '@angular/common';
import BoardState from '../chessboard/board-state';

@Component({
  selector: 'app-engine-info-display',
  imports: [CommonModule],
  templateUrl: './engine-info-display.html',
  styleUrl: './engine-info-display.css',
})
export class EngineInfoDisplay {
  boardState = input.required<BoardState>();

  protected readonly EngineType = EngineType;
  protected readonly EvalSource = EvalSource;
  protected readonly EngineInformation = EngineInformation;

  protected engine = computed(() => this.boardState().engine());
  protected mostRecentEval = computed(() => this.boardState().getMostRecentEval());
  protected shouldShowEngineInfo = computed(() => this.boardState().doEvaluateGame());

  protected engineMetadata = computed(() => {
    const engine = this.engine();
    return engine ? EngineInformation.get(engine.name) : null;
  });

}
