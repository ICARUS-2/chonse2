import { EvaluateGameParams, LineEval, PositionEval } from "../types/eval";
//import { Game, Player } from "@/types/game";
import { Chess, Color, PieceSymbol, Square } from "../helpers/chess";
import { getPositionWinPercentage } from "../helpers/winPercentage";
//import { PieceColor } from "../../../../lib/piece-color";
import { PieceType } from "../../../../lib/piece-type";
import Chonse2 from "../../../../lib/chonse2";

type Piece = "wP" | "wB" | "wN" | "wR" | "wQ" | "wK" | "bP" | "bB" | "bN" | "bR" | "bQ" | "bK";

export const getEvaluateGameParams = (game: Chess): EvaluateGameParams => {
  const history = game.history({ verbose: true });

  const fens = history.map((move) => move.before);
  fens.push(history[history.length - 1].after);

  const uciMoves = history.map(
    (move: any) => move.from + move.to + (move.promotion || "")
  );

  return { fens, uciMoves };
};

/*
export const getGameFromPgn = (pgn: string): Chess => {
  const game = new Chess();
  game.loadPgn(pgn);

  return game;
};
*/
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

//CUSTOM WRITTEN FOR CHONSE2 LIBRARY
export const uciMoveParams2 = (uciMove: string, turn: Color): {from: Square; to: Square; promotion?: string | undefined;} => {
  if (uciMove == "O-O" || uciMove == "O-O+" || uciMove == "O-O#")
  {
    return turn ? {from: Chonse2.WHITE_KING_SQUARE, to: Chonse2.WHITE_KINGSIDE_KNIGHT_SQUARE} 
                : {from: Chonse2.BLACK_KING_SQUARE, to: Chonse2.BLACK_KINGSIDE_KNIGHT_SQUARE}
  }

  if (uciMove == "O-O-O" || uciMove == "O-O-O+" || uciMove == "O-O-O#")
  {
    return turn ? {from: Chonse2.WHITE_KING_SQUARE, to: Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE} 
                : {from: Chonse2.BLACK_KING_SQUARE, to: Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE}
  }
  
  if (uciMove.startsWith( PieceType.ROOK ) 
    || uciMove.startsWith(PieceType.KNIGHT) 
    || uciMove.startsWith(PieceType.BISHOP)
    || uciMove.startsWith(PieceType.QUEEN)
    || uciMove.startsWith(PieceType.KING))
    {
      uciMove = uciMove.slice(1);
    }

    if (uciMove.includes("x"))
    {
      uciMove = uciMove.replace("x", "");
    }

    if (uciMove.includes("+"))
    {
      uciMove = uciMove.replace("+", "");
    }

    if (uciMove.includes("#"))
    {
      uciMove = uciMove.replace("#", "");
    }

    const from = uciMove[0] + uciMove[1] as Square;
    const to = uciMove[2] + uciMove[3] as Square;
    let promotion = undefined;

    if (uciMove.includes("="))
    {
      const splitToPromotion = uciMove.split("=");
      promotion = splitToPromotion[1];
    }

    return {from, to, promotion};
}

export const isSimplePieceRecapture = (
  fen: string,
  uciMoves: [string, string]
): boolean => {
  const game = new Chess(fen);
  let turn: Color = game.turn();

  const moves: Array<{from: Square; to: Square; promotion?: string | undefined;}> = [];

  uciMoves.forEach( m =>
  {
    moves.push(uciMoveParams2(m, turn))

    if (turn == "w")
    {
      turn = "b";
    }

    if (turn == "b")
    {
      turn = "w";
    }
  }
   )

  //const moves = uciMoves.map((uciMove) => uciMoveParams2(uciMove));

  if (moves[0].to !== moves[1].to) return false;

  const piece = game.get(moves[0].to);
  if (piece) return true;

  return false;
};

export const getIsPieceSacrifice = (
  fen: string,
  playedMove: string,
  bestLinePvToPlay: string[]
): boolean => {
  if (!bestLinePvToPlay.length) return false;

  const game = new Chess(fen);
  const whiteToPlay = game.turn() === "w";
  const startingMaterialDifference = getMaterialDifference(fen);

  let moves = [playedMove, ...bestLinePvToPlay];
  if (moves.length % 2 === 1) {
    moves = moves.slice(0, -1);
  }
  let nonCapturingMovesTemp = 1;

  const capturedPieces: { w: PieceSymbol[]; b: PieceSymbol[] } = {
    w: [],
    b: [],
  };
  for (const move of moves) {
    try {
      const fullMove = game.move(uciMoveParams2(move, game.turn()));
      if (fullMove.captured) {
        //capturedPieces[fullMove.color].push(fullMove.captured);
        nonCapturingMovesTemp = 1;
      } else {
        nonCapturingMovesTemp--;
        if (nonCapturingMovesTemp < 0) break;
      }
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  for (const p of capturedPieces["w"].slice(0)) {
    if (capturedPieces["b"].includes(p)) {
      capturedPieces["b"].splice(capturedPieces["b"].indexOf(p), 1);
      capturedPieces["w"].splice(capturedPieces["w"].indexOf(p), 1);
    }
  }

  if (
    Math.abs(capturedPieces["w"].length - capturedPieces["b"].length) <= 1 &&
    capturedPieces["w"].concat(capturedPieces["b"]).every((p) => p === "p")
  ) {
    return false;
  }

  const endingMaterialDifference = getMaterialDifference(game.fen());

  const materialDiff = endingMaterialDifference - startingMaterialDifference;
  const materialDiffPlayerRelative = whiteToPlay ? materialDiff : -materialDiff;

  return materialDiffPlayerRelative < 0;
};

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

/*
export const getCapturedPieces = (
  fen: string,
  color: PieceColor
): {
  piece: string;
  count: number;
}[] => {
  const capturedPieces =
    color === Color.White
      ? [
          { piece: "p", count: 8 },
          { piece: "b", count: 2 },
          { piece: "n", count: 2 },
          { piece: "r", count: 2 },
          { piece: "q", count: 1 },
        ]
      : [
          { piece: "P", count: 8 },
          { piece: "B", count: 2 },
          { piece: "N", count: 2 },
          { piece: "R", count: 2 },
          { piece: "Q", count: 1 },
        ];

  const fenPiecePlacement = fen.split(" ")[0];

  return capturedPieces.map(({ piece, count }) => {
    const piecesLeftCount = fenPiecePlacement.match(
      new RegExp(piece, "g")
    )?.length;
    const newPiece = pieceFenToSymbol[piece] ?? piece;

    return {
      piece: newPiece,
      count: Math.max(0, count - (piecesLeftCount ?? 0)),
    };
  });
};
*/
const pieceFenToSymbol: Record<string, Piece | undefined> = {
  p: "bP",
  b: "bB",
  n: "bN",
  r: "bR",
  q: "bQ",
  k: "bK",
  P: "wP",
  B: "wB",
  N: "wN",
  R: "wR",
  Q: "wQ",
  K: "wK",
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
