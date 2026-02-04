export class GameState
{
    isGameOver: boolean = false;
    reason: GameOverReason = GameOverReason.None;
    winner: string = "";

    isDraw(): boolean
    {
        return this.reason == GameOverReason.Stalemate 
        || this.reason == GameOverReason.InsufficientMaterial 
        || this.reason == GameOverReason.FiftyMoveNoPawnMovementsOrCaptures 
        || this.reason == GameOverReason.ThreefoldRepetition;
    }
}

export enum GameOverReason
{
    None = "None",
    Checkmate = "Checkmate",
    Stalemate = "Stalemate",
    InsufficientMaterial = "Insufficient Material",
    FiftyMoveNoPawnMovementsOrCaptures = "50-move rule",
    ThreefoldRepetition = "Threefold repetition"
}