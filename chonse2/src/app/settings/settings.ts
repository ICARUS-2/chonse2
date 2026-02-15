import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import LocalStorageHelper from '../chessboard/chessboard/local-storage-helper';
import { EngineDisplayName, EngineName } from '../chessboard/engine/types/enums';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  localStorage = LocalStorageHelper;

  //Click-move
  clickToMove: boolean = LocalStorageHelper.getBoolean(LocalStorageHelper.CLICK_TO_MOVE, false);

  //Engine
  //Looks stupid, but is used so that it can be accessed in the HTML.
  EngineName = EngineName;
  EngineDisplayName = EngineDisplayName;
  Object = Object;
  selectedEngine: EngineName = LocalStorageHelper.getString(LocalStorageHelper.SELECTED_ENGINE, EngineName.Stockfish18Lite) as EngineName;

  handleClickToMoveSwitchPressed(val: boolean)
  {
    LocalStorageHelper.setBoolean(LocalStorageHelper.CLICK_TO_MOVE, val);
    this.clickToMove = val;
  }

  handleDropdownSelectionChanged()
  {
    LocalStorageHelper.setString(LocalStorageHelper.SELECTED_ENGINE, this.selectedEngine);
  }
}
