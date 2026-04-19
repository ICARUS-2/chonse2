import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import VsAiConfig from '../vs-ai-config';
import { FormsModule } from '@angular/forms';
import ThemeService from '../../themes/theme-service';
import { BootstrapButton } from "../../ui/bootstrap-button/bootstrap-button";
import { form, FormField, max, min } from '@angular/forms/signals';
import { UciEngine } from '../../../libs/engine-lib/uciEngine';

@Component({
  selector: 'app-vs-ai-configuration-modal',
  imports: [FormsModule, BootstrapButton, FormField],
  templateUrl: './vs-ai-configuration-modal.html',
  styleUrl: './vs-ai-configuration-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class VsAiConfigurationModal {
  UciEngine = UciEngine;

  formModel = signal<FormModel>( 
  {
    elo: UciEngine.MIN_ELO,
    isHumanPlayerWhite: true
  })

  form = form(this.formModel, ( schema ) => 
  {
    min(schema.elo, UciEngine.MIN_ELO);
    max(schema.elo, UciEngine.MAX_ELO);
  });

  constructor(private activeModal: NgbActiveModal, public themeService: ThemeService)
  {

  }

  submitClicked()
  {
    this.activeModal.close(new VsAiConfig(this.form.elo().value(), this.form.isHumanPlayerWhite().value()));
  }
}


interface FormModel 
{
  elo: number,
  isHumanPlayerWhite: boolean
}