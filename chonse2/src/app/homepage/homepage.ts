import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { StaticChessboard } from '../static-chessboard/static-chessboard';
import ThemeService from '../themes/theme-service';
import { IconButton } from "../ui/icon-button/icon-button";
import BoardState from '../chessboard/chessboard/board-state';
import LocalStorageHelper from '../../libs/local-storage-helper';
import GameLinkHelper from '../chessboard/chessboard/game-link-helper';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';
import { TranslatePipe } from '@ngx-translate/core';
import IChessGame from '../../libs/chess-game-lib/i-chess-game';
import ChessGameFactory from '../../libs/chess-game-lib/chess-game-factory';

@Component({
  selector: 'app-homepage',
  imports: [StaticChessboard, IconButton, NgbTooltip, TranslatePipe, RouterLink],
  templateUrl: './homepage.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './homepage.css',
})
export class Homepage {
  BoardState = BoardState;

  readonly DEMO_STATE: IChessGame = ChessGameFactory.createFromFen("6k1/5pp1/7p/p1pP4/2P5/5Q1P/P2R1PP1/4r1K1 w - - 0 1");

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
    this.router.navigate(['pgn/NoUQbgpgdgLgBAIgDIEtJwMIAsIGdcIC6AUMAMoowSLZ64B0AxgPYC2RpAIgIZWIBMABn4A2eoIAs4gKwdgAJWYBXKABNEAfjkB1LJWoIAqlABmzAE4wVvCADUUjGCnYlgAIQA23RgGtEASQwAQXlDMgB9fiRDAFkARgA5AHkwuXk8JQ94BEEAWjidPSoQD2ZEAE5y2VdPbx8SsoQ44Qk5EAwkxCDBQTkAFQhzVhQoXhRmKADg0Iio2MSUsjgAdwm4ACMATzhGHF9WG37nCAwJmHNmD0QRHra1PuPEOP4ALn4JF8EAZjgAcRi+gBqHq3VyoKB+BBYGAwAAOuBeAHpEctUUwcPgmGxEQBzbisCCIjxoQlxEQiAAc5S+ZP40mkIg4xDi9B2P1U0jg-FZEB+bhMnK+rISJh+EBEcCkcDc62kgJ2EukrLc3AkcASqgA7HAxHBVD8EoxOZrlYx+OqTBKKaysHzVBLyqzVGq3AAPM1wZqsgCK7vNhogariLPV61U5qSuU6z2FrsDerjQaF6pxnKwEriUoSifVObiSrgvvj8kYFM9uu9oo2nLiJrg8aNnutes5EFdHM9jvr7c56Qp8qEyt5hcY2v4IcjnXSnP43Lg8m4qji88YEDL-GT6x+3ogY6l8hMEGX3BnBcYavW7rVolZl-P8-j-DrJeX3vWY+b6XNb+vXbc4cLdtzS+QRWXkICHzieUaTAuNl3Ao8AGI4DyOIgA'])
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
