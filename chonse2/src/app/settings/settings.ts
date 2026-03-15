import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import LocalStorageHelper from '../chessboard/chessboard/local-storage-helper';
import { Themes } from '../themes/themes';
import ThemeService from '../themes/theme-service';
import { CommonModule } from '@angular/common';
import { form, FormField, max, min } from '@angular/forms/signals';
import { EngineDisplayName, EngineName } from '../../engine-lib/types/enums';
import { UciEngine } from '../../engine-lib/uciEngine';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, FormsModule, CommonModule, FormField, NgbTooltip],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Settings {
  LocalStorageHelper = LocalStorageHelper;
  EngineName = EngineName;
  EngineDisplayName = EngineDisplayName;
  Object = Object;
  Themes = Themes;

  formModel = signal<FormModel>(
  {
    clickToMove:  LocalStorageHelper.getBoolean(LocalStorageHelper.CLICK_TO_MOVE, false),
    selectedEngine: LocalStorageHelper.getString(LocalStorageHelper.SELECTED_ENGINE, EngineName.Stockfish18Lite) as EngineName,
    engineDepth:  LocalStorageHelper.getNumber(LocalStorageHelper.ENGINE_DEPTH, UciEngine.DEFAULT_DEPTH),
    cloudHybridMode: LocalStorageHelper.getBoolean(LocalStorageHelper.CLOUD_HYBRID_MODE, false),
    selectedTheme: LocalStorageHelper.getString(LocalStorageHelper.SELECTED_THEME, ThemeService.DEFAULT_THEME) as Themes
  })

  form = form(this.formModel, (schema) => 
  {
    min(schema.engineDepth, 14),
    max(schema.engineDepth, 22)
  })

  constructor(public themeService: ThemeService)
  {

  }

  //Click to move.
  handleClickToMoveSwitchPressed(val: boolean)
  {
    LocalStorageHelper.setBoolean(LocalStorageHelper.CLICK_TO_MOVE, val);
  }

  //Pick engine setting
  handleEngineDropdownSelectionChanged()
  {
    LocalStorageHelper.setString(LocalStorageHelper.SELECTED_ENGINE, this.form.selectedEngine().value());
  }

  //Engine depth.
  handleEngineDepthChanged()
  {
    LocalStorageHelper.setNumber(LocalStorageHelper.ENGINE_DEPTH, this.form.engineDepth().value());
  }

  //Cloud hybrid
  handleCloudHybridChanged(val: boolean)
  {
    LocalStorageHelper.setBoolean(LocalStorageHelper.CLOUD_HYBRID_MODE, this.form.cloudHybridMode().value());   
  }

  //Theme select
  handleThemeDropdownSelectionChanged()
  {
    LocalStorageHelper.setString(LocalStorageHelper.SELECTED_THEME, this.form.selectedTheme().value());
    this.themeService.setTheme(this.form.selectedTheme().value());
  }
}


interface FormModel 
{
  clickToMove: boolean;
  selectedEngine: EngineName;
  engineDepth: number;
  cloudHybridMode: boolean;
  selectedTheme: Themes;
}