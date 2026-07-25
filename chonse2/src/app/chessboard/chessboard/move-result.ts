import { PieceType } from "../../../libs/chonse2-lib/piece-type";
import { CoachIdea, CoachIdeaFlagType, CoachMoveFlagType, CoachResourceFlagType, FormattedCoachSentence } from "../../../libs/coach-lib/coach-types";

//Object designed to hold move data as well as coach stuff.
export default class MoveResult implements IMoveResult
{
    result: boolean = false;
    notation: string = "";
    notationMinimal: string = "";
    fromCoord: string = "";
    toCoord: string = "";
    promotion: string = "";
    piece: string = PieceType.NONE;
    pgnComment: string = "";

    coachSentences: Array<FormattedCoachSentence> = [];
    coachMoveFlags: Array<CoachMoveFlagType> = [];
    coachIdeas: Map<CoachIdeaFlagType, CoachIdea> = new Map<CoachIdeaFlagType, CoachIdea>();
    coachResources: Map<CoachResourceFlagType, string> = new Map<CoachResourceFlagType, string>();
    isCoachMove: boolean = false;

    //Exists because the Chonse2 library alone should not be returning anything more complex than the base IMoveResult, 
    //but the chessboard needs something a bit more complex for coach interactions and whatnot.
    static createMoveResultFromInterface(obj: IMoveResult): MoveResult
    {
        const val = new MoveResult();

        val.result = obj.result;
        val.notation = obj.notation;
        val.notationMinimal = obj.notationMinimal;
        val.fromCoord = obj.fromCoord;
        val.toCoord = obj.toCoord;
        val.promotion = obj.promotion;
        val.piece = obj.piece;
        val.pgnComment = obj.piece;

        return val;
    }

    getUci()
    {
        return this.fromCoord + this.toCoord + this.promotion.toLowerCase();
    }
}