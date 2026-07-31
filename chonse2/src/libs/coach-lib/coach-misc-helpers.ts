
import Chonse2 from "../chess-game-lib/implementations/chonse2-impl/chonse2";
import { CastlingRightsType } from "../chess-game-lib/types/castling-rights-type";
import { ChessConstants } from "../chess-game-lib/types/constants";
import { PieceType } from "../chess-game-lib/types/piece-type";
import { LineEval } from "../engine-lib/types/eval";

export class CoachMiscHelpers 
{
    //where the bishop can be fianchettoed to
    public static readonly FIANCHETTOS = ["g2", "b2", "g7", "b7"];   

    //#region Misc. helpers
    public static getKnightSquareHits(board: Chonse2, coordinate: string): Array<string>
    {
        const {rowIndex, colIndex} = ChessConstants.findIndexFromCoordinate(coordinate);
        const legalMoves: Array<string> = [];

        //A knight can only move two ahead and one to the side. These are the offsets for the eight possible squares a knight can go to relative to its current position
        const dRow: Array<number> = [2, 1, 2, 1, -1, -2, -1, -2];
        const dCol: Array<number> = [-1, -2, +1, +2, -2, -1, +2, +1];

        //Loop over each of the potential differences.
        for(let i = 0; i < dRow.length; i++)
        {
            //The rank that the knight will move to.
            const rankInQuestion = board.getPieceState()[rowIndex + dRow[i]];      

            //If the rank does in fact exist, find its square.
            if (rankInQuestion)
            {
                //The square that might be able to be moved to.
                const potentialMoveSquare = rankInQuestion[colIndex + dCol[i]];

                //It can also be undefined if the offset exists outside the board, check for this.
                if (potentialMoveSquare != undefined)
                {
                    //Legal move in either case is the current square with the 2 straight/1 side offset applied.
                    legalMoves.push(ChessConstants.COORDS[rowIndex + dRow[i]][colIndex + dCol[i]]);
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
                const stateCopy = followUp.at(-1)?.clone();

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
        const doesOpponentHaveCastlingRights = whiteToMove
            ? (
                state.getCastlingRights(CastlingRightsType.WhiteKingside) ||
                state.getCastlingRights(CastlingRightsType.WhiteQueenside)
            )
            : (
                state.getCastlingRights(CastlingRightsType.BlackKingside) ||
                state.getCastlingRights(CastlingRightsType.BlackQueenside)
            );

        const willOpponentHaveCastlingRights = whiteToMove
            ? (
                nextBestState.getCastlingRights(CastlingRightsType.WhiteKingside) ||
                nextBestState.getCastlingRights(CastlingRightsType.WhiteQueenside)
            )
            : (
                nextBestState.getCastlingRights(CastlingRightsType.BlackKingside) ||
                nextBestState.getCastlingRights(CastlingRightsType.BlackQueenside)
            );


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
    public static readonly PIN_LINK = "https://www.chess.com/terms/pin-chess";
    public static readonly OUTPOST_LINK = "https://www.chess.com/terms/outpost-chess";
}

export const BLOCKED_BISHOPS = 
{
    WhiteLightSquared: 
    {
        bishopSquare: ChessConstants.WHITE_KINGSIDE_BISHOP_SQUARE,
        pawnSquare: "d3",
    },
    WhiteDarkSquared: 
    {
        bishopSquare: ChessConstants.WHITE_QUEENSIDE_BISHOP_SQUARE,
        pawnSquare: "e3",
    },
    BlackLightSquared: 
    {
        bishopSquare: ChessConstants.BLACK_QUEENSIDE_BISHOP_SQUARE,
        pawnSquare: "e6",
    },
    BlackDarkSquared: 
    {
        bishopSquare: ChessConstants.BLACK_KINGSIDE_BISHOP_SQUARE,
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
        fromSquare: ChessConstants.WHITE_KING_SQUARE,
        toSquare: ChessConstants.WHITE_KINGSIDE_KNIGHT_SQUARE,
    },

    whiteQueenside:
    {
        fromSquare: ChessConstants.WHITE_KING_SQUARE,
        toSquare: ChessConstants.WHITE_QUEENSIDE_BISHOP_SQUARE,
    },

    blackKingside:
    {
        fromSquare: ChessConstants.BLACK_KING_SQUARE,
        toSquare: ChessConstants.BLACK_KINGSIDE_KNIGHT_SQUARE,
    },

    blackQueenside:
    {
        fromSquare: ChessConstants.BLACK_KING_SQUARE,
        toSquare: ChessConstants.BLACK_QUEENSIDE_BISHOP_SQUARE,
    },
};