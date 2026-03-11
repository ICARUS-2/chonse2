import { ChangeDetectionStrategy, Component, computed, EventEmitter, input, Input, Output } from '@angular/core';
import { PieceType } from '../../../lib/piece-type';
import { MoveClassification } from '../engine/types/enums';
import ThemeService from '../../themes/theme-service';

@Component({
  selector: 'app-square',
  standalone: true,
  imports: [],
  templateUrl: './square.html',
  styleUrl: './square.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Square {

  MoveClassification = MoveClassification;

  // SIGNAL INPUTS
  coordinate = input<string>("");
  piece = input<string>(PieceType.NONE);
  isDark = input<boolean>(false);
  showRank = input<boolean>(false);
  showFile = input<boolean>(true);
  isLegalMove = input<boolean>(false);
  showPiece = input<boolean>(true);
  isFlipped = input<boolean>(false);
  isInCheck = input<boolean>(false);
  isCheckmate = input<boolean>(false);
  isDraw = input<boolean>(false);
  isWinner = input<boolean>(false);
  isClicked = input<boolean>(false);
  moveClassification = input<MoveClassification>(MoveClassification.None);

  // OUTPUTS
  @Output() mouseDown = new EventEmitter<{coordinate: string, piece: string, mouse: PointerEvent}>();
  @Output() mouseUp = new EventEmitter<{coordinate: string, mouse: PointerEvent}>();
  @Output() leftClick = new EventEmitter<{coordinate: string, mouse: PointerEvent}>();
  @Output() rightClick = new EventEmitter<{coordinate: string}>();

  lightColor: string = "white";
  darkColor: string = "rgb(85,150,242)";
  lightPressedColor: string = "pink";
  darkPressedColor: string = "hotpink";

  static readonly lightMoveClassificationColors = new Map<string,string>([
    [MoveClassification.Opening, "LightGray"],
    [MoveClassification.Forced, "LightGray"],
    [MoveClassification.Splendid, "Aquamarine"],
    [MoveClassification.Perfect, "Purple"],
    [MoveClassification.Best, "Lime"],
    [MoveClassification.Excellent, "Lime"],
    [MoveClassification.Okay, "YellowGreen"],
    [MoveClassification.Inaccuracy, "Yellow"],
    [MoveClassification.Mistake, "Orange"],
    [MoveClassification.Blunder, "Red"],
    [MoveClassification.None, "None"]
  ]);

  static readonly darkMoveClassificationColors = new Map<string,string>([
    [MoveClassification.Opening, "Gray"],
    [MoveClassification.Forced, "Gray"],
    [MoveClassification.Splendid, "MediumTurquoise"],
    [MoveClassification.Perfect, "Indigo"],
    [MoveClassification.Best, "LimeGreen"],
    [MoveClassification.Excellent, "LimeGreen"],
    [MoveClassification.Okay, "OliveDrab"],
    [MoveClassification.Inaccuracy, "Gold"],
    [MoveClassification.Mistake, "DarkOrange"],
    [MoveClassification.Blunder, "DarkRed"],
    [MoveClassification.None, "None"]
  ]);

  constructor(public themeService: ThemeService) {
    this.lightColor = themeService.getThemeInstance().getChessboardLightColor();
    this.darkColor = themeService.getThemeInstance().getChessboardDarkColor();
  }

  getColor = computed(() => 
  {

    if (this.isClicked()) 
    {
      return this.isDark() ? this.darkPressedColor : this.lightPressedColor;
    }

    if (this.moveClassification() === MoveClassification.None) 
    {
      return this.isDark() ? this.darkColor : this.lightColor;
    }

    return this.isDark()
      ? Square.darkMoveClassificationColors.get(this.moveClassification()) ?? MoveClassification.None
      : Square.lightMoveClassificationColors.get(this.moveClassification()) ?? MoveClassification.None;
  });

  getReverseColor = computed(() =>
    this.isDark() ? this.lightColor : this.darkColor
  );

  handleMouseDown(event: PointerEvent) 
  {
    this.mouseDown.emit({
      coordinate: this.coordinate(),
      piece: this.piece(),
      mouse: event
    });
  }

  handleMouseUp(event: PointerEvent) 
  {
    this.mouseUp.emit({
      coordinate: this.coordinate(),
      mouse: event
    });
  }

  handleRightClick(event: PointerEvent) 
  {
    event.preventDefault();
  }

  handleLeftClick(event: PointerEvent) 
  {
    if (event.button !== 0) 
    {
      return;
    }

    this.leftClick.emit({
      coordinate: this.coordinate(),
      mouse: event
    });
  }
}