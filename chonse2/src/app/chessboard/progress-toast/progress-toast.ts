import { Component, ElementRef, input, ViewChild, AfterViewInit } from '@angular/core';
import { NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';
import BoardState from '../chessboard/board-state';

@Component({
  selector: 'app-progress-toast',
  imports: [NgbProgressbar],
  templateUrl: './progress-toast.html',
  styleUrl: './progress-toast.css',
})
export class ProgressToast {

  @ViewChild('toast') toastEl!: ElementRef;

  boardState = input.required<BoardState>();
}
