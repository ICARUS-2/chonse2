import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import LocalStorageHelper from '../../libs/local-storage-helper';
import { Themes } from '../themes/themes';
import ThemeService from '../themes/theme-service';
import { CommonModule } from '@angular/common';
import { disabled, form, FormField, max, min } from '@angular/forms/signals';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { EngineName, EngineInformation } from '../../libs/engine-lib/types/enums';
import { AngularUCIEngine } from '../../libs/engine-lib/angularUciEngine';
import { DEFAULT_LANG, Languages } from '../../globals/globals';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import ChessboardHelper from '../chessboard/helpers';
import { isWasmSupported } from '../../libs/engine-lib/helpers/shared';
import { EngineService } from '../../libs/engine-lib/engineService';
import { NotificationService } from '../ui/notifications/notification-service';
import DefaultSettings from './default-settings';

@Component({
  selector: 'app-settings',
  imports: [FormsModule, FormsModule, CommonModule, FormField, NgbTooltip, TranslatePipe],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Settings implements OnInit{
  public themeService = inject(ThemeService);
  private translate = inject(TranslateService);
  public engineService = inject(EngineService);
  private notificationService = inject(NotificationService);


  LocalStorageHelper = LocalStorageHelper;
  ChessboardHelper = ChessboardHelper;
  EngineName = EngineName;
  EngineInformation = EngineInformation;
  Object = Object;
  Themes = Themes;
  Languages = Languages;

  formModel = signal<FormModel>(
  {
      //Board
      clickToMove: LocalStorageHelper.getBoolean(
          LocalStorageHelper.CLICK_TO_MOVE,
          DefaultSettings.CLICK_TO_MOVE
      ),
      animatedPieces: LocalStorageHelper.getBoolean(
          LocalStorageHelper.PIECE_ANIMATIONS,
          DefaultSettings.PIECE_ANIMATIONS
      ),
      chessPieces: LocalStorageHelper.getString(
          LocalStorageHelper.CHESS_PIECES,
          DefaultSettings.CHESS_PIECES
      ),
      verboseNotation: LocalStorageHelper.getBoolean(
          LocalStorageHelper.VERBOSE_NOTATION,
          DefaultSettings.VERBOSE_NOTATION
      ),

      //Engine
      selectedEngine: LocalStorageHelper.getString(
          LocalStorageHelper.SELECTED_ENGINE,
          DefaultSettings.SELECTED_ENGINE
      ) as EngineName,
      engineDepth: LocalStorageHelper.getNumber(
          LocalStorageHelper.ENGINE_DEPTH,
          DefaultSettings.ENGINE_DEPTH
      ),
      manualEngineDepth: LocalStorageHelper.getNumber(
          LocalStorageHelper.MANUAL_ENGINE_DEPTH,
          DefaultSettings.MANUAL_ENGINE_DEPTH
      ),
      cloudHybridMode: LocalStorageHelper.getBoolean(
          LocalStorageHelper.CLOUD_HYBRID_MODE,
          DefaultSettings.CLOUD_HYBRID_MODE
      ),
      engineThreadCount: LocalStorageHelper.getNumber(
          LocalStorageHelper.ENGINE_THREAD_COUNT,
          DefaultSettings.ENGINE_THREAD_COUNT
      ),

      //Appearance
      selectedTheme: LocalStorageHelper.getString(
          LocalStorageHelper.SELECTED_THEME,
          DefaultSettings.SELECTED_THEME
      ) as Themes,
      language: LocalStorageHelper.getString(
          LocalStorageHelper.LANGUAGE,
          DefaultSettings.LANGUAGE
      ) as Languages,

      //Coach
      insightsAudio: LocalStorageHelper.getBoolean(
          LocalStorageHelper.INSIGHTS_AUDIO,
          DefaultSettings.INSIGHTS_AUDIO
      ),
      showAltLineArrow: LocalStorageHelper.getBoolean(
          LocalStorageHelper.SHOW_ALT_LINE_ARROW,
          DefaultSettings.SHOW_ALT_LINE_ARROW
      )
  });

  form = form(this.formModel, (schema) => 
  {
    //Engine type
    disabled(schema.selectedEngine, {when: () => { return this.engineDropdownDisabled() }})

    //Engine depth
    min(schema.engineDepth, AngularUCIEngine.MIN_DEPTH),
    max(schema.engineDepth, AngularUCIEngine.MAX_DEPTH),

    //Engine depth (manual)
    min(schema.manualEngineDepth, AngularUCIEngine.MIN_DEPTH),
    max(schema.manualEngineDepth, AngularUCIEngine.MAX_DEPTH),

    //Engine thread count
    min(schema.engineThreadCount, 1),
    max(schema.engineThreadCount, 12)
  })

  constructor()
  {

  }

  ngOnInit()
  {
    if (this.form.selectedEngine().value() != EngineName.Stockfish11 && !isWasmSupported())
    {
      this.form.selectedEngine().value.set(EngineName.Stockfish11);
      this.handleEngineDropdownSelectionChanged();
      this.notificationService.notify('warning', this.translate.instant("settings.engine.legacyFallbackWarning"));
    }
  }

  //Coach sound
  coachSoundSwitchPressed(val: boolean)
  {
    LocalStorageHelper.setBoolean(LocalStorageHelper.INSIGHTS_AUDIO, val);
  }

  //Alt line arrow
  showAltLineArrowSwitchPressed(val: boolean)
  {
    LocalStorageHelper.setBoolean(LocalStorageHelper.SHOW_ALT_LINE_ARROW, val);
  }

  //Click to move.
  handleClickToMoveSwitchPressed(val: boolean)
  {
    LocalStorageHelper.setBoolean(LocalStorageHelper.CLICK_TO_MOVE, val);
  }
  
  //Animation
  handlePieceAnimationSwitchPressed(val: boolean)
  {
    LocalStorageHelper.setBoolean(LocalStorageHelper.PIECE_ANIMATIONS, val);
  }

  //Piece
  handlePieceDropdownSelectionChanged()
  {
    LocalStorageHelper.setString(LocalStorageHelper.CHESS_PIECES, this.form.chessPieces().value());
  }

  //Verbose mode
  handleVerboseNotationChanged(val: boolean)
  {
    LocalStorageHelper.setBoolean(LocalStorageHelper.VERBOSE_NOTATION, val);
  }

  //Pick engine setting
  handleEngineDropdownSelectionChanged()
  {
    const currentSetting = LocalStorageHelper.getString(LocalStorageHelper.SELECTED_ENGINE, DefaultSettings.SELECTED_ENGINE);
    const dropdownSetting = this.form.selectedEngine().value();

    //If they changed engine, shut down the current one.
    if (currentSetting != dropdownSetting)
    {
      this.engineService.terminateEngine();
    }

    LocalStorageHelper.setString(LocalStorageHelper.SELECTED_ENGINE, dropdownSetting);
  }

  //Pick engine dropdown enabled
  engineDropdownDisabled = computed( () => 
  {
    //For now, this should only be disabled if there is a game being evaluated.
    return this.engineService.isEvaluatingGame();
  } )

  //Engine depth.
  handleEngineDepthChanged()
  {
    LocalStorageHelper.setNumber(LocalStorageHelper.ENGINE_DEPTH, this.form.engineDepth().value());
  }

  //Manual engine depth
  handleManualEngineDepthChanged()
  {
    LocalStorageHelper.setNumber(LocalStorageHelper.MANUAL_ENGINE_DEPTH, this.form.manualEngineDepth().value());
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
  //board
  clickToMove: boolean;
  animatedPieces: boolean;
  chessPieces: string;
  verboseNotation: boolean;

  //engine
  selectedEngine: EngineName;
  engineDepth: number;
  manualEngineDepth: number;
  cloudHybridMode: boolean;
  engineThreadCount: number;

  //appearance
  selectedTheme: Themes;
  language: Languages;

  //insights
  insightsAudio: boolean;
  showAltLineArrow: boolean;
}