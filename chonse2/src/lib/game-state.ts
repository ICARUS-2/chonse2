export class GameState
{
    isGameOver: boolean = false;
    reason: GameOverReason = GameOverReason.None;
    winner: string = "";
    gameScore: string = GameScore.IN_PROGRESS;

    isDraw(): boolean
    {
        return this.reason == GameOverReason.Stalemate 
        || this.reason == GameOverReason.InsufficientMaterial 
        || this.reason == GameOverReason.FiftyMoveNoPawnMovementsOrCaptures 
        || this.reason == GameOverReason.ThreefoldRepetition;
    }
}

export class GameScore
{
    static readonly WHITE_WON = "1-0";
    static readonly BLACK_WON = "0-1";
    static readonly DRAW = "1/2-1/2";
    static readonly IN_PROGRESS = "*";
}

export enum GameOverReason
{
    None = "None",
    Unknown = "Unknown",

    //Guaranteed endgame
    Checkmate = "Checkmate",
    Stalemate = "Stalemate",
    InsufficientMaterial = "Insufficient Material",
    FiftyMoveNoPawnMovementsOrCaptures = "50-move rule",
    ThreefoldRepetition = "Threefold repetition",

    //Preliminary endgame.
    Resignation = "Resignation",
    Timeout = "Timeout",
    Abandon = "Abandon",
    TimeVsInsufficient = "Timeout vs insufficient material",
    DrawAgreed = "Agreement"
}