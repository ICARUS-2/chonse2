import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import ThemeService from '../themes/theme-service';
import { CommonModule } from '@angular/common';
import { DatabaseItem, DatabaseService } from './database-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-database',
  imports: [CommonModule],
  templateUrl: './database.html',
  styleUrl: './database.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Database {

  dbItems: WritableSignal<Array<DatabaseItem>> = signal([]);

  constructor(public themeService: ThemeService, private databaseService: DatabaseService, toastrService: ToastrService)
  {
    try 
    {
      const itemsFromLocal = databaseService.getGamesFromDatabase();
      console.log(itemsFromLocal);
      this.dbItems.set(itemsFromLocal);
      toastrService.success(`Successfully loaded ${this.dbItems().length} records.`)
    }
    catch(ex)
    {
      toastrService.error("Error retrieving database: " + ex)
    }
  }
}
