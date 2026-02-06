import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import LocalStorageHelper from '../chessboard/chessboard/local-storage-helper';

@Component({
  selector: 'app-settings',
  imports: [FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings {
  localStorage = LocalStorageHelper;

  clickToMove: boolean = LocalStorageHelper.getBoolean(LocalStorageHelper.CLICK_TO_MOVE, false);

  handleClickToMoveSwitchPressed(val: boolean)
  {
    LocalStorageHelper.setBoolean(LocalStorageHelper.CLICK_TO_MOVE, val);
    this.clickToMove = val;
  }
}
