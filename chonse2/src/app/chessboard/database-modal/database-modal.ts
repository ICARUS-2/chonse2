import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import BoardState from '../chessboard/board-state';
import { form, FormField } from '@angular/forms/signals';
import ThemeService from '../../themes/theme-service';
import { BootstrapButton } from '../../ui/bootstrap-button/bootstrap-button';
import { DatabaseService } from '../../database/database-service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../../ui/notifications/notification-service';

@Component({
  selector: 'app-database-modal',
  imports: [FormField, BootstrapButton, TranslatePipe],
  templateUrl: './database-modal.html',
  styleUrl: './database-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatabaseModal {
  public themeService = inject(ThemeService);
  private databaseService = inject(DatabaseService);
  private notificationService = inject(NotificationService);
  private activeModal = inject(NgbActiveModal);
  private translate = inject(TranslateService);

  game: WritableSignal<BoardState | undefined> = signal(undefined);

  formModel = signal<FormModel>(
    {
      comment: ""
    }
  )

  form = form(this.formModel);

  constructor()
  {

  }

  submitClicked()
  {
    try 
    {
      const g = this.game();
      if (g != undefined)
      {
        this.databaseService.saveToDatabase(g, this.form.comment().value());
        this.notificationService.notify("success", this.translate.instant('chessboard.databaseModal.toastr.success'))
      }
      else 
      {
        this.notificationService.notify("warning", this.translate.instant('chessboard.databaseModal.toastr.gameNotFound'));
      }
    }
    catch(ex)
    {
      this.notificationService.notify("error", this.translate.instant('chessboard.databaseModal.toastr.saveFailed') + " " + ex)
    }

    this.activeModal.close();
  }
}


interface FormModel
{
  comment: string;
}