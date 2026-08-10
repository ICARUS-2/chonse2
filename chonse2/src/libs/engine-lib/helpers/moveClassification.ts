//Simplified move classification code adapted from https://github.com/GuillaumeSD/Chesskit/pull/93

import { openings } from "../data/openings";
import { MoveClassification } from "../types/enums";
import { PositionEval } from "../types/eval";
import { isHangingPieceCapture, uciMoveParams } from "./chessHelper";
import LuminousDetector from "./luminous";
import { getLineWinPercentage, getPositionWinPercentage } from "./winPercentage";

export const BLUNDER_THRESHOLD = -20;
export const MISTAKE_THRESHOLD = -10;
export const INACCURACY_THRESHOLD = -5;
export const EXCELLENT_THRESHOLD = -2;
export const ALTERNATIVES_COLLAPSE_SIGNIFICATLY_WIN_PERCENTAGE_CHANGE = 10;

export const getMovesClassification = (
  rawPositions: PositionEval[],
  uciMoves: string[],
  fens: string[]
): PositionEval[] => {
  const positionsWinPercentage = rawPositions.map(getPositionWinPercentage);
  let currentOpening: string | undefined = undefined;

  const positions = rawPositions.map((rawPosition, index) => {
    if (index === 0) return rawPosition;

    const currentFen = fens[index].split(" ")[0];

    //Book move: known opening position
    const opening = openings.find((opening) => opening.fen === currentFen);
    if (opening) {
      currentOpening = opening.name;
      return {
        ...rawPosition,
        opening: opening.name,
        moveClassification: MoveClassification.Opening,
      };
    }

    const sideToMove = fens[index - 1].split(" ")[1];
    const isWhiteMove = sideToMove === "w";
    const playedMove = uciMoves[index - 1];
    const prevPosition = rawPositions[index - 1];
    const alternativeLine = prevPosition.lines.find((line) => line.pv[0] !== playedMove);
    
    //Forced move: only one legal response available
    if (!alternativeLine) {
      return {
        ...rawPosition,
        opening: currentOpening,
        moveClassification: MoveClassification.Forced,
      };
    }

    const lastWinPct = positionsWinPercentage[index - 1];
    const currentWinPct = positionsWinPercentage[index];
    const winPctChange = (currentWinPct - lastWinPct) * (isWhiteMove ? 1 : -1);
    const alternativeWinPct = getLineWinPercentage(alternativeLine);
    const alternativeWinPctChange = (alternativeWinPct - lastWinPct) * (isWhiteMove ? 1 : -1);

    //Miss: You could have picked up a hanging piece but failed to do so
    if (isHangingPieceCapture(fens[index - 1], alternativeLine.pv[0]) && winPctChange < MISTAKE_THRESHOLD) {
      return {
        ...rawPosition,
        opening: currentOpening,
        moveClassification: MoveClassification.Miss,
      };
    }

    //Luminous: If move was a good sacrifice.
    if (LuminousDetector.isMoveLuminousSacrifice(fens[index - 1], fens[index], prevPosition.lines, rawPosition.lines, lastWinPct, currentWinPct, uciMoveParams(playedMove)))
    {
      return {
      ...rawPosition,
      opening: currentOpening,
      moveClassification: MoveClassification.Luminous,
      };
    }

    if (playedMove === prevPosition.bestMove) {
      const alternativesCollapseSignificantly = alternativeWinPctChange < winPctChange - ALTERNATIVES_COLLAPSE_SIGNIFICATLY_WIN_PERCENTAGE_CHANGE;
      const hangingPieceCapture = isHangingPieceCapture(fens[index - 1], playedMove);

      //Best: Not necessarily a "perfect" move or a brilliant sacrifice.
      if (hangingPieceCapture || !alternativesCollapseSignificantly) {
        return {
          ...rawPosition,
          opening: currentOpening,
          moveClassification: MoveClassification.Best,
        };
      }

      //Perfect: The move played is the only good move (alternatives collapse significantly)
      return {
        ...rawPosition,
        opening: currentOpening,
        moveClassification: MoveClassification.Perfect,
      };
    }

    //regular classifications
    return {
      ...rawPosition,
      opening: currentOpening,
      moveClassification: classifyByWinPctChange(winPctChange),
    };
  });

  return positions;
};

export const classifyByWinPctChange = (winPctChange: number): MoveClassification => {
  if (winPctChange < BLUNDER_THRESHOLD) return MoveClassification.Blunder;
  if (winPctChange < MISTAKE_THRESHOLD) return MoveClassification.Mistake;
  if (winPctChange < INACCURACY_THRESHOLD) return MoveClassification.Inaccuracy;
  if (winPctChange < EXCELLENT_THRESHOLD) return MoveClassification.Okay;
  return MoveClassification.Excellent;
};

export function concatenateUciParams(uciParamsMove: {from: string; to: string; promotion?: string | undefined;})
{
  return uciParamsMove.from + uciParamsMove.to + (uciParamsMove.promotion == undefined ? "" : uciParamsMove.promotion);
}