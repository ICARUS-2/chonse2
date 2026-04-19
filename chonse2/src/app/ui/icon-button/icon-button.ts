import { Component, input, output } from '@angular/core';
import ThemeService from '../../themes/theme-service';

@Component({
  selector: 'app-icon-button',
  imports: [],
  templateUrl: './icon-button.html',
  styleUrl: './icon-button.css',
})
export class IconButton {
  
  constructor(public themeService: ThemeService)
  {
  }

  label = input<string>('BUTTON_LABEL');
  disabled = input<boolean>(false);
  extraClasses = input<string>('');
  iconClass = input<string>('bi-download'); // Default Bootstrap icon

  buttonClick = output<PointerEvent>();

  handleOnClick(event: MouseEvent) 
  {
    if (!this.disabled()) 
    {
      this.buttonClick.emit(event as PointerEvent);
    }
  }
}
