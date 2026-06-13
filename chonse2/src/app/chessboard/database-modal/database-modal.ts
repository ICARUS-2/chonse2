import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import BoardState from '../chessboard/board-state';
import { form, FormField } from '@angular/forms/signals';
import ThemeService from '../../themes/theme-service';
import { BootstrapButton } from '../../ui/bootstrap-button/bootstrap-button';
import { DatabaseService } from '../../database/database-service';
import { ToastrService } from 'ngx-toastr';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-database-modal',
  imports: [FormField, BootstrapButton, TranslatePipe],
  templateUrl: './database-modal.html',
  styleUrl: './database-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatabaseModal {
  game: WritableSignal<BoardState | undefined> = signal(undefined);

  formModel = signal<FormModel>(
    {
      comment: ""
    }
  )

  form = form(this.formModel);

  private translate = inject(TranslateService);

  constructor(
    public themeService: ThemeService, 
    private databaseService: DatabaseService, 
    private toastrService: ToastrService,
    private activeModal: NgbActiveModal)
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
        this.toastrService.success(this.translate.instant('chessboard.databaseModal.toastr.success'))
      }
      else 
      {
        this.toastrService.warning(this.translate.instant('chessboard.databaseModal.toastr.gameNotFound'));
      }
    }
    catch(ex)
    {
      this.toastrService.error(this.translate.instant('chessboard.databaseModal.toastr.saveFailed') + " " + ex)
    }

    this.activeModal.close();
  }
}


interface FormModel
{
  comment: string;
}