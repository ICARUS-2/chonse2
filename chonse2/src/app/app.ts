import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
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
  protected readonly title = signal('CHONSE2');
  GlassPanelTheme = GlassPanelTheme;

  constructor(public themeService: ThemeService, private translate: TranslateService)
  {
    
  }

  ngOnInit()
  {
    this.translate.addLangs(Object.values(Languages));
  }
}
