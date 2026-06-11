import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import BoardState from '../chessboard/board-state';
import { form, FormField } from '@angular/forms/signals';
import ThemeService from '../../themes/theme-service';
import { BootstrapButton } from '../../ui/bootstrap-button/bootstrap-button';
import { DatabaseService } from '../../database/database-service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-database-modal',
  imports: [FormField, BootstrapButton],
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

  constructor(public themeService: ThemeService, private databaseService: DatabaseService, private toastrService: ToastrService)
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
        this.toastrService.success("Successfully saved game.")
      }
      else 
      {
        this.toastrService.warning("Game not found.");
      }
    }
    catch(ex)
    {
      this.toastrService.error("Game save failed: " + ex)
    }
  }
}


interface FormModel
{
  comment: string;
}