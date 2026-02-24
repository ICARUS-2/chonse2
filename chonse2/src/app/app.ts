import { Component, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from "./navbar/navbar";
import LocalStorageHelper from './chessboard/chessboard/local-storage-helper';
import { EngineName } from './chessboard/engine/types/enums';
import { UciEngine } from './chessboard/engine/uciEngine';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit{
  protected readonly title = signal('chonse2');

  ngOnInit()
  {
    const clickToMoveSetting = LocalStorageHelper.getBoolean(LocalStorageHelper.CLICK_TO_MOVE);

    if (clickToMoveSetting == null)
    {
      LocalStorageHelper.setBoolean(LocalStorageHelper.CLICK_TO_MOVE, false);
    }

    const engineSetting = LocalStorageHelper.getString(LocalStorageHelper.SELECTED_ENGINE, UciEngine.DEFAULT_ENGINE);

    if (engineSetting == null)
    {
      LocalStorageHelper.setString(EngineName.Stockfish18Lite, UciEngine.DEFAULT_ENGINE);
    }
  }
}
