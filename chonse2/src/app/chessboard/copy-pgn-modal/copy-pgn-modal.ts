import { Component } from '@angular/core';
import ThemeService from '../../themes/theme-service';
import GameLinkHelper from '../chessboard/game-link-helper';
import { ToastrService } from 'ngx-toastr';
import { BootstrapButton } from "../../ui/bootstrap-button/bootstrap-button";

@Component({
  selector: 'app-copy-pgn-modal',
  imports: [BootstrapButton],
  templateUrl: './copy-pgn-modal.html',
  styleUrl: './copy-pgn-modal.css',
})
export class CopyPgnModal {

  pgn = "";

  constructor(public themeService: ThemeService, public toastr: ToastrService)
  {
    
  }

  handleCopyPgnClicked()
  {
    try 
    {
     navigator.clipboard.writeText(this.pgn);

      this.toastr.info("Successfully copied PGN");
    }
    catch(ex)
    {
      this.toastr.error("PGN copy failed: " + ex);
    }
  }

  handleCopyPgnLinkClicked()
  {
    try 
    {
      const pgnGameLink = GameLinkHelper.generatePgnGameLink(this.pgn);

      navigator.clipboard.writeText(pgnGameLink);

      this.toastr.info("Successfully copied PGN link");
    }
    catch(ex)
    {
      this.toastr.error("PGN link copy failed: " + ex);
    }

  }
}
