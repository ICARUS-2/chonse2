import { Component, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import LocalStorageHelper from '../chessboard/chessboard/local-storage-helper';
import { EngineDisplayName, EngineName } from '../chessboard/engine/types/enums';
import { UciEngine } from '../chessboard/engine/uciEngine';
import { Themes } from '../themes/themes';
import ThemeService from '../themes/theme-service';
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
  Themes = Themes;

  constructor(private themeService: ThemeService)
  {

  }

  //Click-move
  clickToMove: boolean = LocalStorageHelper.getBoolean(LocalStorageHelper.CLICK_TO_MOVE, false);

  //Engine
  selectedEngine: EngineName = LocalStorageHelper.getString(LocalStorageHelper.SELECTED_ENGINE, EngineName.Stockfish18Lite) as EngineName;

  //Engine depth
  engineDepth: number = LocalStorageHelper.getNumber(LocalStorageHelper.ENGINE_DEPTH, UciEngine.DEFAULT_DEPTH);

  //Theme
  selectedTheme: Themes = LocalStorageHelper.getString(LocalStorageHelper.SELECTED_THEME, ThemeService.DEFAULT_THEME) as Themes;

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

  //Theme select
  handleThemeDropdownSelectionChanged()
  {
    LocalStorageHelper.setString(LocalStorageHelper.SELECTED_THEME, this.selectedTheme);
    this.themeService.setTheme(this.selectedTheme);
  }
}
