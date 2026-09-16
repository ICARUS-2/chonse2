
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

export enum EngineName {
  Stockfish19="stockfish_19",
  Stockfish19Lite="stockfish_19lite",
  Stockfish18="stockfish_18",
  Stockfish18Lite="stockfish_18lite",
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
    //SF19
    [
      EngineName.Stockfish19,
      {
        displayName: "Stockfish 19",
        displayNameSmall: "SF19",
        type: EngineType.NNUE,
        sizeMb: 95,
        additionalText: "Strongest",
      }
    ],

    //SF19 Lite
    [EngineName.Stockfish19Lite, 
      {
        displayName: "Stockfish 19 Lite", 
        displayNameSmall: "SF19L",
        type: EngineType.NNUE, 
        sizeMb: 2,
        additionalText: "Default",
      }
    ],

    //SF18
    [
      EngineName.Stockfish18,
      {
        displayName: "Stockfish 18",
        displayNameSmall: "SF18",
        type: EngineType.NNUE,
        sizeMb: 108,
        additionalText: "",
      }
    ],

    //SF18 Lite
    [EngineName.Stockfish18Lite, 
      {
        displayName: "Stockfish 18 Lite", 
        displayNameSmall: "SF18L",
        type: EngineType.NNUE, 
        sizeMb: 7,
        additionalText: "",
      }
    ],
    
    //SF11 HCE
    [EngineName.Stockfish11, 
      {
        displayName: "Stockfish 11", 
        displayNameSmall: "SF11",
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
  displayNameSmall: string
  sizeMb: number
  additionalText?: string
}