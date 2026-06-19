import Chonse2 from "../chonse2-lib/chonse2";
import { PieceType } from "../chonse2-lib/piece-type";
import { LineEval } from "../engine-lib/types/eval";

export default class CoachMiscHelpers 
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

    //Converts a UCI move to the format in which it can be used to move in the Chonse2 library.
    public static convertUciToChonse2Move(uci: string) : {fromSquare: string, toSquare: string, promotion: string}
    {
        const fromSquare = uci[0] + uci[1];
        const toSquare = uci[2] + uci[3];
        const promotion = uci[4] ? uci[4].toUpperCase() : PieceType.QUEEN;

        return {fromSquare, toSquare, promotion};
    }
    


}