import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import LocalStorageHelper from '../../libs/local-storage-helper';
import { Themes } from '../themes/themes';
import ThemeService from '../themes/theme-service';
import { CommonModule } from '@angular/common';
import { disabled, form, FormField, max, min } from '@angular/forms/signals';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { EngineName, EngineInformation } from '../../libs/engine-lib/types/enums';
import { UciEngine } from '../../libs/engine-lib/uciEngine';
import { DEFAULT_LANG, Languages } from '../../globals/globals';
import { TranslateService } from '@ngx-translate/core';

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
  EngineInformation = EngineInformation;
  Object = Object;
  Themes = Themes;
  Languages = Languages;

  formModel = signal<FormModel>(
  {
    clickToMove:  LocalStorageHelper.getBoolean(LocalStorageHelper.CLICK_TO_MOVE, false),
    animatedPieces: LocalStorageHelper.getBoolean(LocalStorageHelper.PIECE_ANIMATIONS, true),
    selectedEngine: LocalStorageHelper.getString(LocalStorageHelper.SELECTED_ENGINE, EngineName.Stockfish18Lite) as EngineName,
    engineDepth:  LocalStorageHelper.getNumber(LocalStorageHelper.ENGINE_DEPTH, UciEngine.DEFAULT_DEPTH),
    cloudHybridMode: LocalStorageHelper.getBoolean(LocalStorageHelper.CLOUD_HYBRID_MODE, false),
    engineThreadCount: LocalStorageHelper.getNumber(LocalStorageHelper.ENGINE_THREAD_COUNT, 1),
    selectedTheme: LocalStorageHelper.getString(LocalStorageHelper.SELECTED_THEME, ThemeService.DEFAULT_THEME) as Themes,
    language: LocalStorageHelper.getString(LocalStorageHelper.LANGUAGE, DEFAULT_LANG) as Languages
  })

  form = form(this.formModel, (schema) => 
  {
    //Engine depth
    min(schema.engineDepth, UciEngine.MIN_DEPTH),
    max(schema.engineDepth, 30),

    //Engine thread count
    min(schema.engineThreadCount, 1),
    max(schema.engineThreadCount, 12)
  })

  private translate = inject(TranslateService);

  constructor(public themeService: ThemeService)
  {

  }

  //Click to move.
  handleClickToMoveSwitchPressed(val: boolean)
  {
    LocalStorageHelper.setBoolean(LocalStorageHelper.CLICK_TO_MOVE, val);
  }
  
  handlePieceAnimationSwitchPressed(val: boolean)
  {
    LocalStorageHelper.setBoolean(LocalStorageHelper.PIECE_ANIMATIONS, val);
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
    //If they enabled cloud hybrid, set thread count to 1.
    if (val)
    {
      this.form.engineThreadCount().value.set(1);
      LocalStorageHelper.setNumber(LocalStorageHelper.ENGINE_THREAD_COUNT, 1);
    }

    LocalStorageHelper.setBoolean(LocalStorageHelper.CLOUD_HYBRID_MODE, this.form.cloudHybridMode().value());   
  }

  //Workers number
  handleThreadCountChanged()
  {
    //If they changed the thread count to higher than 1, disable cloud hybrid.
    if (this.form.engineThreadCount().value() > 1)
    {
      this.form.cloudHybridMode().value.set(false);
      LocalStorageHelper.setBoolean(LocalStorageHelper.CLOUD_HYBRID_MODE, false);   
    }

    LocalStorageHelper.setNumber(LocalStorageHelper.ENGINE_THREAD_COUNT, this.form.engineThreadCount().value());
  }

  //Theme select
  handleThemeDropdownSelectionChanged()
  {
    LocalStorageHelper.setString(LocalStorageHelper.SELECTED_THEME, this.form.selectedTheme().value());
    this.themeService.setTheme(this.form.selectedTheme().value());
  }

  //Language select
  handleLanguageDropdownChanged()
  {
    this.translate.use(this.form.language().value());
    LocalStorageHelper.setString(LocalStorageHelper.LANGUAGE, this.form.language().value());
  }
}


interface FormModel 
{
  clickToMove: boolean;
  animatedPieces: boolean;
  selectedEngine: EngineName;
  engineDepth: number;
  cloudHybridMode: boolean;
  engineThreadCount: number;
  selectedTheme: Themes;
  language: Languages;
}