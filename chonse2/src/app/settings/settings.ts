import { Component, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import LocalStorageHelper from '../chessboard/chessboard/local-storage-helper';
import { EngineDisplayName, EngineName } from '../chessboard/engine/types/enums';
import { UciEngine } from '../chessboard/engine/uciEngine';
@Component({
  selector: 'app-settings',
  imports: [FormsModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  LocalStorageHelper = LocalStorageHelper;
  EngineName = EngineName;
  EngineDisplayName = EngineDisplayName;
  Object = Object;

  //Click-move
  clickToMove: boolean = LocalStorageHelper.getBoolean(LocalStorageHelper.CLICK_TO_MOVE, false);

  //Engine
  selectedEngine: EngineName = LocalStorageHelper.getString(LocalStorageHelper.SELECTED_ENGINE, EngineName.Stockfish18Lite) as EngineName;

  //Engine depth
  engineDepth: number = LocalStorageHelper.getNumber(LocalStorageHelper.ENGINE_DEPTH, UciEngine.DEFAULT_DEPTH);

  //Click to move.
  handleClickToMoveSwitchPressed(val: boolean)
  {
    LocalStorageHelper.setBoolean(LocalStorageHelper.CLICK_TO_MOVE, val);
    this.clickToMove = val;
  }

  //Pick engine setting
  handleEngineDropdownSelectionChanged()
  {
    LocalStorageHelper.setString(LocalStorageHelper.SELECTED_ENGINE, this.selectedEngine);
  }

  //Engine depth.
  handleEngineDepthChanged()
  {
    LocalStorageHelper.setNumber(LocalStorageHelper.ENGINE_DEPTH, this.engineDepth);
  }
}
