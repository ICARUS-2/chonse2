import { PieceType } from "../chonse2-lib/piece-type";

export class CoachUtils
{
    static readonly COACH_MOVE_DELIMITER = "*"

    static convertUciToChonse2Move(uci: string) : {fromSquare: string, toSquare: string, promotion: string}
    {
        const fromSquare = uci[0] + uci[1];
        const toSquare = uci[2] + uci[3];
        const promotion = uci[4] ? uci[4].toUpperCase() : PieceType.QUEEN;

        return {fromSquare, toSquare, promotion};
    }
}

export enum CoachMoveSequenceType
{
    None = "None",
    FollowUp = "FollowUp",
    MissedOpportunity = "MissedOpportunity"
}