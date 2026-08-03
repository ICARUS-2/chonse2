import { EvaluateGameParams, LineEval, PositionEval } from "../types/eval";
import { Chess, PieceSymbol, Square } from "../helpers/chess";
import { getPositionWinPercentage } from "../helpers/winPercentage";
import { GameScore } from "../../chess-game-lib/types/game-state";
import ChessGameFactory from "../../chess-game-lib/chess-game-factory";
import BoardScanner from "../../chess-game-lib/helpers/board-scanner";

export const getEvaluateGameParams = (game: Chess): EvaluateGameParams => {
  const history = game.history({ verbose: true });

  const fens = history.map((move) => move.before);
  fens.push(history[history.length - 1].after);

  const uciMoves = history.map(
    (move: any) => move.from + move.to + (move.promotion || "")
  );

  return { fens, uciMoves };
};

export const moveLineUciToSan = (
  fen: string
): ((moveUci: string) => string) => {
  const game = new Chess(fen);

  return (moveUci: string): string => {
    try {
      const move = game.move(uciMoveParams(moveUci));
      return move.san;
    } catch {
      return moveUci;
    }
  };
};

export const getEvaluationBarValue = (
  position: PositionEval
): { whiteBarPercentage: number; label: string } => {
  const whiteBarPercentage = getPositionWinPercentage(position);
  const bestLine = position.lines[0];

  if (bestLine.mate) {
    return { label: `M${Math.abs(bestLine.mate)}`, whiteBarPercentage };
  }

  const cp = bestLine.cp;
  if (!cp) return { whiteBarPercentage, label: "0.0" };

  const pEval = Math.abs(cp) / 100;
  let label = pEval.toFixed(1);

  if (label.toString().length > 3) {
    label = pEval.toFixed(0);
  }

  return { whiteBarPercentage, label };
};

//Redesigned to account for score.
export const getEvaluationBarValue2 = (
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
  const game = new Chess(fen);
  return game.isStalemate();
};

export const getWhoIsCheckmated = (fen: string): "w" | "b" | null => {
  const game = new Chess(fen);
  if (!game.isCheckmate()) return null;
  return game.turn();
};

export const uciMoveParams = (
  uciMove: string
): {
  from: Square;
  to: Square;
  promotion?: string | undefined;
} => ({
  from: uciMove.slice(0, 2) as Square,
  to: uciMove.slice(2, 4) as Square,
  promotion: uciMove.slice(4, 5) || undefined,
});

export const getMaterialDifference = (fen: string): number => {
  const game = new Chess(fen);
  const board = game.board().flat();

  return board.reduce((acc: any, square: any) => {
    if (!square) return acc;
    const piece = square.type;

    if (square.color === "w") {
      return acc + getPieceValue(piece);
    }

    return acc - getPieceValue(piece);
  }, 0);
};

const getPieceValue = (piece: PieceSymbol): number => {
  switch (piece) {
    case "p":
      return 1;
    case "n":
      return 3;
    case "b":
      return 3;
    case "r":
      return 5;
    case "q":
      return 9;
    default:
      return 0;
  }
};

export const isCheck = (fen: string): boolean => {
  const game = new Chess(fen);
  return game.inCheck();
};

export const getLineEvalLabel = (
  line: Pick<LineEval, "cp" | "mate">
): string => {
  if (line.cp !== undefined) {
    return `${line.cp > 0 ? "+" : ""}${(line.cp / 100).toFixed(2)}`;
  }

  if (line.mate) {
    return `${line.mate > 0 ? "+" : "-"}M${Math.abs(line.mate)}`;
  }

  return "?";
};

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


export function normalizeLichessMove(move: string, chess: Chess) {
    const from = move.slice(0, 2);
    const to = move.slice(2, 4);
    const promotion = move.length > 4 ? move[4] : "";

    const piece = chess.get(from as Square);
    const target = chess.get(to as Square);

    if (!move.includes("e1h1") && !move.includes("e1a1") && !move.includes("e8h8") && !move.includes("e8a8"))
    {
      return from + to + promotion;
    }

    if (
        piece?.type === "k" &&
        target?.type === "r" &&
        piece.color === target.color
    ) {
        if (from === "e1" && to === "h1") return "e1g1"
        if (from === "e1" && to === "a1") return "e1c1"
        if (from === "e8" && to === "h8") return "e8g8"
        if (from === "e8" && to === "a8") return "e8c8"
    }

    return from+to+promotion;
}

// Also counting pieces of higher value that can be taken with a lower value piece as hanging
// e.g. a rook threatened by a pawn is considered hanging
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