import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import ThemeService from '../themes/theme-service';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {

  constructor(public themeService: ThemeService)
  {

  }

}
