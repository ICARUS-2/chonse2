import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import ThemeService from '../../themes/theme-service';

@Component({
  selector: 'app-eval-bar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eval-bar.html',
  styleUrl: './eval-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EvalBar {

  data = input<{ whiteBarPercentage: number; label: string }>({
    whiteBarPercentage: 51,
    label: '0.4'
  });

  constructor(public themeService: ThemeService) {}
}