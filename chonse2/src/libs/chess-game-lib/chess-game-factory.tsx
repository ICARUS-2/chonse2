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
    //Choose which implementation you would like to use by switching the enum val.
    private static readonly SELECTED_IMPL: ChessImplementation = ChessImplementation.Chonse2

    //Instantiate a base object.
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

    //Instantiate the object through FEN.
    static createFromFen(fen: string): IChessGame
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