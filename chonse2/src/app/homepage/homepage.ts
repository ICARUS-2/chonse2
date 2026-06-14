import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router } from '@angular/router';
import { StaticChessboard } from '../static-chessboard/static-chessboard';
import ThemeService from '../themes/theme-service';
import { IconButton } from "../ui/icon-button/icon-button";
import Chonse2 from '../../libs/chonse2-lib/chonse2';
import BoardState from '../chessboard/chessboard/board-state';
import LocalStorageHelper from '../../libs/local-storage-helper';
import GameLinkHelper from '../chessboard/chessboard/game-link-helper';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-homepage',
  imports: [StaticChessboard, IconButton, NgbTooltip, TranslatePipe],
  templateUrl: './homepage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './homepage.css',
})
export class Homepage {
  BoardState = BoardState;

  readonly DEMO_STATE: Chonse2 = Chonse2.instantiateFromFen("6k1/5pp1/7p/p1pP4/2P5/5Q1P/P2R1PP1/4r1K1 w - - 0 1");

  lastPgnBoardState: BoardState | null = null;

  constructor(public themeService: ThemeService, private router: Router)
  {
    //get the last PGN analyzed from the local storage if it exists.
    const localStoragePgn = LocalStorageHelper.getString(LocalStorageHelper.LAST_PGN, "");

    //check if it was even found.
    if (localStoragePgn)
    {
      //if it was found, decompress it
      const decompressedPgn = GameLinkHelper.decompressStringForUrl(localStoragePgn);

      //if the decompression failed, it should still be null.
      if (decompressedPgn)
      {
        try 
        {
          this.lastPgnBoardState = BoardState.parsePGN(decompressedPgn);
        }
        catch(ex)
        {
          //it wasn't a valid pgn
        }
      }
    }
  }

  ngOnInit()
  {

  }

  //left btns
  analysisButtonClicked()
  {
    this.router.navigate(['analysis'])
  }
  
  boardEditorButtonClicked()
  {
    this.router.navigate(['editor']);
  }

  vsStockfishButtonClicked()
  {
    this.router.navigate(['vs-ai']);
  }

  pgnLinkButtonClicked()
  {
    this.router.navigate(['pgn-link']);
  }

  //middle btns
  mostRecentBtnClicked()
  {
    const compressedPgn = LocalStorageHelper.getString(LocalStorageHelper.LAST_PGN, "");

    if (compressedPgn)
    {
      this.router.navigate(['pgn/' + compressedPgn]);
    }
  }

  demoButtonClicked()
  {
    this.router.navigate(['pgn/NoUQbgpgdgLgBAIgDIEtJwMIAsIGdcIC6AUMAMoowSLZ64B0AxgPYC2RpAIgIZWIBMABn4A2eoIAs4gKwdgAJWYBXKABNEAfjkB1LJWoIAqlABmzAE4wVvCADUUjGCnYlgAIQA23RgGtEASQwAQXlDMgB9fiRDAFkARgA5AHkwuXk8JQ94BEEAWjidPSoQD2ZEAE5y2VdPbx8SsoQ44Qk5EAwkxCDBQTkAFQhzVhQoXhRmKADg0Iio2MSUsjgAdwm4ACMATzhGHF9WG37nCAwJmHNmD0QRHra1PuPEOP4ALn4JF8EAZjgAcRi+gBqHq3VyoKB+BBYGAwAAOuBeAHpEctUUwcPgmGxEQBzbisCCIjxoQlxEQiAAc5S+ZP40mkIg4xDi9B2-EYP1UAHZVNI4PxWRB+BAfm5GBSTHyvqyEji4iYfhAuRARHApHA3CY4utpICdlzGKrpKy3DruBI4Al1hTuXAxHBVPxVD8EtzGHyuSbzYx+JacRLVRTWVh+FhRSYbaryqznaoLZrpAAPH1wZqsgCKqjiyd9CXdEAtcRZlvWcUdcCSuU6zxljsTBYdSYbcWlloVOL5WC5WFVcXVsqbFoSJhE9cLxrg6Z9Y7g8m4FPFqft6YLCo2XJ1qc9cBFDcN7tTQYdEl5O9Hp7i0Z3EkTp-kEYgFL1QhNjDiIsnqgXXP5xcrnXSCkID5fgBVnbgyziWdxUfflW3Wfh1h+KdlR-d5WXvd8oO4LluBAicOUYC0dWTC1RFZJDSNnYCG34bd5CzN9JyVdY0KPdJ319dNWPWMirzcEVy24m9yy+QQMKFW9fXSCQIDiPUaQwt96ygwCVIAYjgPI4iAA'])
  }

  //right btns
  databaseBtnClicked()
  {
    this.router.navigate(["database"]);
  }

  settingsBtnClicked()
  {
    this.router.navigate(['settings']);
  }

  sourceCodeBtnClicked()
  {
    window.open("https://github.com/ICARUS-2/chonse2/", '_blank');
  }

  developerSiteBtnClicked()
  {
    window.open("https://icarus-2.github.io", '_blank');
  }
}
