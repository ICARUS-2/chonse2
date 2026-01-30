import { Component } from '@angular/core';
import { Square } from "../chessboard/square/square";
import { PieceType } from '../../lib/piece-type';
import { PieceColor } from '../../lib/piece-color';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-promotion-modal',
  imports: [],
  templateUrl: './promotion-modal.html',
  styleUrl: './promotion-modal.css',
})
export class PromotionModal {
  color: string = "";

  queenOption: string = PieceType.QUEEN;
  rookOption: string = PieceType.ROOK;
  bishopOption: string = PieceType.BISHOP;
  knightOption: string = PieceType.KNIGHT;
  
  constructor(private activeModal: NgbActiveModal)
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
    return `piece/merida/${piece}.svg`;
  }


  confirmSelection(piece: string)
  {
    this.activeModal.close(piece);
  }

}
