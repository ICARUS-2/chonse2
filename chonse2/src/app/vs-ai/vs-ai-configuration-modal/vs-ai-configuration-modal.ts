import { Component } from '@angular/core';
import { UciEngine } from '../../chessboard/engine/uciEngine';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import VsAiConfig from '../vs-ai-config';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-vs-ai-configuration-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './vs-ai-configuration-modal.html',
  styleUrl: './vs-ai-configuration-modal.css',
})
export class VsAiConfigurationModal {
  UciEngine = UciEngine;

  eloSliderValue: number;
  humanPlayerIsWhite: boolean = true;
  
  constructor(private activeModal: NgbActiveModal)
  {
    this.eloSliderValue = UciEngine.MIN_ELO;
  }

  submitClicked()
  {
    this.activeModal.close(new VsAiConfig(this.eloSliderValue, this.humanPlayerIsWhite));
  }
}
