import { Component, HostListener, input, output, ChangeDetectionStrategy } from '@angular/core';
import { BootstrapButton } from '../../ui/bootstrap-button/bootstrap-button';
import ThemeService from '../../themes/theme-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board-arrow-buttons',
  imports: [BootstrapButton, CommonModule],
  templateUrl: './board-arrow-buttons.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
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

  //listens for the key press to cycle through the moves.
  @HostListener('window:keydown', ['$event']) handleArrowOrXPressed(event: KeyboardEvent)
  {
    switch (event.key) 
    {

      //the up arrow key will advance to the last move.
      case 'ArrowUp':
        event.preventDefault();

        if (this.areForwardButtonsEnabled()) 
        {
          this.doubleForwardClicked.emit();
        }

        break;

      //right arrow key will advance one move.
      case 'ArrowRight':
        event.preventDefault();

        if (this.areForwardButtonsEnabled()) 
        {
          this.forwardClicked.emit();
        }

        break;

      //left arrow key will go back one move.
      case 'ArrowLeft':
        event.preventDefault();

        if (this.areBackButtonsEnabled()) 
        {
          this.backClicked.emit();
        }

        break;

      //down arrow will go back to the first move.
      case 'ArrowDown':
        event.preventDefault();

        if (this.areBackButtonsEnabled()) 
        {
          this.doubleBackClicked.emit();
        }

        break;

      //x button will flip the board.
      case 'x':
      case 'X':
        event.preventDefault();
        this.flipClicked.emit();
        break;
    }
  }
}
