import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import ThemeService from '../themes/theme-service';
import { form, FormField } from '@angular/forms/signals';
import { BootstrapButton } from "../ui/bootstrap-button/bootstrap-button";
import GameLinkHelper from '../chessboard/chessboard/game-link-helper';
import { ToastrService } from 'ngx-toastr';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-pgn-link',
  imports: [BootstrapButton, FormField, TranslatePipe],
  templateUrl: './pgn-link.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pgn-link.css',
})
export class PgnLink {

  formModel = signal<FormModel>({pgnText: ""});

  form = form(this.formModel);

  private translate = inject(TranslateService)
  
  constructor(public themeService: ThemeService, private toastr: ToastrService)
  {

  }

  onBtnClicked()
  {
    try 
    {
      const link = GameLinkHelper.generatePgnGameLink(this.form.pgnText().value());
      navigator.clipboard.writeText(link);

      this.toastr.info(this.translate.instant("pgnLink.toastr.success"));
    }
    catch(ex)
    {
      this.toastr.error(this.translate.instant("pgnLink.toastr.error") + ex);
    }
  }
}

interface FormModel
{
  pgnText: string
} 
