import { Arrow } from "../../app/chessboard/chessboard/arrow";
import CoachText from "./coach-text";

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

    //Neutral
    //Flag used to prevent false positives in material losses. Say, if someone moved their king to safety the wrong way in a queen fork, don't give them shit for blundering their queen.
    InevitablyHungPiece, 

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
    OnRoadToCheckmate,

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
    Pin,
    Outpost
}

export class CoachSentence {
    public textTemplate: string;
    public audioTemplate: string;

    constructor(textTemplate: string, audioTemplate: string) {
        this.textTemplate = textTemplate;
        this.audioTemplate = audioTemplate;
    }

    public format(playerColor: string, pieceText: string, secondaryPieceText: string): FormattedCoachSentence 
    {
        //format text.
        const formattedText = this.textTemplate
            .replace(CoachText.TURN_PLACEHOLDER, playerColor)
            .replace(CoachText.PIECE_PLACEHOLDER, pieceText)
            .replace(CoachText.SECONDARY_PIECE_PLACEHOLDER, secondaryPieceText);

        //format audio path
        const safeColor = playerColor.toLowerCase();
        const safePiece = pieceText.toLowerCase().replace(/\s+/g, '_');
        const safeSecondaryPiece = secondaryPieceText.toLowerCase().replace(/\s+/g, '_');
        
        const formattedAudioPath = this.audioTemplate
            .replace(CoachText.TURN_PLACEHOLDER, safeColor)
            .replace(CoachText.PIECE_PLACEHOLDER, safePiece)
            .replace(CoachText.SECONDARY_PIECE_PLACEHOLDER, safeSecondaryPiece);

        return { text: formattedText, audioPath: formattedAudioPath };
    }
}

export interface FormattedCoachSentence 
{
    text: string;
    audioPath: string;
}
