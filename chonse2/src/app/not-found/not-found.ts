import { Component } from '@angular/core';
import ThemeService from '../themes/theme-service';
import { Router } from '@angular/router';
import { IconButton } from "../ui/icon-button/icon-button";
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-not-found',
  imports: [IconButton, TranslatePipe],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound {

  constructor(public themeService: ThemeService, private router: Router)
  {

  }

  returnHomeClicked()
  {
    this.router.navigate(["/"]);
  }
}
