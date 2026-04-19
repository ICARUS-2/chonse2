import { Component, signal } from '@angular/core';
import ThemeService from '../themes/theme-service';
import { form, FormField } from '@angular/forms/signals';
import { BootstrapButton } from "../ui/bootstrap-button/bootstrap-button";
import GameLinkHelper from '../chessboard/chessboard/game-link-helper';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pgn-link',
  imports: [BootstrapButton, FormField],
  templateUrl: './pgn-link.html',
  styleUrl: './pgn-link.css',
})
export class PgnLink {

  formModel = signal<FormModel>({pgnText: ""});

  form = form(this.formModel);
  
  constructor(public themeService: ThemeService, private toastr: ToastrService)
  {

  }

  onBtnClicked()
  {
    try 
    {
      const link = GameLinkHelper.generatePgnGameLink(this.form.pgnText().value());
      navigator.clipboard.writeText(link);

      this.toastr.info("Link successfully copied");
    }
    catch(ex)
    {
      this.toastr.error("Link generation failed: " + ex);
    }
  }
}

interface FormModel
{
  pgnText: string
} 
