import { LineEval, PositionEval } from "../types/eval";
import {
  getLineWinPercentage,
  getPositionWinPercentage,
} from "./winPercentage";
import { MoveClassification } from "../types/enums";
import { openings } from "../data/openings";
import { getIsPieceSacrifice, isHangingPieceCapture, isSimplePieceRecapture, uciMoveParams2 } from "../helpers/chessHelper";

const BLUNDER_THRESHOLD = -20;
const MISTAKE_THRESHOLD = -10;
const INACCURACY_THRESHOLD = -5;
const EXCELLENT_THRESHOLD = -2;


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
    const opening = openings.find((opening) => opening.fen === currentFen);
    if (opening) {
      currentOpening = opening.name;
      return {
        ...rawPosition,
        opening: opening.name,
        moveClassification: MoveClassification.Opening,
      };
    }

    const playedMove = uciMoves[index - 1];
    const prevPosition = rawPositions[index - 1];
    const alternativeLine = prevPosition.lines.find((line) => line.pv[0] !== playedMove);

    if (prevPosition.lines.length === 1 || !alternativeLine) {
      return {
        ...rawPosition,
        opening: currentOpening,
        moveClassification: MoveClassification.Forced,
      };
    }


    const lastPositionAlternativeLine: LineEval | undefined =
      prevPosition.lines.filter((line) => line.pv[0] !== playedMove)?.[0];
    const lastPositionAlternativeLineWinPercentage = lastPositionAlternativeLine
      ? getLineWinPercentage(lastPositionAlternativeLine)
      : undefined;

    const sideToMove = fens[index - 1].split(" ")[1];
    const isWhiteMove = sideToMove === "w";
    const lastWinPct = positionsWinPercentage[index - 1];
    const currentWinPct = positionsWinPercentage[index];
    const winPctChange = (currentWinPct - lastWinPct) * (isWhiteMove ? 1 : -1);
    const alternativeWinPct = getLineWinPercentage(alternativeLine);
    const alternativeWinPctChange = (alternativeWinPct - lastWinPct) * (isWhiteMove ? 1 : -1);

    //Added because my chonse2 library outputs moves in SAN, this converts it to UCI.
    const normalizedPlayedMove = uciMoveParams2(playedMove, isWhiteMove ? "w" : "b");
    const normalizedPlayedMoveAsString = normalizedPlayedMove.from + normalizedPlayedMove.to + (normalizedPlayedMove.promotion == undefined ? "" : normalizedPlayedMove.promotion);


    console.log(`Played move: ${playedMove} -- Best move: ${prevPosition.bestMove} -- Normalized played move: ${normalizedPlayedMoveAsString}`)

    if (playedMove === prevPosition.bestMove || normalizedPlayedMoveAsString === prevPosition.bestMove) {
      const alternativesCollapseSignificantly = alternativeWinPctChange < winPctChange - 10;
      const hangingPieceCapture = isHangingPieceCapture(fens[index - 1], normalizedPlayedMoveAsString);
      // Sometimes close to checkmate winPctChange becomes a bad metric, so we also use:
      const alternativeIsUselessSacrifice =
        getIsPieceSacrifice(fens[index - 1], alternativeLine.pv[0], alternativeLine.pv.slice(1)) &&
        alternativeWinPctChange < BLUNDER_THRESHOLD;

      // Best: The move played is the engine's top choice, but not necessarily a brilliant move
      if (hangingPieceCapture || !alternativesCollapseSignificantly || alternativeIsUselessSacrifice) {
        return {
          ...rawPosition,
          opening: currentOpening,
          moveClassification: MoveClassification.Best,
        };
      }


      // Brilliant: The move played involves a piece sacrifice and is the only good move (alternatives collapse significantly)
      if (getIsPieceSacrifice(fens[index - 1], normalizedPlayedMoveAsString, rawPosition.lines[0].pv)) {
        return {
          ...rawPosition,
          opening: currentOpening,
          moveClassification: MoveClassification.Splendid,
        };
      }

      // Great: The move played is the only good move (alternatives collapse significantly)
      return {
        ...rawPosition,
        opening: currentOpening,
        moveClassification: MoveClassification.Perfect,
      };
    }

    // Standard classifications
    return {
      ...rawPosition,
      opening: currentOpening,
      moveClassification: classifyByWinPctChange(winPctChange),
    };
  });

  return positions;
};

const classifyByWinPctChange = (winPctChange: number): MoveClassification => {
  if (winPctChange < BLUNDER_THRESHOLD) return MoveClassification.Blunder;
  if (winPctChange < MISTAKE_THRESHOLD) return MoveClassification.Mistake;
  if (winPctChange < INACCURACY_THRESHOLD) return MoveClassification.Inaccuracy;
  if (winPctChange < EXCELLENT_THRESHOLD) return MoveClassification.Okay;
  return MoveClassification.Excellent;
};


