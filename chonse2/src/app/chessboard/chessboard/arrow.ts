export interface Arrow {
  fromFile: number; // 0–7
  fromRank: number; // 0–7
  toFile: number;
  toRank: number;
  color: string;
  context: ArrowContext
}

export enum ArrowContext
{
  Player,
  Engine
}