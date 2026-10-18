import { Component, inject } from '@angular/core';
import ThemeService from '../themes/theme-service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-development',
  imports: [TranslatePipe],
  templateUrl: './development.html',
  styleUrl: './development.css',
})
export class Development 
{
  public themeService = inject(ThemeService);

  constructor()
  {

  }
}
