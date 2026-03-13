import { AfterViewInit, ChangeDetectionStrategy, Component, OnInit, ViewChild } from '@angular/core';
import { ChessBoardService } from '../chessboard/chessboard/chess-board-service';
import { BoardNames } from '../boards';
import { Chessboard } from '../chessboard/chessboard/chessboard';
import BoardState from '../chessboard/chessboard/board-state';
import Chonse2 from '../../lib/chonse2';
import { RouteConstants } from '../app.routes';
import VsAiConfigurationModalHelper from './vs-ai-configuration-modal-helper';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { GameState } from '../../lib/game-state';

@Component({
  selector: 'app-vs-ai',
  imports: [Chessboard],
  templateUrl: './vs-ai.html',
  styleUrl: './vs-ai.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VsAi implements OnInit, AfterViewInit{

  BoardNames = BoardNames;

  chessboard?: Chessboard;

  @ViewChild(Chessboard)
  set chessboardSetter(board: Chessboard | undefined) 
  {
    if (!board) 
    {
      return;
    }

    this.chessboard = board;

    if (this.inputtedPosition) 
    {
      const restoredPosition = Object.assign(new Chonse2(), this.inputtedPosition);
      restoredPosition.gameState = new GameState();
      restoredPosition.checkIsGameOver();

      VsAiConfigurationModalHelper.doModal(
        this.ngbModal,
        this.gameService,
        this.toastr,
        board,
        restoredPosition
      );
    }
  }

  inputtedPosition: Chonse2 | undefined;
  
  constructor(public gameService: ChessBoardService, private ngbModal: NgbModal, private toastr: ToastrService)
  {

  }

  ngOnInit(): void 
  {
    const routeState = history.state;
    this.inputtedPosition = routeState[RouteConstants.ROUTE_INPUTTED_POSITION];

    this.setDefault();
  }
  
  ngAfterViewInit(): void {

  }

  setDefault()
  {
    const bs: BoardState = new BoardState();
    bs.isVsAi.set(true);
    this.gameService.addGame(BoardNames.VsAi, bs);
  } 
}
