import { Component, ElementRef, input, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { NgbProgressbar } from '@ng-bootstrap/ng-bootstrap';
import BoardState from '../chessboard/board-state';
import { TranslatePipe } from '@ngx-translate/core';
import LocalStorageHelper from '../../../libs/local-storage-helper';

@Component({
  selector: 'app-progress-toast',
  imports: [NgbProgressbar, TranslatePipe],
  templateUrl: './progress-toast.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrl: './progress-toast.css',
})
export class ProgressToast {

  LocalStorageHelper = LocalStorageHelper;

  @ViewChild('toast') toastEl!: ElementRef;

  boardState = input.required<BoardState>();
}
