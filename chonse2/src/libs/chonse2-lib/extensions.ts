import Chonse2 from "./chonse2";
import { PieceType } from "./piece-type";

export default class Chonse2Extensions
{
    public static isPieceHanging(board: Chonse2)
    {
        
    }

    public static getAttackersAndDefendersForSquare(board: Chonse2, square: string): {attackers: Array<string>, defenders: Array<string>}
    {
        //Ensures that the original board doesn't get modified.
        const boardCopy = board.getFullDeepCopy();

        //Gets the piece in that square currently.
        const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(square);
        const pieceInSquare = boardCopy.pieceState[rowIndex][colIndex];

        //Represents what will be returned.
        const o: { attackers: string[], defenders: string[] } = 
        { 
            attackers: [], 
            defenders: [] 
        };

        //Ghost pawn is needed to simulate the ability to attack/defend a square.
        const ghostPawnForAttacker = boardCopy.turn ? PieceType.BLACK_PAWN : PieceType.WHITE_PAWN;
        boardCopy.pieceState[rowIndex][colIndex] = ghostPawnForAttacker;

        //Check every piece in the board.
        for(let i = 0; i < boardCopy.pieceState.length; i++)
        {
            const currentRank = boardCopy.pieceState[i];

            for(let j = 0; j < currentRank.length; j++)
            {
                //Coordinate for the square we are checking.
                const coord = Chonse2.COORDS[i][j];

                //Need to see if the piece in that square can move to the target square.
                const legalMoves = boardCopy.getLegalMoves(coord);

                //If we can move here, it is a valid attacker.
                if (legalMoves.includes(square))
                {
                    const piece = boardCopy.pieceState[i][j];
                    o.attackers.push(piece);
                }
            }
        }

        //Switch the turn now to check defenders.
        boardCopy.turn = !boardCopy.turn;

        //Ghost pawn switches color.
        const ghostPawnForDefender = boardCopy.turn ? PieceType.BLACK_PAWN : PieceType.WHITE_PAWN;
        boardCopy.pieceState[rowIndex][colIndex] = ghostPawnForDefender;
        
        //Checks every piece.
        for(let i = 0; i < boardCopy.pieceState.length; i++)
        {
            const currentRank = boardCopy.pieceState[i];

            for(let j = 0; j < currentRank.length; j++)
            {
                //Coordinate for the square we are checking.
                const coord = Chonse2.COORDS[i][j];

                //Need to see if the piece in that square can move to the target square.
                const legalMoves = boardCopy.getLegalMoves(coord);

                //If we can move here, it is a valid defender.
                if (legalMoves.includes(square))
                {
                    const piece = boardCopy.pieceState[i][j];
                    o.defenders.push(piece);
                }
            }
        }


        return o;
    }

}