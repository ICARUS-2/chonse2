import { Component, signal, WritableSignal } from '@angular/core';
import ThemeService from '../themes/theme-service';
import { CommonModule } from '@angular/common';
import { DatabaseItem, DatabaseService } from './database-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-database',
  imports: [CommonModule],
  templateUrl: './database.html',
  styleUrl: './database.css',
})
export class Database {

  dbItems: WritableSignal<Array<DatabaseItem>> = signal([]);

  constructor(public themeService: ThemeService, private databaseService: DatabaseService, toastrService: ToastrService)
  {
    try 
    {
      this.dbItems.set( databaseService.getGamesFromDatabase());
      toastrService.success(`Successfully loaded ${this.dbItems.length} records.`)
    }
    catch(ex)
    {
      toastrService.error("Error retrieving database: " + ex)
    }
  }
}
