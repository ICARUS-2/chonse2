import { Component, signal, ChangeDetectionStrategy, inject } from '@angular/core';
import ThemeService from '../themes/theme-service';
import { form, FormField } from '@angular/forms/signals';
import { BootstrapButton } from "../ui/bootstrap-button/bootstrap-button";
import GameLinkHelper from '../chessboard/chessboard/game-link-helper';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { NotificationService } from '../ui/notifications/notification-service';

@Component({
  selector: 'app-pgn-link',
  imports: [BootstrapButton, FormField, TranslatePipe],
  templateUrl: './pgn-link.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './pgn-link.css',
})
export class PgnLink {
  public themeService = inject(ThemeService);
  private notificationService = inject(NotificationService)
  private translate = inject(TranslateService)

  formModel = signal<FormModel>({pgnText: ""});
  form = form(this.formModel);
  
  constructor()
  {

  }

  async onBtnClicked()
  {
    try 
    {
      const link = GameLinkHelper.generatePgnGameLink(this.form.pgnText().value());
      await navigator.clipboard.writeText(link);

      this.notificationService.notify('info', this.translate.instant("pgnLink.toastr.success"));
    }
    catch(ex)
    {
      this.notificationService.notify('error', this.translate.instant("pgnLink.toastr.error") + ex);
    }
  }
}

interface FormModel
{
  pgnText: string
} 
