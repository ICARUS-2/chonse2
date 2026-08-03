import { CastlingRightsType } from "./types/castling-rights-type";
import { GameState } from "./types/game-state";
import { IMoveResult } from "./types/move-result";

export default interface IChessGame
{
    //#region Pieces and squares.

    //Should retrieve an 8x8 array representing the board with its pieces (wP, wK, bN, etc).
    getPieceState(): string[][];

    //Takes in a coordinate and returns the type of piece that's in it.
    findPieceAtCoordinate(coord: string): string

    //Retrieves the king coordinate for the passed color.
    getKingCoordinate(kingColor: string): string

    //Gets all the pieces pointed at a given square.
    getPiecesThatHitSquare(square: string): {whiteCoords: Array<string>, whitePieces: Array<string>, blackCoords: Array<string>, blackPieces: Array<string>}

    //Retrieves parallel arrays of all pieces/coords of the passed color.
    getAllPiecesAndCoordsByColor(color: string): {pieces: Array<string>, coords: Array<string>}

    //If the passed color's king is in check.
    isInCheck(kingColor: string): boolean

    //Positive number signifies that white is up, negative signifies black is up.
    getMaterialAdvantage(): number

    //Get captured pieces by color
    getPiecesCapturedByPlayer(color: string): Array<string>

    //Returns true if white to move, false if black to move.
    getTurn(): boolean
    //#endregion

    //#region Manipulation of state
    //Resets the board to its default.
    reset(): void

    //Places a piece at a given coord.
    setPieceOnBoard(coord: string, piece: string): void

    //#endregion

    //#region Game state
    //Gets game state object.
    getGameState(): GameState

    //Triggers game over check from outside if necessary
    checkIsGameOver(): void
    //#endregion

    //#region Moves
    //Fully validated legal moves that a certain coordinate's piece can make
    getLegalMoves(coordinate: string): Array<string>

    //Moves a piece from one spot to another and accounting for promotion if applicable.
    completeMove(fromCoordinate: string, toCoordinate: string, promotionPiece: string): IMoveResult

    //Clears state cache and reverts it completely to that of the previous move.
    undoMostRecentMove(): void
    //#endregion

    //#region Castling and en passant
    getCastlingRights(type: CastlingRightsType): boolean

    //Retrieves en passant square coord.
    getEnPassantSquare(): string
    
    //#endregion

    //#region Instantiation
    clone(): IChessGame
    //#endregion

    //#region FEN
    getFEN(): string
    //#endregion
}