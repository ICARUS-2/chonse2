import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PgnSources } from '../chessboard/pgn-misc';
import LocalStorageHelper from '../chessboard/local-storage-helper';

@Component({
  selector: 'app-import-modal',
  imports: [FormsModule],
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
  
  constructor(private activeModal: NgbActiveModal)
  {
    //LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_USERNAMES, []);
  }

  ngOnInit(): void 
  {
    this.savedUsernames = LocalStorageHelper.getStringArray(LocalStorageHelper.SAVED_USERNAMES);
  }

  handleSubmitClicked()
  {
    this.activeModal.close(this.pgn);
  }

  selectUsername(name: string)
  {
    this.siteUsername = name;
  }

  handleRemoveUsernameClicked(name: string)
  { 
    const newArr = this.savedUsernames.filter( n => n != name );

    this.savedUsernames = newArr;
    LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_USERNAMES, newArr);
  }

  saveUsername(name: string)
  {
    if (this.savedUsernames.includes(name))
    {
      return;
    }

    this.savedUsernames.push(name);
    LocalStorageHelper.setStringArray(LocalStorageHelper.SAVED_USERNAMES, this.savedUsernames);
  }

  handleGoPressed()
  {
    this.saveUsername(this.siteUsername);
  }
}
