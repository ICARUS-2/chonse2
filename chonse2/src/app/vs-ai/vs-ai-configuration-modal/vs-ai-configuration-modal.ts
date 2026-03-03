import { Component } from '@angular/core';
import { UciEngine } from '../../chessboard/engine/uciEngine';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import VsAiConfig from '../vs-ai-config';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import ThemeService from '../../themes/theme-service';
import { BootstrapButton } from "../../bootstrap-button/bootstrap-button";

@Component({
  selector: 'app-vs-ai-configuration-modal',
  imports: [CommonModule, FormsModule, BootstrapButton],
  templateUrl: './vs-ai-configuration-modal.html',
  styleUrl: './vs-ai-configuration-modal.css',
})
export class VsAiConfigurationModal {
  UciEngine = UciEngine;

  eloSliderValue: number;
  humanPlayerIsWhite: boolean = true;
  
  constructor(private activeModal: NgbActiveModal, public themeService: ThemeService)
  {
    this.eloSliderValue = UciEngine.MIN_ELO;
  }

  submitClicked()
  {
    this.activeModal.close(new VsAiConfig(this.eloSliderValue, this.humanPlayerIsWhite));
  }
}
