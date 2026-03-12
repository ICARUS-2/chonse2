import { Component, input, signal } from '@angular/core';
import ThemeService from '../../themes/theme-service';

@Component({
  selector: 'tr[app-divergence-table-entry]',
  imports: [],
  templateUrl: './divergence-table-entry.html',
  styleUrl: './divergence-table-entry.css',
})
export class DivergenceTableEntry {

  stack = input<Array<IMoveResult>>([]);
  
  constructor(public themeService: ThemeService)
  {

  }
}
