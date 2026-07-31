import { ChessConstants } from "../../../libs/chess-game-lib/types/constants";


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
  Engine,
  Coach
}

export class ArrowColors 
{
  static readonly FUTURE_BEST_MOVE = "rgba(0, 183, 255, 0.6)";
  static readonly PAST_BEST_MOVE = "rgba(0,128,0,0.6)";
  static readonly IDEA = "cyan";
  static readonly PLAYER_DRAWN_DEFAULT = "rgba(0,0,255,0.6)"
}

export function createArrow(fromCoordinate: string, toCoordinate: string, color: string = ArrowColors.PLAYER_DRAWN_DEFAULT, context: ArrowContext = ArrowContext.Player) : Arrow | null
{
  //Cannot create an arrow from or to a nonextistant place.
  if (!fromCoordinate || !toCoordinate)
  {
    return null;
  }

  //Cannot create an arrow from -> to the same square
  if (fromCoordinate == toCoordinate)
  {
    return null;
  }

  //Get the indeces and create the arrow from that.
  const fromIdx = ChessConstants.findIndexFromCoordinate(fromCoordinate);
  const toIdx = ChessConstants.findIndexFromCoordinate(toCoordinate);

  return { 
    fromRank: fromIdx.rowIndex, 
    fromFile: fromIdx.colIndex, 
    toRank: toIdx.rowIndex, 
    toFile: toIdx.colIndex, 
    color: color,
    context: context}
}