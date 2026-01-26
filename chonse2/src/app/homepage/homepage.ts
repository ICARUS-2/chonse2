import { Component } from '@angular/core';
import { Chessboard } from "../chessboard/chessboard";

@Component({
  selector: 'app-homepage',
  imports: [Chessboard],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage {

}
