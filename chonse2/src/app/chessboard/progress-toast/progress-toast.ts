import { Component, ElementRef, input, ViewChild, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
import { NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';
import BoardState from '../chessboard/board-state';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-progress-toast',
  imports: [NgbProgressbar, TranslatePipe],
  templateUrl: './progress-toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './progress-toast.css',
})
export class ProgressToast {

  @ViewChild('toast') toastEl!: ElementRef;

  boardState = input.required<BoardState>();
}
