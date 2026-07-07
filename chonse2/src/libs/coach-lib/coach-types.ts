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
    MissedSkewer,
    MissedCastle,
    MissedDevelopment,
    WrongDevelopment,
    MissedRookOpenFile,
    MissedForcedPawnDoubling,
    MissedPawnChainAttack,
    WrongPawnChainAttack,
    WrongHangingPieceMove,
    WrongHangingPieceDefence,
    MissedForcedLossOfCastlingRights,
    MissedDiscoveredCheck,
    MissedDoubleCheck,
    WrongDiscoveredCheck,
    MissedOutpost,
    WrongOutpost,
    MissedStrikeInCenterWithPawn,
    WeakenedKingWithPawnMove,
    CreatedPassedPawnForOpponent,
    BlockedBishop,
    DisconnectedRooks,
    MissedConnectedRooks,


    //Good (show follow up)
    OpportunityToCheckmate,
    OpportunityToSkewer,
    ForkedPiece,
    Castled,
    ClearedWayToCastle,
    ForcedLossOfCastlingRights,
    UsedDiscoveredCheck,
    UsedDoubleCheck,
    KickedPieceWithPawn,
    TookOutpostWithKnight,
    BlockingCastling,
    MovedHangingPiece,
    DefendedHangingPiece,
    AttackedPawnChain,
    IsolatedOpponentPawn,
    SatPieceOnPromotionSquare,
    CreatedPassedPawnForThemselves,
    ForcedDoublingOfPawns,
    TookOpenFileWithRook,
    ConnectedRooks,
    FoundPin,
    FoundMate,
    OnRoadToCheckmate

}

export enum CoachIdeaFlagType
{
    ForkIdea,
    PinIdea,
    CentralControlIdea,
    DevelopmentIdea,
    FianchettoIdea,
    SkewerIdea,
    PassedPawnIdea,
    IsolatedPawnIdea
}

export enum CoachResourceFlagType 
{
    Opening,
    Skewer,
    Pin
}