import IChessGame from "../../i-chess-game";
import { CastlingRightsType } from "../../types/castling-rights-type";
import { GameState } from "../../types/game-state";
import { IMoveResult } from "../../types/move-result";
import { PieceColor } from "../../types/piece-color";

export default class ChessopsBoard implements IChessGame
{
    //#region Pieces and squares.

    //Should retrieve an 8x8 array representing the board with its pieces (wP, wK, bN, etc).
    public getPieceState(): string[][]
    {
        throw new Error("Not implemented.");
    }

    //Takes in a coordinate and returns the type of piece that's in it.
    public findPieceAtCoordinate(coord: string): string
    {
        throw new Error("Not implemented.");
    }

    //Retrieves the king coordinate for the passed color.
    public getKingCoordinate(kingColor: string): string
    {
        throw new Error("Not implemented.");
    }

    //Gets all the pieces pointed at a given square.
    public getPiecesThatHitSquare(square: string): { whiteCoords: Array<string>, whitePieces: Array<string>, blackCoords: Array<string>, blackPieces: Array<string> }
    {
        throw new Error("Not implemented.");
    }

    //Retrieves parallel arrays of all pieces/coords of the passed color.
    public getAllPiecesAndCoordsByColor(color: string): { pieces: Array<string>, coords: Array<string> }
    {
        throw new Error("Not implemented.");
    }

    //If the passed color's king is in check.
    public isInCheck(kingColor: string): boolean
    {
        throw new Error("Not implemented.");
    }

    //Positive number signifies that white is up, negative signifies black is up.
    public getMaterialAdvantage(): number
    {
        throw new Error("Not implemented.");
    }

    //Get captured pieces by color
    public getPiecesCapturedByPlayer(color: PieceColor): Array<string>
    {
        throw new Error("Not implemented.");
    }

    //Returns true if white to move, false if black to move.
    public getTurn(): boolean
    {
        throw new Error("Not implemented.");
    }

    //Set true for white to move, false for black to move.
    public setTurn(val: boolean): void
    {
        throw new Error("Not implemented.");
    }

    //#endregion

    //#region Manipulation of state

    //Resets the board to its default.
    public reset(): void
    {
        throw new Error("Not implemented.");
    }

    //Clears board except the kings.
    public clear(): void
    {
        throw new Error("Not implemented.");
    }

    //Places a piece at a given coord.
    public setPieceOnBoard(coord: string, piece: string): void
    {
        throw new Error("Not implemented.");
    }

    //#endregion

    //#region Game state

    //Gets game state object.
    public getGameState(): GameState
    {
        throw new Error("Not implemented.");
    }

    //Triggers game over check from outside if necessary
    public checkIsGameOver(): void
    {
        throw new Error("Not implemented.");
    }

    //#endregion

    //#region Moves

    //Fully validated legal moves that a certain coordinate's piece can make
    public getLegalMoves(coordinate: string): Array<string>
    {
        throw new Error("Not implemented.");
    }

    //Moves a piece from one spot to another and accounting for promotion if applicable.
    public completeMove(fromCoordinate: string, toCoordinate: string, promotionPiece: string): IMoveResult
    {
        throw new Error("Not implemented.");
    }

    //Clears state cache and reverts it completely to that of the previous move.
    public undoMostRecentMove(): void
    {
        throw new Error("Not implemented.");
    }

    //#endregion

    //#region Castling and en passant

    public getCastlingRights(type: CastlingRightsType): boolean
    {
        throw new Error("Not implemented.");
    }

    //Sets the castling rights for one of the four types
    public setCastlingRights(type: CastlingRightsType, val: boolean): void
    {
        throw new Error("Not implemented.");
    }

    //#endregion

    //#region Instantiation

    public clone(): IChessGame
    {
        throw new Error("Not implemented.");
    }

    public static instantiateFromFen(fen: string): IChessGame
    {
        throw new Error("Not implemented.");
    }

    //#endregion

    //#region FEN

    public getFEN(): string
    {
        throw new Error("Not implemented.");
    }

    //#endregion
}