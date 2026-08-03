import { Piece, Role, attacks, makeSquare, parseSquare } from "chessops";
import IChessGame from "../../i-chess-game";
import { CastlingRightsType } from "../../types/castling-rights-type";
import { GameOverReason, GameScore, GameState } from "../../types/game-state";
import { IMoveResult } from "../../types/move-result";
import { PieceColor } from "../../types/piece-color";
import { Chess } from 'chessops/chess';
import { makeFen, parseFen } from 'chessops/fen'
import { PieceType } from "../../types/piece-type";
import { ChessConstants } from "../../types/constants";
import PieceMaterial from "../../types/piece-material";
import { makeSan } from "chessops/san";

export default class ChessopsBoard implements IChessGame
{
    //Game instance
    private _inst: Chess;

    //Used to track repetition
    private static readonly _FEN_SPLIT_POSKEY_INDEX = 2
    private _previousPositionMap: Map<string, number> = new Map<string, number>();

    //Piece captures
    private _piecesWhiteCaptured: string[] = [];
    private _piecesBlackCaptured: string[] = [];

    //State cache
    private _stateCache: ChessopsStateCache = new ChessopsStateCache();

    constructor(fen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    {
        const setup = parseFen(fen).unwrap();
        this._inst = Chess.fromSetup(setup).unwrap();

        //Starting position always counts towards the repetition.
        this._previousPositionMap.set(this._getPositionKey(), 1);
    }

    //#region Pieces and squares.

    //Should retrieve an 8x8 array representing the board with its pieces (wP, wK, bN, etc).
    public getPieceState(): string[][]
    {
        const arr = [];

        //Loop through rank
        for (let rank = ChessConstants.SIZE - 1; rank >= 0; rank--) 
        {
            const row = [];
            for (let file = 0; file < ChessConstants.SIZE; file++) 
            {
                //Square code in board.
                const square = rank * ChessConstants.SIZE + file;

                //Piece object inside the square.
                const squareContent: Piece | undefined = this._inst.board.get(square);
                
                //Convert piece to use piece code (ex wP for white pawn.)
                const convertedPiece = this._convertChessopsPieceToPieceType(squareContent);

                //Add to rank.
                row.push(convertedPiece);
            }

            //Add rank.
            arr.push(row);
        }

        return arr
    }

    //Takes in a coordinate and returns the type of piece that's in it.
    public findPieceAtCoordinate(coord: string): string
    {
        //Parse the square into its internal number code.
        const sqr = parseSquare(coord);

        //If it doesn't exist, don't return any piece.
        if (sqr === undefined)
        {
            throw new Error("Invalid square for coord " + coord);
        }

        //Get piece object on board.
        const piece = this._inst.board.get(sqr);

        //Convert it to our standard.
        const convertedPiece = this._convertChessopsPieceToPieceType(piece);

        //And return it.
        return convertedPiece;
    }

    //Retrieves the king coordinate for the passed color.
    public getKingCoordinate(kingColor: string): string
    {
        //White king.
        if (kingColor == PieceColor.WHITE)
        {
            const whiteKing = this._inst.board.kingOf("white");

            if (whiteKing)
            {
                return makeSquare(whiteKing);
            }
        }

        //Black king.
        if (kingColor == PieceColor.BLACK)
        {
            const blackKing = this._inst.board.kingOf("black");

            if (blackKing)
            {
                return makeSquare(blackKing);
            }
        }

        return "";
    }

    //Gets all the pieces pointed at a given square.
    public getPiecesThatHitSquare(coord: string): { whiteCoords: Array<string>, whitePieces: Array<string>, blackCoords: Array<string>, blackPieces: Array<string> }
    {
        //Initial array.
        const attackers = [];

        //Final arrays.
        const whiteCoords: Array<string> = [];
        const whitePieces: Array<string> = [];
        const blackCoords: Array<string> = [];
        const blackPieces: Array<string> = [];
        const square = parseSquare(coord);

        if (!square)
        {
            return {whiteCoords, whitePieces, blackCoords, blackPieces};    
        }

        const board = this._inst.board;


        //Each square in the board.
        for (const attackerSquare of board) 
        {
            //Get what's in it.
            const piece = board.get(attackerSquare[0]);

            //If there's actually anything in it:
            if (piece) 
            {
                //Check if it attacks anything.
                if (attacks(piece, attackerSquare[0], board.occupied).has(square)) 
                {
                    //If it does, push its data.
                    attackers.push({ square: attackerSquare[0], piece });
                }
            }
        }

        //Then divide up the data by piece color.
        attackers.forEach( a => 
            {
                //Get the piece to our standard.
                const convertedPiece = this._convertChessopsPieceToPieceType(a.piece);

                if (convertedPiece.startsWith("w"))
                {
                    //Converts square to number (ex: 12 -> e4)
                    whiteCoords.push(makeSquare(a.square));
                    whitePieces.push(convertedPiece);
                }

                if (convertedPiece.startsWith("b"))
                {
                    blackCoords.push(makeSquare(a.square));
                    blackPieces.push(convertedPiece);
                }
            }
        )

        return {whiteCoords, whitePieces, blackCoords, blackPieces};
    }

    //Retrieves parallel arrays of all pieces/coords of the passed color.
    public getAllPiecesAndCoordsByColor(color: string): {pieces: Array<string>, coords: Array<string>}
    {
        if (color != PieceColor.WHITE && color != PieceColor.BLACK)
        {
            return { pieces: [], coords: [] };
        }

        const pieces = [];
        const coordinates = [];

        const _pieceState = this.getPieceState()

        //Loop through each of these to get the coordinates + pieces.
        for(let i = 0; i < ChessConstants.COORDS.length; i++)
        {
            for(let j = 0; j < ChessConstants.COORDS[i].length; j++)
            {
                const piece = _pieceState[i][j];

                if ( piece.startsWith(color))
                {
                    pieces.push(piece);
                    coordinates.push(ChessConstants.COORDS[i][j])
                }
            }
        }

        return { pieces: pieces, coords : coordinates};
    }

    //If the passed color's king is in check.
    public isInCheck(kingColor: string): boolean
    {
        const board = this._inst.board;

        //If we are verifying the white king:
        if (kingColor == PieceColor.WHITE)
        {
            //Get the king.
            const whiteKingSquare = board.kingOf('white');

            //If the king is actually there.
            if (whiteKingSquare !== undefined) 
            {
                //Get what attacks it.
                const attackers = this.getPiecesThatHitSquare(makeSquare(whiteKingSquare));

                //If something attacks it, it's in check.
                if (attackers.blackCoords.length > 0) 
                {
                    return true;
                }
            }
        }

        //If we are verifying the black king:
        if (kingColor == PieceColor.BLACK)
        {
            const blackKingSquare = board.kingOf('black');

            //If the king is actually there.
            if (blackKingSquare !== undefined) 
            {
                //Get what attacks it.
                const attackers = this.getPiecesThatHitSquare(makeSquare(blackKingSquare));

                //If something attacks it, it's in check.
                if (attackers.whiteCoords.length > 0) 
                {
                return true;
                }
            }
        }

        return false;
    }

    //Positive number signifies that white is up, negative signifies black is up.
    public getMaterialAdvantage(): number 
    {
        const board = this._inst.board; 
        let whiteValue = 0;
        let blackValue = 0;

        for (const [_, piece] of board) 
        {
            const convertedPiece = this._convertChessopsPieceToPieceType(piece)
            if (convertedPiece !== PieceType.WHITE_KING && convertedPiece !== PieceType.BLACK_KING)
            {
                const value = PieceMaterial.getMaterialFromPiece(convertedPiece);

                if (piece.color === 'white') 
                {
                    whiteValue += value;
                } 
                else 
                {
                    blackValue += value;
                }
            }
        }

        return whiteValue - blackValue;  // Positive = white advantage, negative = black advantage
    }

    //Get captured pieces by color
    public getPiecesCapturedByPlayer(color: PieceColor): Array<string>
    {
        if (color == PieceColor.WHITE)
        {
            return [...this._piecesWhiteCaptured];
        }

        if (color == PieceColor.BLACK)
        {
            return [...this._piecesBlackCaptured];
        }

        return [];
    }

    //Returns true if white to move, false if black to move.
    public getTurn(): boolean
    {
        return this._inst.turn === 'white';
    }

    //Takes in a chessops piece and converts it to our standard.
    private _convertChessopsPieceToPieceType(squareContent: Piece | undefined)
    {
      let pieceCode = "";

      if (squareContent) {
        switch (`${squareContent.color}-${squareContent.role}`) {
          // White pieces
          case "white-pawn":
            pieceCode = PieceType.WHITE_PAWN;
            break;

          case "white-rook":
            pieceCode = PieceType.WHITE_ROOK;
            break;

          case "white-knight":
            pieceCode = PieceType.WHITE_KNIGHT;
            break;

          case "white-bishop":
            pieceCode = PieceType.WHITE_BISHOP;
            break;

          case "white-queen":
            pieceCode = PieceType.WHITE_QUEEN;
            break;

          case "white-king":
            pieceCode = PieceType.WHITE_KING;
            break;

          // Black pieces
          case "black-pawn":
            pieceCode = PieceType.BLACK_PAWN;
            break;

          case "black-rook":
            pieceCode = PieceType.BLACK_ROOK;
            break;

          case "black-knight":
            pieceCode = PieceType.BLACK_KNIGHT;
            break;

          case "black-bishop":
            pieceCode = PieceType.BLACK_BISHOP;
            break;

          case "black-queen":
            pieceCode = PieceType.BLACK_QUEEN;
            break;

          case "black-king":
            pieceCode = PieceType.BLACK_KING;
            break;
        }
      }

      return pieceCode
    }

    //Takes in our piece object and converts it to an internal chessops piece
    private _convertPieceTypeToChessopsPiece(pieceCode: string): Piece | undefined 
    {
        const pieceMap: Record<string, Piece> = 
        {
            [PieceType.WHITE_PAWN]: { color: 'white', role: 'pawn' },
            [PieceType.WHITE_ROOK]: { color: 'white', role: 'rook' },
            [PieceType.WHITE_KNIGHT]: { color: 'white', role: 'knight' },
            [PieceType.WHITE_BISHOP]: { color: 'white', role: 'bishop' },
            [PieceType.WHITE_QUEEN]: { color: 'white', role: 'queen' },
            [PieceType.WHITE_KING]: { color: 'white', role: 'king' },
            [PieceType.BLACK_PAWN]: { color: 'black', role: 'pawn' },
            [PieceType.BLACK_ROOK]: { color: 'black', role: 'rook' },
            [PieceType.BLACK_KNIGHT]: { color: 'black', role: 'knight' },
            [PieceType.BLACK_BISHOP]: { color: 'black', role: 'bishop' },
            [PieceType.BLACK_QUEEN]: { color: 'black', role: 'queen' },
            [PieceType.BLACK_KING]: { color: 'black', role: 'king' },
        };

        return pieceMap[pieceCode];
    }

    //#endregion

    //#region Manipulation of state

    //Set true for white to move, false for black to move.
    public setTurn(val: boolean): void 
    {
        //Turn of the game currently
        const currentTurn = this.getTurn();

        //Don't do the computationally expensive shit if nothing changes.
        if (currentTurn === val)
        {
            return;
        }

        //Get the current fen and split it.
        const currentFen = this.getFEN();
        const parts = currentFen.split(' ');

        //Switch the turn portion.
        parts[1] = val === true ? PieceColor.WHITE : PieceColor.BLACK;

        //Create a new fen by joining it.
        const newFen = parts.join(' ');
        this._instantiateFromFen(newFen);
    }

    //Resets the board to its default.
    public reset(): void
    {
        this._inst = Chess.default();
        this._resetInternal();
    }

    //Places a piece at a given coord.
    public setPieceOnBoard(coord: string, piece: string): void
    {
        const chessopsPiece = this._convertPieceTypeToChessopsPiece(piece);

        if (chessopsPiece) 
        {
            const square = parseSquare(coord);
            if (square !== undefined) {
                this._inst.board.set(square, chessopsPiece);
            }
        }
    }

    //Creaetes a new chessops from fen.
    private _instantiateFromFen(fen: string)
    {
        const setup = parseFen(fen).unwrap();
        this._inst = Chess.fromSetup(setup).unwrap();
    }

    //Reinitializes subfields.
    private _resetInternal()
    {
        //Remove all captures.
        this._piecesBlackCaptured.length = 0;
        this._piecesWhiteCaptured.length = 0;

        //Remove entries in repetition map.
        this._previousPositionMap.clear();

        //Starting position always counts towards the repetition.
        this._previousPositionMap.set(this._getPositionKey(), 1);
    }
    //#endregion

    //#region Game state

    //Gets game state object.
    public getGameState(): GameState
    {
        const state = new GameState();

        const turn = this._inst.turn;

        //Checkmate
        if (this._inst.isCheckmate())
        {
            state.isGameOver = true;
            state.reason = GameOverReason.Checkmate;

            state.winner = turn === "white" ? PieceColor.BLACK : PieceColor.WHITE;
            state.gameScore = turn === "white"
                ? GameScore.BLACK_WON
                : GameScore.WHITE_WON;

            return state;
        }

        //Stalemate
        if (this._inst.isStalemate())
        {
            state.isGameOver = true;
            state.reason = GameOverReason.Stalemate;
            state.gameScore = GameScore.DRAW;

            return state;
        }

        //Insufficient material
        if (this._inst.isInsufficientMaterial())
        {
            state.isGameOver = true;
            state.reason = GameOverReason.InsufficientMaterial;
            state.gameScore = GameScore.DRAW;

            return state;
        }

        //50 move rule
        if (this._inst.halfmoves >= ChessConstants.DRAW_BY_NO_CAPTURES_OR_PAWN_MOVEMENTS_THRESHOLD)
        {
            state.isGameOver = true;
            state.reason = GameOverReason.FiftyMoveNoPawnMovementsOrCaptures;
            state.gameScore = GameScore.DRAW;

            return state;
        }

        //Threefold repetition requires history tracking
        if (this._isThreefoldRepetition())
        {
            state.isGameOver = true;
            state.reason = GameOverReason.ThreefoldRepetition;
            state.gameScore = GameScore.DRAW;

            return state;
        }

        return state;
    }

    //Triggers game over check from outside if necessary
    public checkIsGameOver(): void
    {
        //pass
    }

    //Verifies if a threefold repetition has taken place.
    private _isThreefoldRepetition(): boolean
    {
        //Check every position in the cache.
        for( let posKey of this._previousPositionMap.keys() )
        {
            //Get number of occurrences
            const val = this._previousPositionMap.get(posKey);

            //If any position has occurred at least three times, instant draw by reChessConstantspetition.
            if (val)
            {
                if (val >= ChessConstants.DRAW_BY_REPETITION_THRESHOLD)
                {
                    return true;
                }
            }
        }

        return false;
    }

    //Will need this for the sake of tracking draw by repetition since it needs to take 
    //into account whether an EP capture is possible, not just that there is an EP square.
    private _isEnPassantCaptureActuallyPossible(): boolean
    {
        //If there is no en passant square then obviously it isn't possible.
        const epSquare = this._inst.epSquare;
        if (epSquare === undefined)
        {
            return false;
        }

        //First check all legal moves.
        for (const [from, destinations] of this._inst.allDests())
        {
            //Get the piece in the from square.
            const piece = this._inst.board.get(from);

            //If it's a pawn and it can move to EP square, then EP capture is possible.
            if (
                piece &&
                piece.role === "pawn" &&
                destinations.has(epSquare)
            )
            {
                return true;
            }
        }

        //If a pawn cannot move to EP square, not possible.
        return false;
    }

    //Position key for tracking draw by repetition
    private _getPositionKey()
    {
        const fenSplit = this.getFEN().split(" ");
        let posKey = "";

        for(let i = 0; i <= ChessopsBoard._FEN_SPLIT_POSKEY_INDEX; i++)
        {
            posKey += fenSplit[i];
            posKey += " ";
        }

        this._isEnPassantCaptureActuallyPossible() ? posKey += this.getEnPassantSquare() : posKey += "-"

        return posKey
    }

    //#endregion

    //#region Moves

    //Fully validated legal moves that a certain coordinate's piece can make
    public getLegalMoves(coordinate: string): Array<string>
    {
        const sqr = parseSquare(coordinate);

        if (!sqr)
        {
        return [];
        }

        const legalSquares = this._inst.dests(sqr);
        const legalMoves: Array<string> = [];

        for(const dest of legalSquares)
        {
        legalMoves.push(makeSquare(dest));
        }

        return legalMoves;
    }

    //Moves a piece from one spot to another and accounting for promotion if applicable.
    //Perform a move on the board: from -> to + promotion
    public completeMove(
        fromCoordinate: string, 
        toCoordinate: string, 
        promotionPiece: string = PieceType.QUEEN
    ): IMoveResult 
    {
        //Object to return.
        const result: IMoveResult = 
        {
            result: false,
            notation: '',
            notationMinimal: '',
            fromCoord: fromCoordinate,
            toCoord: toCoordinate,
            promotion: '',
            piece: '',
            pgnComment: ''
        };

        //Don't make a move if the game is over.
        if (this.getGameState().isGameOver)
        {
            return result;
        }

        //If one coord is missing, don't do anything.
        if (!fromCoordinate || !toCoordinate)
        {
            //return result;
        }

        //Parse from and to squares.
        console.log(fromCoordinate + " -> " + toCoordinate)
        const fromSquare = parseSquare(fromCoordinate);
        const toSquare = parseSquare(toCoordinate);
        console.log(this.getFEN());

        //Don't make a move that has a missing square.
        if (fromSquare === undefined || toSquare === undefined) 
        {
            return result;
        }

        //Check what piece is in the from square.
        const piece = this._inst.board.get(fromSquare);

        //Don't consider moving anything if there is no piece there.
        if (!piece) 
        {
            return result;
        }

        //Create move object.
        const move: any = 
        {
            from: fromSquare,
            to: toSquare
        };

        //Check what piece exists in the to square.
        const movedPiece = this.findPieceAtCoordinate(fromCoordinate);
        const pieceToBeCapturedIfExists = this.findPieceAtCoordinate(toCoordinate);

        const didEnPassantCaptureHappen = this._isEnPassantCaptureActuallyPossible() && toCoordinate == this.getEnPassantSquare() && movedPiece.endsWith(PieceType.PAWN)

        if (didEnPassantCaptureHappen)
        {
            const capturedPawnPiece = this.getTurn() ? PieceType.BLACK_PAWN : PieceType.WHITE_PAWN;

            this._addCapture(capturedPawnPiece);
        }

        //Only apply promotion if this is actually a pawn reaching the last rank
        let actualPromotion = "";
        if (piece.role === "pawn") 
        {
            const rank = Math.floor(toSquare / ChessConstants.SIZE);

            const isPromotionRank =
                (piece.color === "white" && rank === 7) ||
                (piece.color === "black" && rank === 0);

            if (isPromotionRank)
            {
                const promotionRole = this._convertPromotionPiece(promotionPiece);

                if (promotionRole)
                {
                    move.promotion = promotionRole;
                    actualPromotion = promotionPiece.toUpperCase();
                }
            }
        }

        if (!this._inst.isLegal(move)) 
        {
            return result;
        }

        //Cache move so it can be undone later.
        this._cacheState();

        //Detect capture before playing the move
        const isCapture = this._inst.board.has(toSquare) || didEnPassantCaptureHappen;

        //Generate SAN before playing the move
        const san = makeSan(this._inst, move);

        //Add capture if exists.
        if (pieceToBeCapturedIfExists)
        {
            this._addCapture(pieceToBeCapturedIfExists);
        }

        //Play move
        this._inst.play(move);

        const inCheck = this._inst.isCheck();
        const inCheckmate = this._inst.isCheckmate();

        //Build LAN
        let lan = fromCoordinate;

        if (isCapture) 
        {
            lan += "x";
        }

        lan += toCoordinate;

        if (actualPromotion) 
        {
            lan += "=" + actualPromotion;
        }

        if (inCheckmate) 
        {
            lan += "#";
        }
        else if (inCheck) 
        {
            lan += "+";
        }

        //Set fields
        result.result = true;
        result.notation = lan;
        result.notationMinimal = san;
        result.piece = this._convertChessopsPieceToPieceType(piece);

        //Only populate this when promotion happened
        result.promotion = actualPromotion;

        //Register in position map for threefold repetition checking.
        const currentPosKey = this._getPositionKey()
        const currentStateCount: number | undefined = this._previousPositionMap.get(currentPosKey);
        if (!currentStateCount)
        {
            this._previousPositionMap.set(currentPosKey, 1);
        }
        else
        {
            this._previousPositionMap.set(currentPosKey, currentStateCount + 1);
        }

        return result;
    }


    //Clears state cache and reverts it completely to that of the previous move.
    public undoMostRecentMove()
    {
        this._inst = this._stateCache.chessInstance;

        //Piece captures
        this._piecesWhiteCaptured.length = 0;
        this._piecesBlackCaptured.length = 0;
        this._stateCache.piecesWhiteCaptured.forEach(p => { this._piecesWhiteCaptured.push(p); });
        this._stateCache.piecesBlackCaptured.forEach(p => { this._piecesBlackCaptured.push(p); });

        
        //Previous fen key
        this._previousPositionMap.clear();

        for(const [k, v] of this._stateCache._previousStateMap)
        {
            this._previousPositionMap.set(k, v);
        }
    }

    //Converts our standard to the standard chessops needs for promotions.
    private _convertPromotionPiece(promotionPiece: string): Role | undefined
    {
        switch (promotionPiece.toUpperCase())
        {
            case "Q":
                return "queen";

            case "R":
                return "rook";

            case "B":
                return "bishop";

            case "N":
                return "knight";

            default:
                return undefined;
        }
    }

    private _addCapture(piece: string)
    {
        const whiteToMove = this.getTurn();

        if (whiteToMove && piece.startsWith(PieceColor.BLACK))
        {
            this._piecesWhiteCaptured.push(piece);
        }

        if (!whiteToMove && piece.startsWith(PieceColor.WHITE))
        {
            this._piecesBlackCaptured.push(piece);
        }
    }

    //Keep a copy of everything so a move can be undone.
    private _cacheState()
    {
        //Instance.
        this._stateCache.chessInstance = this._inst.clone();

        //Piece captures
        this._stateCache.piecesWhiteCaptured.length = 0;
        this._stateCache.piecesBlackCaptured.length = 0;
        this._piecesWhiteCaptured.forEach( p => {this._stateCache.piecesWhiteCaptured.push(p)} );
        this._piecesBlackCaptured.forEach( p => {this._stateCache.piecesBlackCaptured.push(p)} );

        //Previous fen key
        this._stateCache._previousStateMap.clear();
        for(const [k, v] of this._previousPositionMap)
        {
            this._stateCache._previousStateMap.set(k, v);
        }
    }

    //#endregion

    //#region Castling and en passant

    //Gets castling rights by type.
    public getCastlingRights(type: CastlingRightsType): boolean 
    {
        const castles = this._inst.castles;
        
        const sideMap: Record<CastlingRightsType, 'a' | 'h'> = {
        [CastlingRightsType.WhiteKingside]: 'h',
        [CastlingRightsType.WhiteQueenside]: 'a',
        [CastlingRightsType.BlackKingside]: 'h',
        [CastlingRightsType.BlackQueenside]: 'a'
        };
        
        const colorMap: Record<CastlingRightsType, 'white' | 'black'> = {
        [CastlingRightsType.WhiteKingside]: 'white',
        [CastlingRightsType.WhiteQueenside]: 'white',
        [CastlingRightsType.BlackKingside]: 'black',
        [CastlingRightsType.BlackQueenside]: 'black'
        };
        
        const rook = castles.rook[colorMap[type]][sideMap[type]];
        return rook !== undefined && castles.castlingRights.has(rook);
    }

    //Sets type of castling rights.
    public setCastlingRights(type: CastlingRightsType, allowed: boolean): void 
    {
        const setup = this._inst.toSetup();
        const castles = this._inst.castles;
        
        //Map castling type to color and side
        const colorMap: Record<CastlingRightsType, 'white' | 'black'> = 
        {
            [CastlingRightsType.WhiteKingside]: 'white',
            [CastlingRightsType.WhiteQueenside]: 'white',
            [CastlingRightsType.BlackKingside]: 'black',
            [CastlingRightsType.BlackQueenside]: 'black'
        };
        
        const sideMap: Record<CastlingRightsType, 'a' | 'h'> = 
        {
            [CastlingRightsType.WhiteKingside]: 'h',
            [CastlingRightsType.WhiteQueenside]: 'a',
            [CastlingRightsType.BlackKingside]: 'h',
            [CastlingRightsType.BlackQueenside]: 'a'
        };
        
        const rook = castles.rook[colorMap[type]][sideMap[type]];
        
        if (rook !== undefined) 
        {
            if (allowed) 
            {
                setup.castlingRights = setup.castlingRights.with(rook);
            } 
            else 
            {
                setup.castlingRights = setup.castlingRights.without(rook);
            }
            
            this._inst = Chess.fromSetup(setup).unwrap();
        }
    }

    //Retrieves the coord of the en passant square
    public getEnPassantSquare(): string 
    {
        //If it doesn't exist, don't return a coord.
        const ep = this._inst.epSquare;
        if (!ep)
        {
            return "";
        }

        //Return corresponding coord if exists.
        return makeSquare(ep);
    }

    //Set en passant square to passed coord
    public setEnPassantSquare(coord: string): void 
    {
        //Get current setup from Chess object
        const setup = this._inst.toSetup();

        //If erasing, set undefined.
        if (coord == "")
        {
            setup.epSquare = undefined;
        }
        else 
        {
            //Parse the coordinate to a square number (e.g., "e3" -> 20)
            const square = parseSquare(coord);
            
            //Update the epSquare
            setup.epSquare = square;
        }
        
        //Recreate Chess object with modified setup
        this._inst = Chess.fromSetup(setup).unwrap();
    }

    //#endregion

    //#region Instantiation

    public clone(): IChessGame
    {
        //Create a fresh board from the current position.
        const cloned = new ChessopsBoard(this.getFEN());

        //Deep copy captured pieces.
        cloned._piecesWhiteCaptured = [...this._piecesWhiteCaptured];
        cloned._piecesBlackCaptured = [...this._piecesBlackCaptured];

        //Deep copy repetition history.
        cloned._previousPositionMap = new Map(this._previousPositionMap);

        //Deep copy cached state.
        cloned._stateCache = this._stateCache.deepCopy();

        return cloned;
    }

    //#endregion

    //#region FEN
    public getFEN(): string 
    {
        const currentFen = makeFen(this._inst.toSetup());

        return currentFen;
    }

    //#endregion
}

class ChessopsStateCache
{
  chessInstance: Chess = Chess.default();

  //captures
  piecesWhiteCaptured: string[] = [];
  piecesBlackCaptured: string[] = [];

  //true: White's turn, false: black's turn
  turn: boolean = true; 

  //used to track repetition
  _previousStateMap: Map<string, number> = new Map<string, number>();

  deepCopy(): ChessopsStateCache 
  {
    const copy = new ChessopsStateCache();

    //arrays
    copy.piecesWhiteCaptured = [...this.piecesWhiteCaptured];
    copy.piecesBlackCaptured = [...this.piecesBlackCaptured];

    //Map deep copy
    copy._previousStateMap = new Map(this._previousStateMap);

    return copy;
  }
}