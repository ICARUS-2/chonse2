import Chonse2 from "./chonse2";
import { PieceColor } from "./piece-color";
import PieceMaterial from "./piece-material";
import { PieceType } from "./piece-type";

export default class Chonse2Extensions
{
    public static getHangingPieces(board: Chonse2): Array<string>
    {
        const hangingPieceCoords:Array<string> = [];

        //Check every piece in the board.
        for(let i = 0; i < board.pieceState.length; i++)
        {
            const currentRank = board.pieceState[i];

            for(let j = 0; j < currentRank.length; j++)
            {
                const squareCoord = Chonse2.COORDS[i][j];
                if(this.doesSquareHaveHangingPiece(board, squareCoord))
                {
                    hangingPieceCoords.push(squareCoord);
                }
            }
        }
        
        return hangingPieceCoords;
    }

    public static doesSquareHaveHangingPiece(board: Chonse2, squareCoord: string): boolean
    {        
        const { rowIndex, colIndex } = Chonse2.findIndexFromCoordinate(squareCoord);
        const pieceInSquare = board.pieceState[rowIndex][colIndex];

        //A square with no piece in it isn't hanging.
        if (pieceInSquare == PieceType.NONE)
        {
            return false;
        }

        const pieceInSquareColor = pieceInSquare[0] == "w" ? PieceColor.WHITE : PieceColor.BLACK;
        const hits = Chonse2Extensions.getPiecesThatHitSquare(board, squareCoord);

        const attackers = pieceInSquareColor == PieceColor.WHITE ? hits.black : hits.white;
        const defenders = pieceInSquareColor == PieceColor.WHITE ? hits.white : hits.black;

        //A piece that isn't attacked isn't hanging.
        if (attackers.length == 0)
        {
            return false;
        }

        //If we got this far, there's at least one attacker. One attacker and no defenders = hanging.
        if (defenders.length == 0)
        {
            return true;
        }

        //If the value of the smallest attacker value is less than that of the piece, then it is hanging.
        const valueOfPieceInSquare = PieceMaterial.getMaterialFromPiece(pieceInSquare);
        const minAttackerValue = Math.min( ...attackers.map( p => PieceMaterial.getMaterialFromPiece(p)) );
        if (minAttackerValue < valueOfPieceInSquare)
        {
            return true;
        }

        //If a piece has more attackers than defenders then it's hanging
        if (attackers.length > defenders.length)
        {
            return true;
        }

        //If none of the above three conditions are met then it's not hanging.
        return false;
    }

    public static getPiecesThatHitSquare(board: Chonse2, square: string): {white: Array<string>, black: Array<string>} {
        const boardCopy = board.getFullDeepCopy();
        const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(square);
        const o: { white: string[], black: string[] } = { white: [], black: [] };

        const colors = [PieceColor.WHITE, PieceColor.BLACK]; 

        for (const currentColor of colors) {
            boardCopy.turn = currentColor == PieceColor.WHITE;
            
            //Enemy ghost pawn to simulate "capturing"
            boardCopy.pieceState[rowIndex][colIndex] = (currentColor === PieceColor.WHITE) ? PieceType.BLACK_PAWN : PieceType.WHITE_PAWN;

            //Loop through every single piece.
            for (let i = 0; i < Chonse2.SIZE; i++) 
            {
                for (let j = 0; j < Chonse2.SIZE; j++) 
                {
                    //The current piece we are checking
                    const piece = boardCopy.pieceState[i][j];
                    
                    //If there is no piece there, it has no legal moves.
                    if (piece === PieceType.NONE) 
                    {
                        continue
                    };

                    //Ensures only the right color is checked.
                    if (piece[0] !== currentColor) continue;

                    //Gets the coordinate for the given square.
                    const coord = Chonse2.COORDS[i][j];

                    let legalMoves: Array<string> = [];

                    //Need to check legal moves to see what squares it hits.
                    if (piece != PieceType.WHITE_KING && piece != PieceType.BLACK_KING)
                    {
                        legalMoves = boardCopy.getLegalMoves(coord);
                    }
                    else 
                    {
                        //Circumvents the fact that the king cannot put himself in check because he could be the last defender of a piece.
                        legalMoves = boardCopy._getPotentiallyLegalKingMoves(coord, piece[0]);
                    }

                    //If the piece has the square in question as a legal move, push it.                
                    if (legalMoves.includes(square)) 
                    {
                        if (currentColor === PieceColor.WHITE) 
                        {
                            o.white.push(piece);
                        } 
                        else 
                        {
                            o.black.push(piece);
                        }
                    }
                }
            }
        }
        return o;
    }
}