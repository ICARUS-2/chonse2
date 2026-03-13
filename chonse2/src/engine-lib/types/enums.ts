
export enum MoveClassification 
{
  Splendid = "luminous",
  Perfect = "perfect",
  Best = "best",
  Excellent = "excellent",
  Okay = "okay",
  Inaccuracy = "inaccuracy",
  Mistake = "mistake",
  Blunder = "blunder",
  Opening = "opening",
  Forced = "forced",
  None = "none"
}

export const moveClassificationLabels: Record<MoveClassification, string> = {
  [MoveClassification.None] : "null",
  [MoveClassification.Opening]: "an opening move",
  [MoveClassification.Forced]: "forced",
  [MoveClassification.Splendid]: "LUMINOUS 🌕!!!",
  [MoveClassification.Perfect]: "the only good move",
  [MoveClassification.Best]: "the best move",
  [MoveClassification.Excellent]: "excellent",
  [MoveClassification.Okay]: "an okay move",
  [MoveClassification.Inaccuracy]: "an inaccuracy",
  [MoveClassification.Mistake]: "a mistake",
  [MoveClassification.Blunder]: "a blunder",
};

export enum EngineName {
  //Stockfish18="stockfish_18",
  Stockfish18Lite="stockfish_18lite",
  Stockfish17_1="stockfish_17_1",
  Stockfish17_1Lite="stockfish_17_1lite",
  Stockfish11 = "stockfish_11",
}

export const EngineDisplayName: Map<EngineName, string> = new Map<EngineName, string>
(
  [
    //[EngineName.Stockfish18, "Stockfish 18"],
    [EngineName.Stockfish18Lite, "Stockfish 18 Lite"],
    [EngineName.Stockfish17_1, "Stockfish 17.1"],
    [EngineName.Stockfish17_1Lite, "Stockfish 17.1 Lite"],
    [EngineName.Stockfish11, "Stockfish 11 HCE"]
  ] 
)