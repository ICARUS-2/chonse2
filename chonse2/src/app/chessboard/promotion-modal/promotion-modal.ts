import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import ThemeService from '../../themes/theme-service';
import { TranslatePipe } from '@ngx-translate/core';
import ChessboardHelper from '../helpers';
import { PieceType } from '../../../libs/chess-game-lib/types/piece-type';
import { PieceColor } from '../../../libs/chess-game-lib/types/piece-color';

@Component({
  selector: 'app-promotion-modal',
  imports: [TranslatePipe],
  templateUrl: './promotion-modal.html',
  styleUrl: './promotion-modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromotionModal {
  color: string = "";

  queenOption: string = PieceType.QUEEN;
  rookOption: string = PieceType.ROOK;
  bishopOption: string = PieceType.BISHOP;
  knightOption: string = PieceType.KNIGHT;
  
  constructor(private activeModal: NgbActiveModal, public themeService: ThemeService)
  {

  }

  getQueen()
  {
    if (this.color == PieceColor.WHITE)
    {
      return PieceType.WHITE_QUEEN;
    }

    if (this.color == PieceColor.BLACK)
    {
      return PieceType.BLACK_QUEEN;
    }
    
    return "";
  }

  getRook()
  {
    if (this.color == PieceColor.WHITE)
    {
      return PieceType.WHITE_ROOK;
    }

    if (this.color == PieceColor.BLACK)
    {
      return PieceType.BLACK_ROOK;
    }
    
    return "";
  }

  getBishop()
  {
    if (this.color == PieceColor.WHITE)
    {
      return PieceType.WHITE_BISHOP;
    }

    if (this.color == PieceColor.BLACK)
    {
      return PieceType.BLACK_BISHOP;
    }
    
    return "";
  }

  getKnight()
  {
    if (this.color == PieceColor.WHITE)
    {
      return PieceType.WHITE_KNIGHT;
    }

    if (this.color == PieceColor.BLACK)
    {
      return PieceType.BLACK_KNIGHT;
    }
    
    return "";
  }

  getSrc(piece: string)
  {
    return ChessboardHelper.getIconSourceForPiece(piece);
  }


  confirmSelection(piece: string)
  {
    this.activeModal.close(piece);
  }

}
