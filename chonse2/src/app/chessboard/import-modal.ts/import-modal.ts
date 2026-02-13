import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PgnSources } from '../chessboard/pgn-misc';
import LocalStorageHelper from '../chessboard/local-storage-helper';
import ChessComAPI from '../api/chesscom-api';
import { ChessComGame } from '../api/chesscom-game';
import { CommonModule } from '@angular/common';
import { GameScore } from '../../../lib/game-state';

@Component({
  selector: 'app-import-modal',
  imports: [FormsModule, CommonModule],
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
    PgnSources.Manual
  ];

  siteUsername: string = "";
  savedUsernames: string[] = [];
  isUsernameInputFocused: boolean = false;

  chessComGames: Array<ChessComGame> = [];
  
  constructor(private activeModal: NgbActiveModal)
  {
    //LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_USERNAMES, []);
  }

  //On init, get the list of saved usernames.
  ngOnInit(): void 
  {
    this.savedUsernames = LocalStorageHelper.getStringArray(LocalStorageHelper.SAVED_USERNAMES);
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

  //Used to set the username when selecting from dropdown.
  selectUsername(name: string)
  {
    this.siteUsername = name;
  }

  //Removes the username in the array and sets it in local storage.
  handleRemoveUsernameClicked(name: string)
  { 
    const newArr = this.savedUsernames.filter( n => n != name );

    this.savedUsernames = newArr;
    this.siteUsername = "";
    LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_USERNAMES, newArr);
  }

  //Saves a username in local storage if not duplicate.
  saveUsername(name: string)
  {
    if (this.savedUsernames.includes(name))
    {
      return;
    }

    this.savedUsernames.push(name);
    LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_USERNAMES, this.savedUsernames);
  }

  //Search API.
  async handleGoPressed()
  {
    this.saveUsername(this.siteUsername);
    
    if (this.selectedDropdownOption == PgnSources.Chesscom)
    {
      this.chessComGames = await ChessComAPI.getGamesForUser(this.siteUsername);
    }

    //potentially add support for lichess in the future
  }

  
  getResultClassForChessComGame(game: ChessComGame): string
  {
    const score = game.getScore();

    if (score == GameScore.WHITE_WON)
    {
      if (game.white.username == this.siteUsername)
      {
        return "text-bg-success";
      }

      return "text-bg-danger";
    }

    if (score == GameScore.BLACK_WON)
    {
      if (game.black.username == this.siteUsername)
      {
        return "text-bg-success";
      }

      return "text-bg-danger";
    }

    return "text-bg-info text-light";
  }
}
