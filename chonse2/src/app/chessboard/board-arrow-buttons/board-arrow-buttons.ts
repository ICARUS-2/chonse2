import { Component, input, output } from '@angular/core';
import { BootstrapButton } from '../../ui/bootstrap-button/bootstrap-button';
import ThemeService from '../../themes/theme-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board-arrow-buttons',
  imports: [BootstrapButton, CommonModule],
  templateUrl: './board-arrow-buttons.html',
  styleUrl: './board-arrow-buttons.css',
})
export class BoardArrowButtons {

  constructor(public themeService: ThemeService)
  {

  }

  areBackButtonsEnabled = input<boolean>(false);
  areForwardButtonsEnabled = input<boolean>(false);

  flipClicked = output<void>();
  backClicked = output<void>();
  doubleBackClicked = output<void>();
  forwardClicked = output<void>();
  doubleForwardClicked = output<void>();
}
