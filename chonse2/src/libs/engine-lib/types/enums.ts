
export enum MoveClassification 
{
  Luminous = "luminous",
  Perfect = "perfect",
  Best = "best",
  Excellent = "excellent",
  Okay = "okay",
  Inaccuracy = "inaccuracy",
  Mistake = "mistake",
  Blunder = "blunder",
  Miss = "miss",
  Opening = "opening",
  Forced = "forced",
  None = "none"
}

export const moveClassificationLabels: Record<MoveClassification, string> = {
  [MoveClassification.None] : "null",
  [MoveClassification.Opening]: "a book move",
  [MoveClassification.Forced]: "forced",
  [MoveClassification.Luminous]: "LUMINOUS 🌕!!!",
  [MoveClassification.Perfect]: "the only good move",
  [MoveClassification.Best]: "the best move",
  [MoveClassification.Excellent]: "excellent",
  [MoveClassification.Okay]: "okay",
  [MoveClassification.Inaccuracy]: "an inaccuracy",
  [MoveClassification.Mistake]: "a mistake",
  [MoveClassification.Miss]: "a miss",
  [MoveClassification.Blunder]: "a blunder",
};

export enum EngineName {
  Stockfish18="stockfish_18",
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
    //SF18
    [
      EngineName.Stockfish18,
      {
        displayName: "Stockfish 18",
        type: EngineType.NNUE,
        sizeMb: 108,
        additionalText: "Strongest",
      }
    ],

    //SF18 Lite
    [EngineName.Stockfish18Lite, 
      {
        displayName: "Stockfish 18 Lite", 
        type: EngineType.NNUE, 
        sizeMb: 7,
        additionalText: "Default",
      }
    ],

    //SF17.1
    [EngineName.Stockfish17_1, 
      {
        displayName: "Stockfish 17.1", 
        type: EngineType.NNUE, 
        sizeMb: 77
      }
    ],
    
    //SF17.1 Lite
    [EngineName.Stockfish17_1Lite, 
      {
        displayName: "Stockfish 17.1 Lite", 
        type: EngineType.NNUE, 
        sizeMb: 7,
      }
    ],
    
    //SF11 HCE
    [EngineName.Stockfish11, 
      {
        displayName: "Stockfish 11", 
        type: EngineType.HCE, 
        sizeMb: 1.3,
        additionalText: "Legacy"
      }
    ]
  ]
)

export interface EngineInfo
{
  type: EngineType,
  displayName: string,
  sizeMb: number
  additionalText?: string
}