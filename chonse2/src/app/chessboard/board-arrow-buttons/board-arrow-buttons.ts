import { Component, input, output } from '@angular/core';
import { BootstrapButton } from '../../ui/bootstrap-button/bootstrap-button';

@Component({
  selector: 'app-board-arrow-buttons',
  imports: [BootstrapButton],
  templateUrl: './board-arrow-buttons.html',
  styleUrl: './board-arrow-buttons.css',
})
export class BoardArrowButtons {
  areBackButtonsEnabled = input<boolean>(false);
  areForwardButtonsEnabled = input<boolean>(false);

  flipClicked = output<void>();
  backClicked = output<void>();
  doubleBackClicked = output<void>();
  forwardClicked = output<void>();
  doubleForwardClicked = output<void>();
}
