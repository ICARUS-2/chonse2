export class GameState
{
    isGameOver: boolean = false;
    reason: GameOverReason = GameOverReason.None;
    winner: string = "";
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