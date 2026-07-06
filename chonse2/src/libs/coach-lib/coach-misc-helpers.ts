import Chonse2 from "../chonse2-lib/chonse2";
import { PieceType } from "../chonse2-lib/piece-type";
import { LineEval } from "../engine-lib/types/eval";
import CoachText from "./coach-text";
import { CoachMoveFlagType } from "./coach-types";

export class CoachMiscHelpers 
{
    //where the bishop can be fianchettoed to
    public static readonly FIANCHETTOS = ["g2", "b2", "g7", "b7"];   

    //#region Misc. helpers
    public static getKnightSquareHits(board: Chonse2, coordinate: string): Array<string>
    {
        const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(coordinate);
        const legalMoves: Array<string> = [];

        //A knight can only move two ahead and one to the side. These are the offsets for the eight possible squares a knight can go to relative to its current position
        const dRow: Array<number> = [2, 1, 2, 1, -1, -2, -1, -2];
        const dCol: Array<number> = [-1, -2, +1, +2, -2, -1, +2, +1];

        //Loop over each of the potential differences.
        for(let i = 0; i < dRow.length; i++)
        {
            //The rank that the knight will move to.
            const rankInQuestion = board.pieceState[rowIndex + dRow[i]];      

            //If the rank does in fact exist, find its square.
            if (rankInQuestion)
            {
                //The square that might be able to be moved to.
                const potentialMoveSquare = rankInQuestion[colIndex + dCol[i]];

                //It can also be undefined if the offset exists outside the board, check for this.
                if (potentialMoveSquare != undefined)
                {
                    //Legal move in either case is the current square with the 2 straight/1 side offset applied.
                    legalMoves.push(Chonse2.COORDS[rowIndex + dRow[i]][colIndex + dCol[i]]);
                }
            }
        }
        return legalMoves
    }

    //gets all of the follow up states in an engine line.
    public static getEngineLineStates(board: Chonse2, line: LineEval): Array<Chonse2>
    {
        const followUp: Array<Chonse2> = [board];

        line.pv.forEach( engineLineMove => 
            {
                const stateCopy = followUp.at(-1)?.getFullDeepCopy();

                const {fromSquare, toSquare, promotion } = CoachMiscHelpers.convertUciToChonse2Move(engineLineMove);

                if (stateCopy)
                {
                    stateCopy.completeMove(fromSquare, toSquare, promotion);
                    followUp.push(stateCopy);
                }   
                else 
                {
                    throw "Error getting engine line followup.";
                }
            }
        )

        return followUp;
    }

    public static didForceLossOfCastlingRights(
        state: Chonse2, 
        nextBestState: Chonse2, 
        whiteToMove: boolean, 
        nextBestMove: { fromSquare: string; toSquare: string; promotion: string;}
    ) : boolean
    {
        const doesOpponentHaveCastlingRights = whiteToMove ? 
            (state.whiteCastlingRights.kingSide || state.whiteCastlingRights.queenSide) : 
            (state.blackCastlingRights.kingSide || state.blackCastlingRights.queenSide);

        const willOpponentHaveCastlingRights = whiteToMove ? 
            (nextBestState.whiteCastlingRights.kingSide || nextBestState.whiteCastlingRights.queenSide) :
            (nextBestState.blackCastlingRights.kingSide || nextBestState.blackCastlingRights.queenSide);


        //If the opponent will not have castling rights after that move, make sure it wasn't cause they castled.
        if (doesOpponentHaveCastlingRights && !willOpponentHaveCastlingRights )
        {
            const bestPieceToMove = state.findPieceAtCoordinate(nextBestMove.fromSquare);
            const shouldMoveKing = bestPieceToMove == PieceType.WHITE_KING || bestPieceToMove == PieceType.BLACK_KING;

            //If the player should indeed move their king here.
            if (shouldMoveKing)
            {
                //the actual castling moves. 
                const kingside = whiteToMove ? CASTLING_MOVES.whiteKingside : CASTLING_MOVES.blackKingside;
                const queenside = whiteToMove ? CASTLING_MOVES.whiteQueenside : CASTLING_MOVES.blackQueenside;

                //Need to check if the next best move is for the opponent to castle. 
                const shouldOpponentCastleKingside = nextBestMove.fromSquare == kingside.fromSquare && nextBestMove.toSquare == kingside.toSquare;
                const shouldOpponentCastleQueenside = nextBestMove.fromSquare == queenside.fromSquare && nextBestMove.toSquare == queenside.toSquare;

                //If the next best move is not to castle, but in the next best state the player does not have castling rights,
                //the only implication is that they lost the right to castle.  
                return (!shouldOpponentCastleKingside && !shouldOpponentCastleQueenside);
            }
        }

        return false;
    }

    //Converts a UCI move to the format in which it can be used to move in the Chonse2 library.
    public static convertUciToChonse2Move(uci: string) : {fromSquare: string, toSquare: string, promotion: string}
    {
        const fromSquare = uci[0] + uci[1];
        const toSquare = uci[2] + uci[3];
        const promotion = uci[4] ? uci[4].toUpperCase() : PieceType.QUEEN;

        return {fromSquare, toSquare, promotion};
    }
    
}

export class CoachResourceLinks 
{
    public static readonly SKEWER_LINK = "https://www.chess.com/terms/skewer-chess";
    public static readonly PIN_LINK = "https://www.chess.com/terms/pin-chess"
}

export const BLOCKED_BISHOPS = 
{
    WhiteLightSquared: 
    {
        bishopSquare: Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE,
        pawnSquare: "d3",
    },
    WhiteDarkSquared: 
    {
        bishopSquare: Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE,
        pawnSquare: "e3",
    },
    BlackLightSquared: 
    {
        bishopSquare: Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE,
        pawnSquare: "e6",
    },
    BlackDarkSquared: 
    {
        bishopSquare: Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE,
        pawnSquare: "d6",
    },
}

export const PAWN_PUSH_KING_WEAKNESSES = 
{
    whiteKingside: "g2",
    whiteQueenside: "b2",
    blackKingside: "g7",
    blackQueenside: "b7"
}

export const CENTER_STRIKE_MOVEMENTS =
{
    white: 
    [
        {from: "e2", to: "e4"},
        {from: "d2", to: "d4"}
    ],

    black: 
    [
        {from: "e7", to: "e5"},
        {from: "d7", to: "d5"}
    ]
}

export const CASTLING_MOVES =
{
    whiteKingside:
    {
        fromSquare: Chonse2.WHITE_KING_SQUARE,
        toSquare: Chonse2.WHITE_KINGSIDE_KNIGHT_SQUARE,
    },

    whiteQueenside:
    {
        fromSquare: Chonse2.WHITE_KING_SQUARE,
        toSquare: Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE,
    },

    blackKingside:
    {
        fromSquare: Chonse2.BLACK_KING_SQUARE,
        toSquare: Chonse2.BLACK_KINGSIDE_KNIGHT_SQUARE,
    },

    blackQueenside:
    {
        fromSquare: Chonse2.BLACK_KING_SQUARE,
        toSquare: Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE,
    },
};