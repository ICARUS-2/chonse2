import { Component, signal, WritableSignal } from '@angular/core';
import BoardState from '../chessboard/board-state';

@Component({
  selector: 'app-database-modal',
  imports: [],
  templateUrl: './database-modal.html',
  styleUrl: './database-modal.css',
})
export class DatabaseModal {
  game: WritableSignal<BoardState | undefined> = signal(undefined);
  

}


interface FormModel
{
  comment: string;
}