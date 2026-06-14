import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import ThemeService from '../themes/theme-service';
import { CommonModule } from '@angular/common';
import { DatabaseItem, DatabaseService } from './database-service';
import { ToastrService } from 'ngx-toastr';
import { IconButton } from "../ui/icon-button/icon-button";
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-database',
  imports: [CommonModule, IconButton, TranslatePipe],
  templateUrl: './database.html',
  styleUrl: './database.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Database {

  dbItems: WritableSignal<Array<DatabaseItem>> = signal([]);

  private translate = inject(TranslateService)

  constructor(
    public themeService: ThemeService, 
    private databaseService: DatabaseService, 
    private toastrService: ToastrService,
    private router: Router)
  {
    try 
    {
      this.loadDb();
    }
    catch(ex)
    {
      toastrService.error(this.translate.instant("database.messages.loadError") + ex)
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
      this.toastrService.success(this.translate.instant("database.messages.deleteSuccess"));
      this.loadDb();
    }
  }
}
