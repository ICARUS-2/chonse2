import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import ThemeService from '../themes/theme-service';
import { CommonModule } from '@angular/common';
import { DatabaseItem, DatabaseService } from './database-service';
import { ToastrService } from 'ngx-toastr';
import { IconButton } from "../ui/icon-button/icon-button";
import { Router } from '@angular/router';

@Component({
  selector: 'app-database',
  imports: [CommonModule, IconButton],
  templateUrl: './database.html',
  styleUrl: './database.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Database {

  dbItems: WritableSignal<Array<DatabaseItem>> = signal([]);

  constructor(
    public themeService: ThemeService, 
    private databaseService: DatabaseService, 
    private toastrService: ToastrService,
    private router: Router)
  {
    try 
    {
      this.loadDb();
      toastrService.success(`Successfully loaded ${this.dbItems().length} records.`)
    }
    catch(ex)
    {
      toastrService.error("Error retrieving database: " + ex)
    }
  }

  loadDb()
  {
    const itemsFromLocal = this.databaseService.getGamesFromDatabase();

    this.dbItems.set(itemsFromLocal);
  }

  handleAnalyzeClicked(pgn: string)
  {
    this.router.navigate([`/pgn/${pgn}`])
  }

  handleDeleteClicked(id: number)
  {
    const deleteSuccessful = this.databaseService.deleteFromDatabase(id);

    if (deleteSuccessful)
    {
      this.toastrService.success("Successfully deleted game");
      this.loadDb();
    }
  }
}
