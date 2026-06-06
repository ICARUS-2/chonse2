import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import ThemeService from '../../themes/theme-service';

@Component({
  selector: 'app-icon-button',
  imports: [],
  templateUrl: './icon-button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './icon-button.css',
})
export class IconButton {
  
  constructor(public themeService: ThemeService)
  {
  }

  label = input<string>('BUTTON_LABEL');
  disabled = input<boolean>(false);
  iconClass = input<string>('bi-download'); // Default Bootstrap icon
  overridePrimaryBackgroundColor = input<string>("");
  overrideSecondaryBackgroundColor = input<string>("");

  extraClasses = input<string>('');
  extraStyle = input<Record<string, string | number>>({});

  buttonClick = output<PointerEvent>();

  handleOnClick(event: MouseEvent) 
  {
    if (!this.disabled()) 
    {
      this.buttonClick.emit(event as PointerEvent);
    }
  }
}
