import Chonse2 from "./implementations/chonse2-impl/chonse2"
import IChessGame from "./i-chess-game";
import ChessopsBoard from "./implementations/chessops-impl/chessops";
import BoardState from "../../app/chessboard/chessboard/board-state";
import MoveResult from "../../app/chessboard/chessboard/move-result";
import { PgnHeaders } from "../../app/chessboard/chessboard/pgn-misc";

enum ChessImplementation 
{
    Chonse2,
    Chessops
}

export default class ChessGameFactory 
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
                return new ChessopsBoard(fen);
        }
    }

    static createFromPgn(pgn: string): {states: Array<IChessGame>, moveStack: Array<MoveResult>, pgnHeaders: PgnHeaders}
    {
        throw new Error();
    }
}