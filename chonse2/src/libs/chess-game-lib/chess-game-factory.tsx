import Chonse2 from "./implementations/chonse2-impl/chonse2"
import ChessopsBoard from "./implementations/chessops-impl/chessops";
import IChessGame from "./i-chess-game";

 

enum ChessImplementation 
{
    Chonse2,
    Chessops
}

export class ChessGameFactory 
{
    private static readonly SELECTED_IMPL: ChessImplementation = ChessImplementation.Chonse2

    static create(): IChessGame   
    {
        switch(ChessGameFactory.SELECTED_IMPL)
        {
            case ChessImplementation.Chonse2:
                return new Chonse2();

            case ChessImplementation.Chessops:
                return new ChessopsBoard();
        }
    }

    static createFromFen(fen: string)
    {
        switch(ChessGameFactory.SELECTED_IMPL)
        {
            case ChessImplementation.Chonse2:
                return Chonse2.instantiateFromFen(fen);

            case ChessImplementation.Chessops:
                return ChessopsBoard.instantiateFromFen(fen);
        }
    }
}