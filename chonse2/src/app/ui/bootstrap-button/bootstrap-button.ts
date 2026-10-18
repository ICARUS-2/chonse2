import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import ThemeService from '../../themes/theme-service';

@Component({
  selector: 'app-bootstrap-button',
  standalone: true,
  imports: [NgClass],
  templateUrl: './bootstrap-button.html',
  styleUrl: './bootstrap-button.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BootstrapButton {
  themeService = inject(ThemeService);

  label = input<string>('BUTTON_LABEL');
  disabled = input<boolean>(false);
  extraClasses = input<string>('');

  buttonClick = output<PointerEvent>();

  constructor() {}

  onButtonClicked(event: PointerEvent) {
    this.buttonClick.emit(event);
  }
}