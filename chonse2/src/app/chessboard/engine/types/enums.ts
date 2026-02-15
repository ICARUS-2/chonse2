
export enum MoveClassification 
{
  Blunder = "blunder",
  Mistake = "mistake",
  Inaccuracy = "inaccuracy",
  Okay = "okay",
  Excellent = "excellent",
  Best = "best",
  Forced = "forced",
  Opening = "opening",
  Perfect = "perfect",
  Splendid = "luminous",
}

export enum EngineName {
  Stockfish18Lite="stockfish_18_lite",
  Stockfish17_1="stockfish_17_1",
  Stockfish11 = "stockfish_11",
}

export const EngineDisplayName: Map<EngineName, string> = new Map<EngineName, string>
(
  [
    [EngineName.Stockfish18Lite, "Stockfish 18 Lite"],
    [EngineName.Stockfish17_1, "Stockfish 17.1"],
    [EngineName.Stockfish11, "Stockfish 11 HCE"]
  ] 
)