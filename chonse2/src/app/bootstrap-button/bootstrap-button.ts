import { Component, EventEmitter, Input, Output } from '@angular/core';
import ThemeService from '../themes/theme-service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-bootstrap-button',
  imports: [NgClass],
  templateUrl: './bootstrap-button.html',
  styleUrl: './bootstrap-button.css',
})
export class BootstrapButton {

  @Input() label = "BUTTON_LABEL";
  @Input() disabled: boolean = false;
  @Input() extraClasses: string = "";

  @Output() buttonClick: EventEmitter<PointerEvent> = new EventEmitter();
  constructor(public themeService: ThemeService)
  {
    
  }


  onButtonClicked()
  {
    this.buttonClick.emit();
  }

}
