import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Chessboard } from "./chessboard/chessboard";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('chonse2');
}
