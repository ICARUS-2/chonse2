import { Component, signal, ChangeDetectionStrategy } from '@angular/core';
import ThemeService from '../../themes/theme-service';
import { BootstrapButton } from '../../ui/bootstrap-button/bootstrap-button';
import Chonse2 from '../../../libs/chonse2-lib/chonse2';
import { form, FormField } from '@angular/forms/signals';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap/modal';

@Component({
  selector: 'app-fen-import-modal',
  imports: [BootstrapButton, FormField],
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
      this.activeModal.close(Chonse2.instantiateFromFen(this.form.fen().value()));
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
