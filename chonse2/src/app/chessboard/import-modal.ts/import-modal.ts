import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-import-modal',
  imports: [FormsModule],
  templateUrl: './import-modal.html',
  styleUrl: './import-modal.css',
})
export class ImportModal 
{
  manualPgn: string = "";

  constructor(private activeModal: NgbActiveModal)
  {

  }

  handleSubmitClicked()
  {
    this.activeModal.close(this.manualPgn);
  }
}
