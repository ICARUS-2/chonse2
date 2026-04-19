import { ChangeDetectionStrategy, Component, OnInit, signal, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PgnSources } from '../chessboard/pgn-misc';
import LocalStorageHelper from '../chessboard/local-storage-helper';
import {ChessComAPI, ChessComGame} from '../../../libs/server-api-lib/chesscom-api';;
import { CommonModule } from '@angular/common';
import GameLinkHelper from '../chessboard/game-link-helper';
import { ToastrService } from 'ngx-toastr';
import { LichessAPI, LichessGame } from '../../../libs/server-api-lib/lichess-api';
import ThemeService from '../../themes/theme-service';
import { BootstrapButton } from "../../ui/bootstrap-button/bootstrap-button";
import { form, FormField } from '@angular/forms/signals';
import { GameScore } from '../../../libs/chonse2-lib/game-state';

@Component({
  selector: 'app-import-modal',
  imports: [FormsModule, CommonModule, BootstrapButton, FormField],
  templateUrl: './import-modal.html',
  styleUrl: './import-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImportModal implements OnInit
{
  //To access the options in the if block.
  PgnSources = PgnSources;
  
  dropdownOptions: Array<PgnSources> = 
  [
    PgnSources.Chesscom,
    PgnSources.Lichess,
    PgnSources.Manual
  ];

  savedChesscomUsernames: WritableSignal<string[]> = signal([]);
  savedLichessUsernames: WritableSignal<string[]> = signal([]);
  isUsernameInputFocused: WritableSignal<boolean> = signal(false);

  chessComGames: WritableSignal<Array<ChessComGame>> = signal([]);
  lichessGames: WritableSignal<Array<LichessGame>> = signal([]);
  
  formModel = signal<FormModel>({
    pgn: "",
    selectedDropdownOption: PgnSources.Chesscom,
    siteUsername: ""
  })

  form = form(this.formModel, (schema) => 
  {
    //any potential constraints in the future
  })

  constructor(private activeModal: NgbActiveModal, private toastr: ToastrService, public themeService: ThemeService)
  {
    //LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_USERNAMES, []);
  }

  //On init, get the list of saved usernames.
  ngOnInit(): void 
  {
    this.savedChesscomUsernames.set(LocalStorageHelper.getStringArray(LocalStorageHelper.SAVED_USERNAMES));
    this.savedLichessUsernames.set(LocalStorageHelper.getStringArray(LocalStorageHelper.SAVED_LICHESS_USERNAMES));
  }

  //Close and resolve with selected PGN.
  handleSubmitClicked()
  {
    this.activeModal.close(this.form.pgn().value());
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
    this.form.siteUsername().value.set(name);
  }

  //Chesscom
  //Removes the username in the array and sets it in local storage.
  handleRemoveChessComUsernameClicked(name: string)
  { 
    const newArr = this.savedChesscomUsernames().filter( n => n != name );

    this.savedChesscomUsernames.set(newArr);
    this.form.siteUsername().value.set("");

    LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_USERNAMES, newArr);
  }

  //Saves a username in local storage if not duplicate.
  saveChesscomUsername(name: string)
  {
    if (name == "")
    {
      return;
    }

    for(let i = 0; i < this.savedChesscomUsernames().length; i++)
    {
      const su = this.savedChesscomUsernames()[i];

      if (su.toLowerCase() == name.toLowerCase())
      {
        return;
      }
    }

    this.savedChesscomUsernames.update( arr => [...arr, name] );
    LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_USERNAMES, this.savedChesscomUsernames());
  }

  //Lichess 

  saveLichessUsername(name: string)
  {
    if (name == "")
    {
      return;
    }

    for(let i = 0; i < this.savedLichessUsernames().length; i++)
    {
      const su = this.savedLichessUsernames()[i];

      if (su.toLowerCase() == name.toLowerCase())
      {
        return;
      }
    }

    this.savedLichessUsernames.update( arr => [...arr, name] )

    LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_LICHESS_USERNAMES, this.savedLichessUsernames());
  }

  handleRemoveLichessUsernameClicked(name: string)
  {
    const newArr = this.savedLichessUsernames().filter( n => n != name );

    this.savedLichessUsernames.set(newArr);
    this.form.siteUsername().value.set("");
    LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_LICHESS_USERNAMES, newArr);
  }
  //#endregion


  //Search API.
  //Chesscom.
  async handleChessComGoPressed()
  {
    this.saveChesscomUsername(this.form.siteUsername().value());
    
    this.chessComGames.set(await ChessComAPI.getGamesForUser(this.form.siteUsername().value()));
  }

  async handleChessComGameLinkClicked(event: PointerEvent, game: ChessComGame)
  {
    event.stopPropagation();
    const splitUrl = game.url.split("/");
    const gameId = splitUrl[splitUrl.length - 1];

    try 
    {
      await navigator.clipboard.writeText(GameLinkHelper.generateChessSiteGameUrl(GameLinkHelper.CHESSCOM_SOURCE, gameId, this.form.siteUsername().value()));
      this.toastr.info(`Successfully copied game for ${this.form.siteUsername().value()}.`);
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
      if (game.white.username.toLowerCase() == this.form.siteUsername().value().toLowerCase())
      {
        return "text-bg-success";
      }

      return "text-bg-danger";
    }

    if (score == GameScore.BLACK_WON)
    {
      if (game.black.username.toLowerCase() == this.form.siteUsername().value().toLowerCase())
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
    this.saveLichessUsername(this.form.siteUsername().value());

    this.lichessGames.set(await LichessAPI.getGamesForUser(this.form.siteUsername().value()));
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
      await navigator.clipboard.writeText(GameLinkHelper.generateChessSiteGameUrl(GameLinkHelper.LICHESS_SOURCE, game.id, this.form.siteUsername().value()));
      this.toastr.info(`Successfully copied game for ${this.form.siteUsername().value()}.`);
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
      if (game.players.white.name.toLowerCase() == this.form.siteUsername().value().toLowerCase())
      {
        return "text-bg-success";
      }

      return "text-bg-danger";
    }

    if (score == GameScore.BLACK_WON)
    {
      if (game.players.black.name.toLowerCase() == this.form.siteUsername().value().toLowerCase())
      {
        return "text-bg-success";
      }

      return "text-bg-danger";
    }

    return "text-bg-info text-light";
  }
}

interface FormModel
{
  pgn: string,
  selectedDropdownOption: PgnSources,
  siteUsername: string
}