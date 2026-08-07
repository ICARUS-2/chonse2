import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import ThemeService from '../../themes/theme-service';
import GameLinkHelper from '../chessboard/game-link-helper';
import { ToastrService } from 'ngx-toastr';
import { BootstrapButton } from "../../ui/bootstrap-button/bootstrap-button";
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-copy-pgn-modal',
  imports: [BootstrapButton, TranslatePipe],
  templateUrl: './copy-pgn-modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './copy-pgn-modal.css',
})
export class CopyPgnModal {

  pgn = "";

  private translate = inject(TranslateService);

  constructor(public themeService: ThemeService, public toastr: ToastrService)
  {
    
  }

  handleCopyPgnClicked()
  {
    try 
    {
      console.log("Copy PGN clicked");
      navigator.clipboard.writeText(this.pgn);
      navigator.clipboard.writeText(this.pgn);

      this.toastr.info(this.translate.instant("chessboard.copyPgnModal.toastr.copyRawSuccess"));
    }
    catch(ex)
    {
      this.toastr.error(this.translate.instant("chessboard.copyPgnModal.toastr.copyError") + " " + ex);
    }
  }

  handleCopyPgnLinkClicked()
  {
    try 
    {
      console.log("PGN link clicked");
      navigator.clipboard.writeText(this.pgn);
      const pgnGameLink = GameLinkHelper.generatePgnGameLink(this.pgn);

      navigator.clipboard.writeText(pgnGameLink);

      this.toastr.info(this.translate.instant("chessboard.copyPgnModal.toastr.copyLinkSuccess"));
    }
    catch(ex)
    {
     this.toastr.error(this.translate.instant("chessboard.copyPgnModal.toastr.copyError") + " " + ex);
    }

  }
}
