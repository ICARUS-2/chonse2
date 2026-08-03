import IChessGame from "./i-chess-game";
import ChessopsBoard from "./implementations/chessops-impl/chessops";
import MoveResult from "../../app/chessboard/chessboard/move-result";
import { PgnHeaders } from "../../app/chessboard/chessboard/pgn-misc";

enum ChessImplementation 
{
    Chessops
    //Add your own implementation here and create a wrapper implementing IChessGame.
}

export default class ChessGameFactory 
{
    //Choose which implementation you would like to use by switching the enum val.
    private static readonly SELECTED_IMPL: ChessImplementation = ChessImplementation.Chessops

    //Instantiate a base object.
    static create(): IChessGame   
    {
        switch(ChessGameFactory.SELECTED_IMPL)
        {
            case ChessImplementation.Chessops:
                return new ChessopsBoard();
        }
    }

    //Instantiate the object through FEN.
    static createFromFen(fen: string): IChessGame
    {
        switch(ChessGameFactory.SELECTED_IMPL)
        {
            case ChessImplementation.Chessops:
                return new ChessopsBoard(fen);
        }
    }

    //Returns the required components from a PGN.
    static createFromPgn(pgn: string): {states: Array<IChessGame>, moveStack: Array<MoveResult>, pgnHeaders: PgnHeaders}
    {
        switch(ChessGameFactory.SELECTED_IMPL)
        {
            case ChessImplementation.Chessops:
                return ChessopsBoard.parsePGN(pgn);
        }
    }
}