
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

export enum EngineType  
{
  NNUE = "NNUE",
  HCE = "HCE"
}

export const EngineInformation: Map<EngineName, EngineInfo> = new Map<EngineName, EngineInfo>
(
  [
    [EngineName.Stockfish18Lite, {displayName: "Stockfish 18 Lite", type: EngineType.NNUE, sizeMb: 7}],
    [EngineName.Stockfish17_1, {displayName: "Stockfish 17.1", type: EngineType.NNUE, sizeMb: 75}],
    [EngineName.Stockfish17_1Lite, {displayName: "Stockfish 17.1 Lite", type: EngineType.NNUE, sizeMb: 7}],
    [EngineName.Stockfish11, {displayName: "Stockfish 11", type: EngineType.HCE, sizeMb: 1.3}]
  ]
)

export interface EngineInfo
{
  type: EngineType,
  displayName: string,
  sizeMb: number
}