import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import VsAiConfig from '../vs-ai-config';
import { FormsModule } from '@angular/forms';
import ThemeService from '../../themes/theme-service';
import { BootstrapButton } from "../../ui/bootstrap-button/bootstrap-button";
import { form, FormField, max, min } from '@angular/forms/signals';
import { AngularUCIEngine } from '../../../libs/engine-lib/angularUciEngine';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-vs-ai-configuration-modal',
  imports: [FormsModule, BootstrapButton, FormField, TranslatePipe],
  templateUrl: './vs-ai-configuration-modal.html',
  styleUrl: './vs-ai-configuration-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class VsAiConfigurationModal {
  private activeModal = inject(NgbActiveModal);
  public themeService = inject(ThemeService);

  UciEngine = AngularUCIEngine;

  formModel = signal<FormModel>( 
  {
    elo: AngularUCIEngine.MIN_ELO,
    isHumanPlayerWhite: true
  })

  form = form(this.formModel, ( schema ) => 
  {
    min(schema.elo, AngularUCIEngine.MIN_ELO);
    max(schema.elo, AngularUCIEngine.MAX_ELO);
  });
  
  constructor()
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