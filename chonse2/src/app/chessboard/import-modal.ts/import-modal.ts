import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PgnSources } from '../chessboard/pgn-misc';
import LocalStorageHelper from '../chessboard/local-storage-helper';
import {ChessComAPI, ChessComGame} from '../api/chesscom-api';;
import { CommonModule } from '@angular/common';
import { GameScore } from '../../../lib/game-state';
import GameLinkHelper from '../chessboard/game-link-helper';
import { ToastrService } from 'ngx-toastr';
import { LichessAPI, LichessGame } from '../api/lichess-api';
import ThemeService from '../../themes/theme-service';
import { BootstrapButton } from "../../bootstrap-button/bootstrap-button";

@Component({
  selector: 'app-import-modal',
  imports: [FormsModule, CommonModule, BootstrapButton],
  templateUrl: './import-modal.html',
  styleUrl: './import-modal.css',
})
export class ImportModal implements OnInit
{
  //To access the options in the if block.
  PgnSources = PgnSources;

  //PGN to return.
  pgn: string = "";
  
  selectedDropdownOption: PgnSources = PgnSources.Chesscom;
  dropdownOptions: Array<PgnSources> = 
  [
    PgnSources.Chesscom,
    PgnSources.Lichess,
    PgnSources.Manual
  ];

  siteUsername: string = "";
  savedChesscomUsernames: string[] = [];
  savedLichessUsernames: string[] = [];
  isUsernameInputFocused: boolean = false;

  chessComGames: Array<ChessComGame> = [];
  lichessGames: Array<LichessGame> = [];
  
  constructor(private activeModal: NgbActiveModal, private toastr: ToastrService, public themeService: ThemeService)
  {
    //LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_USERNAMES, []);
  }

  //On init, get the list of saved usernames.
  ngOnInit(): void 
  {
    this.savedChesscomUsernames = LocalStorageHelper.getStringArray(LocalStorageHelper.SAVED_USERNAMES);
    this.savedLichessUsernames = LocalStorageHelper.getStringArray(LocalStorageHelper.SAVED_LICHESS_USERNAMES);
  }

  //Close and resolve with selected PGN.
  handleSubmitClicked()
  {
    this.activeModal.close(this.pgn);
  }

  //Close and resolve with the selected game from the chess.com API.
  handleChessComGameClicked(g: ChessComGame)
  {
    this.activeModal.close(g.pgn);
  }

  //#region Username stuff
  //Used to set the username when selecting from dropdown.
  selectUsername(name: string)
  {
    this.siteUsername = name;
  }

  //Chesscom
  //Removes the username in the array and sets it in local storage.
  handleRemoveChessComUsernameClicked(name: string)
  { 
    const newArr = this.savedChesscomUsernames.filter( n => n != name );

    this.savedChesscomUsernames = newArr;
    this.siteUsername = "";
    LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_USERNAMES, newArr);
  }

  //Saves a username in local storage if not duplicate.
  saveChesscomUsername(name: string)
  {
    if (name == "")
    {
      return;
    }

    for(let i = 0; i < this.savedChesscomUsernames.length; i++)
    {
      const su = this.savedChesscomUsernames[i];

      if (su.toLowerCase() == name.toLowerCase())
      {
        return;
      }
    }

    this.savedChesscomUsernames.push(name);
    LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_USERNAMES, this.savedChesscomUsernames);
  }

  //Lichess 

  saveLichessUsername(name: string)
  {
    if (name == "")
    {
      return;
    }

    for(let i = 0; i < this.savedLichessUsernames.length; i++)
    {
      const su = this.savedLichessUsernames[i];

      if (su.toLowerCase() == name.toLowerCase())
      {
        return;
      }
    }

    this.savedLichessUsernames.push(name);
    LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_LICHESS_USERNAMES, this.savedLichessUsernames);
  }

  handleRemoveLichessUsernameClicked(name: string)
  {
    const newArr = this.savedLichessUsernames.filter( n => n != name );

    this.savedLichessUsernames = newArr;
    this.siteUsername = "";
    LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_LICHESS_USERNAMES, newArr);
  }
  //#endregion


  //Search API.
  //Chesscom.
  async handleChessComGoPressed()
  {
    this.saveChesscomUsername(this.siteUsername);

    this.chessComGames = await ChessComAPI.getGamesForUser(this.siteUsername);
  }

  async handleChessComGameLinkClicked(event: PointerEvent, game: ChessComGame)
  {
    event.stopPropagation();
    const splitUrl = game.url.split("/");
    const gameId = splitUrl[splitUrl.length - 1];

    try 
    {
      await navigator.clipboard.writeText(GameLinkHelper.generateGameUrl(GameLinkHelper.CHESSCOM_SOURCE, gameId, this.siteUsername));
      this.toastr.info(`Successfully copied game for ${this.siteUsername}.`);
    }
    catch(ex)
    {
      this.toastr.error("Game link copy failed.");
    }
  }
  
  getResultClassForChessComGame(game: ChessComGame): string
  {
    const score = game.getScore();

    if (score == GameScore.WHITE_WON)
    {
      if (game.white.username.toLowerCase() == this.siteUsername.toLowerCase())
      {
        return "text-bg-success";
      }

      return "text-bg-danger";
    }

    if (score == GameScore.BLACK_WON)
    {
      if (game.black.username.toLowerCase() == this.siteUsername.toLowerCase())
      {
        return "text-bg-success";
      }

      return "text-bg-danger";
    }

    return "text-bg-info text-light";
  }

  //Lichess
  async handleLichessGoPressed()
  {
    this.saveLichessUsername(this.siteUsername);

    this.lichessGames = await LichessAPI.getGamesForUser(this.siteUsername);
  }

  handleLichessGameClicked(game: LichessGame)
  {
    this.activeModal.close(game.pgn);
  }

  async handleLichessGameLinkClicked(event: PointerEvent, game: LichessGame)
  {
    event.stopPropagation();

    try 
    {
      await navigator.clipboard.writeText(GameLinkHelper.generateGameUrl(GameLinkHelper.LICHESS_SOURCE, game.id, this.siteUsername));
      this.toastr.info(`Successfully copied game for ${this.siteUsername}.`);
    }
    catch(ex)
    {
      this.toastr.error("Game link copy failed.");
    }
  }

  getResultClassForLichessGame(game:LichessGame)
  {
    const score = game.getScore();

    if (score == GameScore.WHITE_WON)
    {
      if (game.players.white.name.toLowerCase() == this.siteUsername.toLowerCase())
      {
        return "text-bg-success";
      }

      return "text-bg-danger";
    }

    if (score == GameScore.BLACK_WON)
    {
      if (game.players.black.name.toLowerCase() == this.siteUsername.toLowerCase())
      {
        return "text-bg-success";
      }

      return "text-bg-danger";
    }

    return "text-bg-info text-light";
  }
}
