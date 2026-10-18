import { Component, OnInit, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./navbar/navbar";
import ThemeService from './themes/theme-service';
import { GlassPanelTheme } from './themes/app-themes/i-app-theme';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { Languages } from '../globals/globals';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, CommonModule],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './app.css'
})
export class App implements OnInit{
  public themeService = inject(ThemeService);
  private translate = inject(TranslateService);

  protected readonly title = signal('CHONSE2');
  GlassPanelTheme = GlassPanelTheme;

  constructor()
  {
    
  }

  ngOnInit()
  {
    this.translate.addLangs(Object.values(Languages));
  }
}
