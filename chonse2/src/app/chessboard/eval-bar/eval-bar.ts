import { Component, Input } from '@angular/core';
import { CommonModule} from "@angular/common";
import ThemeService from '../../themes/theme-service';

@Component({
  selector: 'app-eval-bar',
  imports: [CommonModule],
  templateUrl: './eval-bar.html',
  styleUrl: './eval-bar.css',
})
export class EvalBar {
  @Input() data: {whiteBarPercentage: number, label: string} = {whiteBarPercentage: 51, label: "0.4"}

  constructor(public themeService: ThemeService)
  {
    
  }
}
