import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import ThemeService from '../themes/theme-service';
import { CommonModule } from '@angular/common';
import { DatabaseItem, DatabaseService } from './database-service';
import { IconButton } from "../ui/icon-button/icon-button";
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EngineService } from '../../libs/engine-lib/engineService';
import { NotificationService } from '../ui/notifications/notification-service';

@Component({
  selector: 'app-database',
  imports: [CommonModule, IconButton, TranslatePipe],
  templateUrl: './database.html',
  styleUrl: './database.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Database {
  public themeService = inject(ThemeService);
  private databaseService = inject(DatabaseService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  public engineService = inject(EngineService);

  dbItems: WritableSignal<Array<DatabaseItem>> = signal([]);


  constructor()
  {
    const notificationService = this.notificationService;

    try 
    {
      this.loadDb();
    }
    catch(ex)
    {
      notificationService.notify("error", this.translate.instant("database.messages.loadError") + ex)
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
      this.notificationService.notify("success", this.translate.instant("database.messages.deleteSuccess"));
      this.loadDb();
    }
  }
}
