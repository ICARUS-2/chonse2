
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
  None = "none"
}

export const moveClassificationLabels: Record<MoveClassification, string> = {
  [MoveClassification.None] : "null",
  [MoveClassification.Opening]: "an opening move",
  [MoveClassification.Forced]: "forced",
  [MoveClassification.Splendid]: "LUMINOUS 🌕!!!",
  [MoveClassification.Perfect]: "the only good move !",
  [MoveClassification.Best]: "the best move",
  [MoveClassification.Excellent]: "excellent",
  [MoveClassification.Okay]: "an okay move",
  [MoveClassification.Inaccuracy]: "an inaccuracy",
  [MoveClassification.Mistake]: "a mistake",
  [MoveClassification.Blunder]: "a blunder",
};

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