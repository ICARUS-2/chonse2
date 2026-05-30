import { Component, signal } from '@angular/core';
import ThemeService from '../../themes/theme-service';
import { BootstrapButton } from '../../ui/bootstrap-button/bootstrap-button';
import Chonse2 from '../../../libs/chonse2-lib/chonse2';
import { form, FormField } from '@angular/forms/signals';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal';

@Component({
  selector: 'app-fen-import-modal',
  imports: [BootstrapButton, FormField],
  templateUrl: './fen-import-modal.html',
  styleUrl: './fen-import-modal.css',
})
export class FenImportModal 
{
  static readonly DEFAULT_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"

  formModel = signal<FormModel>( 
  {
    fen: FenImportModal.DEFAULT_FEN,
  })

  form = form(this.formModel);

  constructor(public themeService: ThemeService, private activeModal: NgbActiveModal)
  {

  }

  submitClicked()
  {
    this.activeModal.close(Chonse2.instantiateFromFen(this.form.fen().value()));
  }
}

interface FormModel 
{
  fen: string
}
