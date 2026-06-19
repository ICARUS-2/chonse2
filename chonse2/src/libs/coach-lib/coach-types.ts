import { Arrow } from "../../app/chessboard/chessboard/arrow";

export class CoachIdea 
{
    arrows: Array<Arrow> = [];
    highlightedSquares: Array<string> = [];
}

export enum CoachMoveSequenceType
{
    None = "None",
    FollowUp = "FollowUp",
    MissedOpportunity = "MissedOpportunity"
}

export enum CoachMoveFlagType 
{
    //Bad
    LeftPieceHanging,
    MissedHangingPiece,
    CapturedPieceWithWrongAttacker,
    AllowedCheckmate,
    MissedCheckmate,
    AllowedFork,
    AllowedSkewer,
    MissedFork,
    MissedPin,
    IgnoredPin,
    CausedMaterialLoss,

    //Good (show follow up)
    OpportunityToCheckmate,
    OpportunityToSkewer,
    OpportunityToFork,
}

export enum CoachIdeaFlagType
{
    ForkIdea,
    PinIdea,
    CentralControlIdea,
    DevelopmentIdea,
    FianchettoIdea
}

export enum CoachResourceFlagType 
{
    Opening
}