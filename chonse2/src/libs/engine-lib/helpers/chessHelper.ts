import { PositionEval } from "../types/eval";
import { getPositionWinPercentage } from "../helpers/winPercentage";
import { GameOverReason, GameScore } from "../../chess-game-lib/types/game-state";
import ChessGameFactory from "../../chess-game-lib/chess-game-factory";
import BoardScanner from "../../chess-game-lib/helpers/board-scanner";
import { PieceColor } from "../../chess-game-lib/types/piece-color";

//Redesigned to account for score.
export const getEvaluationBarValue = (
  position: PositionEval,
  gameScore: GameScore
): { whiteBarPercentage: number; label: string } => {

  if (gameScore == GameScore.WHITE_WON)
  {
    return {whiteBarPercentage: 100, label: GameScore.WHITE_WON};
  }

  if (gameScore == GameScore.BLACK_WON)
  {
    return {whiteBarPercentage: 0, label: GameScore.BLACK_WON};
  }

  if (gameScore == GameScore.DRAW)
  {
    return {whiteBarPercentage: 50, label: GameScore.DRAW};
  }
  
  const bestLine = position.lines[0];
  if (!bestLine)
  {
    return { whiteBarPercentage: 40, label: "0.0" }
  }

  const whiteBarPercentage = getPositionWinPercentage(position);

  if (bestLine.mate) 
  {
    return { label: `M${Math.abs(bestLine.mate)}`, whiteBarPercentage };
  }

  const cp = bestLine.cp;
  if (!cp) return { whiteBarPercentage, label: "0.0" };

  const pEval = Math.abs(cp) / 100;
  let label = pEval.toFixed(1);

  if (label.toString().length > 3) 
  {
    label = pEval.toFixed(0);
  }

  return { whiteBarPercentage, label };
};

export const getIsStalemate = (fen: string): boolean => {
  const inst = ChessGameFactory.createFromFen(fen);
  return inst.getGameState().reason == GameOverReason.Stalemate
};

export const getWhoIsCheckmated = (fen: string): "w" | "b" | null => {
  const inst = ChessGameFactory.createFromFen(fen);
  const gameState = inst.getGameState();

  if (gameState.reason != GameOverReason.Checkmate)
  {
    return null;
  }

  if (gameState.winner == PieceColor.WHITE)
  {
    return "b";
  }

  if (gameState.winner == PieceColor.BLACK)
  {
    return "w";
  }
  
  return null;
};

export const uciMoveParams = (
  uciMove: string
): {
  from: string;
  to: string;
  promotion?: string | undefined;
} => ({
  from: uciMove.slice(0, 2),
  to: uciMove.slice(2, 4),
  promotion: uciMove.slice(4, 5) || undefined,
});

export const formatUciPv = (fen: string, uciMoves: string[]): string[] => {
  const castlingRights = fen.split(" ")[2];

  let canWhiteCastleKingSide = castlingRights.includes("K");
  let canWhiteCastleQueenSide = castlingRights.includes("Q");
  let canBlackCastleKingSide = castlingRights.includes("k");
  let canBlackCastleQueenSide = castlingRights.includes("q");

  return uciMoves.map((uci) => {
    if (uci === "e1h1" && canWhiteCastleKingSide) {
      canWhiteCastleKingSide = false;
      return "e1g1";
    }
    if (uci === "e1a1" && canWhiteCastleQueenSide) {
      canWhiteCastleQueenSide = false;
      return "e1c1";
    }

    if (uci === "e8h8" && canBlackCastleKingSide) {
      canBlackCastleKingSide = false;
      return "e8g8";
    }
    if (uci === "e8a8" && canBlackCastleQueenSide) {
      canBlackCastleQueenSide = false;
      return "e8c8";
    }

    return uci;
  });
};

//Also counting pieces of higher value that can be taken with a lower value piece as hanging
//e.g. a rook threatened by a pawn is considered hanging
export const isHangingPieceCapture = (
  fen: string,
  playedMove: string
): boolean => {
  const chess = ChessGameFactory.createFromFen(fen);

  //Get move to coord.
  const paramaterizedMove = uciMoveParams(playedMove);

  //Check if there's a piece to be captured.
  const capturedPiece = chess.findPieceAtCoordinate(paramaterizedMove.to);

  //If there was no piece to be captured, this isn't a hanging piece capture.
  if (!capturedPiece)
  {
    return false;
  }

  //If there was a piece, check if it was hanging.
  const doesSquareHaveHangingPiece = BoardScanner.doesSquareHaveHangingPiece(chess, paramaterizedMove.to);

  return doesSquareHaveHangingPiece;
};