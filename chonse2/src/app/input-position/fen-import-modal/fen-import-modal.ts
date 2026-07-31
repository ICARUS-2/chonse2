import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import ThemeService from '../../themes/theme-service';
import { BootstrapButton } from '../../ui/bootstrap-button/bootstrap-button';
import { form, FormField } from '@angular/forms/signals';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal';
import { TranslatePipe } from '@ngx-translate/core';
import ChessGameFactory from '../../../libs/chess-game-lib/chess-game-factory';

@Component({
  selector: 'app-fen-import-modal',
  imports: [BootstrapButton, FormField, TranslatePipe],
  templateUrl: './fen-import-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './fen-import-modal.css',
})
export class FenImportModal 
{
  formModel = signal<FormModel>( 
  {
    fen: "",
  })

  form = form(this.formModel);

  constructor(public themeService: ThemeService, private activeModal: NgbActiveModal)
  {

  }

  submitClicked()
  {
    try 
    {
      this.activeModal.close(ChessGameFactory.createFromFen(this.form.fen().value()));
    }
    catch(ex)
    {
      console.log(ex);
      this.activeModal.close(null);
    }
  }
}

interface FormModel 
{
  fen: string
}
