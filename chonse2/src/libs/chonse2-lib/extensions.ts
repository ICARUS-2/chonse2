import AlgebraicNotationMaker from "./algebraic-notation-builder";
import Chonse2 from "./chonse2";
import { PieceColor } from "./piece-color";
import PieceMaterial from "./piece-material";
import { PieceType } from "./piece-type";

export default class Chonse2Extensions
{
    //#region Hanging pieces

    //Sorts hanging pieces by color.
    public static getHangingPieces(board: Chonse2): { white: Array<string>, black: Array<string> }
    {
        const o: { white: Array<string>, black: Array<string> } = {
            white: [],
            black: []
        }

        //Check every piece in the board.
        for(let i = 0; i < board.pieceState.length; i++)
        {
            const currentRank = board.pieceState[i];

            for(let j = 0; j < currentRank.length; j++)
            {
                const squareCoord = Chonse2.COORDS[i][j];
                if(this.doesSquareHaveHangingPiece(board, squareCoord))
                {
                    const pieceColor = board.pieceState[i][j][0];

                    if (pieceColor == PieceColor.WHITE)
                    {
                        o.white.push(squareCoord);
                    }
                    else 
                    {
                        o.black.push(squareCoord);
                    }
                }
            }
        }
        
        return o;
    }

    //Simple hanging piece checker (doesn't account for xray tho)
    public static doesSquareHaveHangingPiece(board: Chonse2, squareCoord: string): boolean
    {        
        const { rowIndex, colIndex } = Chonse2.findIndexFromCoordinate(squareCoord);
        const pieceInSquare = board.pieceState[rowIndex][colIndex];

        //A square with no piece in it isn't hanging.
        if (pieceInSquare == PieceType.NONE)
        {
            return false;
        }

        const pieceInSquareColor = pieceInSquare[0] == "w" ? PieceColor.WHITE : PieceColor.BLACK;
        const hits = board.getPiecesThatHitSquare(squareCoord);

        const attackers = pieceInSquareColor == PieceColor.WHITE ? hits.blackPieces : hits.whitePieces;
        const defenders = pieceInSquareColor == PieceColor.WHITE ? hits.whitePieces : hits.blackPieces;

        //A piece that isn't attacked isn't hanging.
        if (attackers.length == 0)
        {
            return false;
        }

        //If we got this far, there's at least one attacker. One attacker and no defenders = hanging.
        if (defenders.length == 0)
        {
            return true;
        }

        //If the value of the smallest attacker value is less than that of the piece, then it is hanging.
        const valueOfPieceInSquare = PieceMaterial.getMaterialFromPiece(pieceInSquare);
        const minAttackerValue = Math.min( ...attackers.map( p => PieceMaterial.getMaterialFromPiece(p)) );
        if (minAttackerValue < valueOfPieceInSquare)
        {
            return true;
        }

        //If a piece has more attackers than defenders then it's hanging
        if (attackers.length > defenders.length)
        {
            return true;
        }

        //If none of the above three conditions are met then it's not hanging.
        return false;
    }
    //#endregion

    //#region Forks
    public static getForksOnBoard(
        board: Chonse2, 
        attackerColor: string, 
        _precomputedHangingPieceArr: { white: Array<string>, black: Array<string> } | null = null //Array of all hanging pieces. 
                         // For efficiency in cases where the hanging pieces have already been computed, don't compute them again
    ): Array<Fork>
    {
        //Will contain the forks on the board for that specific color.
        const allForks: Array<Fork> = [];

        //Need to copy the board in order to simulate the correct turn.
        const boardCopy = board.getFullDeepCopy();

        //Need to set the turn accordingly so legal moves register.
        boardCopy.turn = attackerColor == PieceColor.WHITE ? true : false;

        //All of the pieces/coords belonging to the attacker.
        const piecesAndCoords: { pieces: Array<string>, coords: Array<string> } = board.getAllPiecesAndCoordsByColor(attackerColor);
        
        //All of the hanging pieces on the board regardless of color.
        const allHangingPieces = _precomputedHangingPieceArr == null ? Chonse2Extensions.getHangingPieces(boardCopy) : _precomputedHangingPieceArr;
    
        //Need to check through every piece to find which ones might be forking.
        for(let i = 0; i < piecesAndCoords.coords.length; i++)
        {
            const currentPieceCoordinate = piecesAndCoords.coords[i];

            const squareHits = boardCopy.getPiecesThatHitSquare(currentPieceCoordinate);
            const squareHitsToCheck = attackerColor == PieceColor.WHITE ? squareHits.blackPieces : squareHits.whitePieces;

            if (squareHitsToCheck.length > 0)
            {
                continue;
            }

            //Need to know where the current piece can go.
            const legalMoveCoordinatesForPiece = boardCopy.getLegalMoves(currentPieceCoordinate);

            //List of candidate piece captures
            const candidatePieceCoordinatesToFork = [];
            const oppositeColor = PieceColor.getOpposite(attackerColor);

            //For each of the legal moves of the current piece, a candidate capture is a piece of the opposite color that can be captured on the next turn.
            for(let i = 0; i < legalMoveCoordinatesForPiece.length; i++)
            {
                const currentLegalMove = legalMoveCoordinatesForPiece[i];
                const pieceInThatCoordinate = boardCopy.findPieceAtCoordinate(currentLegalMove);

                //If there is a piece that can be captured, add it to the candidate list.
                if (pieceInThatCoordinate.startsWith(oppositeColor))
                {
                    candidatePieceCoordinatesToFork.push(currentLegalMove);
                }
            }

            //Filter out the potential candidates to find the pieces that are either hanging or are the king.
            const opponentHangingPieceCoords = attackerColor == PieceColor.WHITE ? allHangingPieces.black : allHangingPieces.white;
            const filteredCandidatesForCheckAndCapturePotential = candidatePieceCoordinatesToFork.filter( coord =>
                {
                    //If the piece is the king (aka the most important piece) and can't be "defended" by anything, it's a filtered candidate.
                    const pieceInCoord = boardCopy.findPieceAtCoordinate(coord);
                    const pieceInCoordMaterialValue = PieceMaterial.getMaterialFromPiece(pieceInCoord);

                    if (pieceInCoord.endsWith(PieceType.KING))
                    {
                        return true;
                    }

                    //If the piece is hanging, it might be a filtered candidate.
                    if (opponentHangingPieceCoords.includes(coord))
                    {
                        //One thing barring it from being a filtered candidate is if this piece can give a check stopping the fork.
                        boardCopy.turn = attackerColor == PieceColor.WHITE ? false : true;
                        const legalMoves = boardCopy.getLegalMoves(coord);
                        boardCopy.turn = attackerColor == PieceColor.WHITE ? true : false;

                        let attackedPlayerHasCheckWithPiece = false;

                        //Check every legal move of that piece to see if a check is possible. If not, not a forked piece.
                        for (const move of legalMoves)
                        {
                            //Also, if the piece can capture something greater than or equal to in value, it isn't a fork.
                            const pieceInLegalMoveSpot = boardCopy.findPieceAtCoordinate(move);
                            if (pieceInLegalMoveSpot)
                            {
                                const materialValueOfPieceInLegalMoveSpot = PieceMaterial.getMaterialFromPiece(pieceInLegalMoveSpot);
                                if (materialValueOfPieceInLegalMoveSpot >= pieceInCoordMaterialValue)
                                {
                                    return false;
                                }
                            }

                            //verify if there is a check.
                            boardCopy.turn = attackerColor == PieceColor.WHITE ? false : true;
                            boardCopy.completeMove(coord, move);

                            
                            const attackerIsInCheck = boardCopy.isInCheck(attackerColor);
                            boardCopy.turn = attackerColor == PieceColor.WHITE ? true : false;
                            boardCopy.undoMostRecentMove();
                            if (attackerIsInCheck)
                            {
                                attackedPlayerHasCheckWithPiece = true;
                                break;
                            }
                        }

                        //If there is no check here, 
                        if (!attackedPlayerHasCheckWithPiece)
                        {
                            return true;
                        }
                    }

                    return false;
                }
            )

            //If there are more than two candidates, it's definitely a fork.
            if (filteredCandidatesForCheckAndCapturePotential.length > 2)
            {
                allForks.push( new Fork(currentPieceCoordinate, filteredCandidatesForCheckAndCapturePotential) );
            }
            //If there are only two candidates, it's definitely a fork if no king is involved. It might not be a fork if:
            //The king and another piece are hit but the player can move a piece to block the check AND defend the piece.
            else if (filteredCandidatesForCheckAndCapturePotential.length == 2)
            {
                let containsKing: boolean = false;
                filteredCandidatesForCheckAndCapturePotential.forEach( c => 
                {
                    const p = boardCopy.findPieceAtCoordinate(c);

                    if (p.endsWith(PieceType.KING))
                    {
                        containsKing = true;
                    }
                }
                )

                //If it's a fork of two non-king pieces, it's a valid fork.
                if (!containsKing)
                {
                    allForks.push( new Fork(currentPieceCoordinate, filteredCandidatesForCheckAndCapturePotential) );
                }
                else //If it does contain a king, verify that the defender cannot move a piece to block the check and defend the other piece at the same time. 
                {
                    //Get the coordinate of the non-king piece.
                    const nonKingPieceCoordinate = filteredCandidatesForCheckAndCapturePotential.filter( c =>
                    {
                        const p = boardCopy.findPieceAtCoordinate(c);

                        return (!p.endsWith(PieceType.KING));
                    }
                    )[0];

                    //Must get the defender pieces to check each other one to ensure that it cannot move to block the check and defend the other piece.
                    const defenderColor = attackerColor == PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
                    const defenderPieces = boardCopy.getAllPiecesAndCoordsByColor(defenderColor);
                    
                    //Get the list of every defender piece that isn't the one being hit in the potential fork.
                    const filteredDefenderPieceCoords = defenderPieces.coords.filter( c => 
                        {
                            return nonKingPieceCoordinate != c;
                        }
                    )

                    //Check that any of the defender pieces cannot block the check and defend the piece at the same time.
                    let pieceCanBlockCheckAndDefendForkedPiece: boolean = false;
                    for(const defenderPieceCoord of filteredDefenderPieceCoords )
                    {
                        const legalMovesForDefenderPiece = boardCopy.getLegalMoves(defenderPieceCoord);
                        boardCopy.turn = !boardCopy.turn;

                        //For each of the legal moves of the defender pieces, check if it can hit the forked piece and defend it.
                        for(const legalMove of legalMovesForDefenderPiece)
                        {
                            //Clone the object and complete the move (this is horribly inefficient but all I can think of right now, fix this shit later).
                            //const clone = boardCopy.getFullDeepCopy();
                            boardCopy.turn = !boardCopy.turn;
                            boardCopy.completeMove(defenderPieceCoord, legalMove);
                            boardCopy.turn = !boardCopy.turn;

                            //Get the pieces that defend the forked square.
                            const piecesThatHitForkedPieceSquare = boardCopy.getPiecesThatHitSquare(nonKingPieceCoordinate);
                            boardCopy.undoMostRecentMove();
                            const piecesDefendingForkedPieceSquare = attackerColor == PieceColor.WHITE ? piecesThatHitForkedPieceSquare.blackPieces : piecesThatHitForkedPieceSquare.whitePieces;

                            //If the moved piece defends the forked square, it's not a fork.                            
                            if (piecesDefendingForkedPieceSquare.length > 0)
                            {
                                pieceCanBlockCheckAndDefendForkedPiece = true;
                                break;
                            }
                        }
                    }

                    //If no other piece can block the check and defend at the same time, it's a fork.
                    if (!pieceCanBlockCheckAndDefendForkedPiece)
                    {
                        allForks.push( new Fork(currentPieceCoordinate, filteredCandidatesForCheckAndCapturePotential) );
                    }
                }
            }
        }

        //And then return all the forks.
        return allForks;
    }
    //#endregion

    //#region Pins
    static getPinsOnBoard(board: Chonse2, excludePawns: boolean = false)
    {
        const pins: Array<Pin> = [];

        //A piece can only be pinned by a bishop, a rook or a queen.
        const ATTACKER_TYPES = [PieceType.BISHOP, PieceType.ROOK, PieceType.QUEEN];

        //Will need to check all of the pieces to see which ones could be attackers.
        const pieceData = [board.getAllPiecesAndCoordsByColor(PieceColor.WHITE), board.getAllPiecesAndCoordsByColor(PieceColor.BLACK)];
        const candidateAttackers: { pieces: Array<string>, coords: Array<string> } = { pieces: [], coords: [] };

        //Check through all of the pieces and get the ones that could potentially be attackers (aka bishops, rooks, and queens which can pin a piece).
        pieceData.forEach( collection => 
            {
                for(let i = 0; i < collection.coords.length; i++)
                {
                    const coord = collection.coords[i];
                    const piece = collection.pieces[i];
                    const lastChar = piece[piece.length - 1];

                    if (ATTACKER_TYPES.includes(lastChar))
                    {
                        candidateAttackers.pieces.push(piece);
                        candidateAttackers.coords.push(coord);
                    }
                }
            }
        )

        const hangingPieceCoords = Chonse2Extensions.getHangingPieces(board);

        for( let i = 0; i < candidateAttackers.pieces.length; i++ )
        {
            //the current piece/coord data.
            const currentPiece = candidateAttackers.pieces[i];
            const currentCoord = candidateAttackers.coords[i];

            //represents what type of piece it is.
            const lastCharOfPiece = currentPiece[currentPiece.length - 1];

            //indicates the color of the piece
            const colorOfPiece: PieceColor = currentPiece[0];

            //if the attacking piece is hanging, it can't viably pin something.
            const attackerHangingPieces = colorOfPiece == PieceColor.WHITE ? hangingPieceCoords.white : hangingPieceCoords.black;
            if (attackerHangingPieces.includes(currentCoord))
            {
                continue;
            }
            
            //will need to determine how exactly that piece can move depending on what it is.
            let vectorX: Array<number> = [];
            let vectorY: Array<number>  = [];

            //get the corresponding vector (diagonals for bishop, horizontal for rook, and a combination of both for queen).
            switch(lastCharOfPiece)
            {
                case PieceType.BISHOP:
                    vectorX = Chonse2._BISHOP_VECTOR_X;
                    vectorY = Chonse2._BISHOP_VECTOR_Y;
                    break;

                case PieceType.ROOK:
                    vectorX = Chonse2._ROOK_VECTOR_X;
                    vectorY = Chonse2._ROOK_VECTOR_Y;
                    break;

                case PieceType.QUEEN:
                    vectorX = Chonse2._QUEEN_KING_VECTOR_X;
                    vectorY = Chonse2._QUEEN_KING_VECTOR_Y;
            }

            //This is the current index within the piece state array that the coordinate lies in. Need this for checking the squares it sees.
            const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(currentCoord);

            for(let offsetIndex = 0; offsetIndex < vectorX.length; offsetIndex++)
            {
                //change in x and y coordinates that will be applied as offsets.
                let dx = vectorX[offsetIndex];
                let dy = vectorY[offsetIndex];

                //cap to ensure that it cannot run longer than the chessboard itself.
                let runCount = 0;

                //Will be the lower-value target of the pin.
                let pinnedPieceCoordinate = "";
                let pinnedPieceType = "";

                for( 
                    let currentXOffset = dx, currentYOffset = dy; //starts at the places of the vector components relative to the piece.
                    runCount < Chonse2.SIZE; //ensures that it does not check outside the bounds.
                    currentXOffset += dx, currentYOffset += dy, runCount++ //keep incrementing the offsets accordingly
                )   
                {
                    const rowInQuestion = board.pieceState[rowIndex + currentXOffset];
                    
                    if (rowInQuestion)
                    {
                        //the square that is being checked.
                        const squareInQuestionPiece = rowInQuestion[colIndex + currentYOffset];

                        if (squareInQuestionPiece != undefined)
                        {
                            //If there's nothing in that square, then this piece can't do anything.
                            if (squareInQuestionPiece == "")
                            {
                                continue;
                            }
                            
                            const enemyPieceColor: PieceColor = colorOfPiece == PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
                            //if the piece is a friendly piece, then it's not pinning anything.
                            if (!squareInQuestionPiece.startsWith(enemyPieceColor.toString()))
                            {
                                break;
                            }

                            //if the piece is an enemy one and there is no pinned piece already, make that the pinned piece.
                            if (!pinnedPieceCoordinate)
                            {
                                pinnedPieceCoordinate = Chonse2.COORDS[rowIndex + currentXOffset][colIndex + currentYOffset];
                                pinnedPieceType = squareInQuestionPiece;
                                //after the first piece is found, continue the loop and search for a potential piece for this one to be pinned to.
                                continue;
                            }

                            
                            //if the pinned piece is already defined, then check if this piece is an enemy
                            const materialOfPinnedPiece = PieceMaterial.getMaterialFromPiece(pinnedPieceType);
                            const materialOfPotentialSecondPiece = PieceMaterial.getMaterialFromPiece(squareInQuestionPiece);

                            //If the piece behind the candidate pinned piece is worth more than it, then it is indeed a pin.
                            if (materialOfPotentialSecondPiece > materialOfPinnedPiece)
                            {
                                if (excludePawns)
                                {
                                    if (pinnedPieceType.endsWith(PieceType.PAWN))
                                    {
                                        continue;
                                    }
                                }

                                const newPin = new Pin();

                                newPin.attackerCoordinate = currentCoord;
                                newPin.pinnedPieceCoordinate = pinnedPieceCoordinate;
                                newPin.highValuePieceCoordinate = Chonse2.COORDS[rowIndex + currentXOffset][colIndex + currentYOffset];
                            
                                pins.push(newPin);
                            }
                            else 
                            {
                                break;
                            }
                        }
                    }
                }
            }
        }

        return pins;
    }
    //#endregion

    //#region Castling
    //places where the king can be considered "castled"
    public static readonly WHITE_KINGSIDE_CASTLE_SQUARES = ["g1", "h1"];
    public static readonly WHITE_QUEENSIDE_CASTLE_SQUARES = ["a1", "b1", "c1"];
    public static readonly BLACK_KINGSIDE_CASTLE_SQUARES = ["h8", "g8"];
    public static readonly BLACK_QUEENSIDE_CASTLE_SQUARES = ["a8", "b8", "c8"]

    //White castling moves
    static readonly WHITE_KINGSIDE_CASTLE = 
    {
        kingFrom: "e1",
        kingTo: "g1",
    };

    static readonly WHITE_QUEENSIDE_CASTLE = 
    {
        kingFrom: "e1",
        kingTo: "c1",
    };

    //Black castling moves
    static readonly BLACK_KINGSIDE_CASTLE = {
        kingFrom: "e8",
        kingTo: "g8",
    };

    static readonly BLACK_QUEENSIDE_CASTLE = {
        kingFrom: "e8",
        kingTo: "c8",
    };

    //Checks if the kings are in or around the castling position.
    public static didPlayersLikelyCastle(board:Chonse2): {
        whiteKingside: boolean, 
        whiteQueenside: boolean,
        blackKingside: boolean,
        blackQueenside: boolean}
    {
        const returnObj = {whiteKingside: false, whiteQueenside: false, blackKingside: false, blackQueenside: false}

        const whiteKingCoord = board.getKingCoordinate(PieceColor.WHITE);
        const blackKingCoord = board.getKingCoordinate(PieceColor.BLACK);

        //It's impossible to have castled if castling rights are still there.
        if (!board.whiteCastlingRights.kingSide && !board.whiteCastlingRights.queenSide)
        {
            if (Chonse2Extensions.WHITE_KINGSIDE_CASTLE_SQUARES.includes(whiteKingCoord))
            {
                returnObj.whiteKingside = true;
            }

            if (Chonse2Extensions.WHITE_QUEENSIDE_CASTLE_SQUARES.includes(whiteKingCoord))
            {
                returnObj.whiteQueenside = true;
            }
        }

        if (!board.blackCastlingRights.kingSide && !board.blackCastlingRights.queenSide)
        {
            if (Chonse2Extensions.BLACK_KINGSIDE_CASTLE_SQUARES.includes(blackKingCoord))
            {
                returnObj.blackKingside = true;
            }

            if (Chonse2Extensions.BLACK_QUEENSIDE_CASTLE_SQUARES.includes(blackKingCoord))
            {
                returnObj.blackQueenside = true;
            }
        }

        return returnObj;
    }

    //If the player has castling rights, check that the squares are clear.
    public static areSquaresClearForCastlingProvidedRightsAreThere(board: Chonse2): {whiteKingside: boolean, whiteQueenside: boolean, blackKingside: boolean, blackQueenside: boolean}
    {
        const returnObj = 
        {
            whiteKingside: false,
            whiteQueenside: false,
            blackKingside: false,
            blackQueenside: false   
        };

        //white
        if (board.whiteCastlingRights.kingSide) 
        {
            // King is on e1, Rook is on h1. Squares to check: f1, g1
            const f1Clear = board.findPieceAtCoordinate(Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE) === "";
            const g1Clear = board.findPieceAtCoordinate(Chonse2.WHITE_KINGSIDE_KNIGHT_SQUARE) === "";
            
            returnObj.whiteKingside = f1Clear && g1Clear;
        }

        if (board.whiteCastlingRights.queenSide) 
        {
            // King is on e1, Rook is on a1. Squares to check: d1, c1, b1
            const d1Clear = board.findPieceAtCoordinate(Chonse2.WHITE_QUEEN_SQUARE) === "";
            const c1Clear = board.findPieceAtCoordinate(Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE) === "";
            const b1Clear = board.findPieceAtCoordinate(Chonse2.WHITE_QUEENSIDE_KNIGHT_SQUARE) === "";
            
            returnObj.whiteQueenside = d1Clear && c1Clear && b1Clear;
        }

        //black
        if (board.blackCastlingRights.kingSide) 
        {
            // King is on e8, Rook is on h8. Squares to check: f8, g8
            const f8Clear = board.findPieceAtCoordinate(Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE) === "";
            const g8Clear = board.findPieceAtCoordinate(Chonse2.BLACK_KINGSIDE_KNIGHT_SQUARE) === "";
            
            returnObj.blackKingside = f8Clear && g8Clear;
        }

        if (board.blackCastlingRights.queenSide) 
        {
            //king is on e8, Rook is on a8. Squares to check: d8, c8, b8
            const d8Clear = board.findPieceAtCoordinate(Chonse2.BLACK_QUEEN_SQUARE) === "";
            const c8Clear = board.findPieceAtCoordinate(Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE) === "";
            const b8Clear = board.findPieceAtCoordinate(Chonse2.BLACK_QUEENSIDE_KNIGHT_SQUARE) === "";
            
            returnObj.blackQueenside = d8Clear && c8Clear && b8Clear;
        }

        return returnObj;
    }

    // Checks if any enemy piece is preventing the king from castling.
    // Assumes the castling path is already clear of pieces.
    public static isEnemyPieceBlockingCastlingPath(
        board: Chonse2
    ): {
        whiteKingside: boolean,
        whiteQueenside: boolean,
        blackKingside: boolean,
        blackQueenside: boolean
    }
    {
        const clear = Chonse2Extensions.areSquaresClearForCastlingProvidedRightsAreThere(board);

        const returnObj = {
            whiteKingside: false,
            whiteQueenside: false,
            blackKingside: false,
            blackQueenside: false
        };

        if (clear.whiteKingside)
        {
            const f1Hits = board.getPiecesThatHitSquare(Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE);
            const g1Hits = board.getPiecesThatHitSquare(Chonse2.WHITE_KINGSIDE_KNIGHT_SQUARE);

            returnObj.whiteKingside =
                f1Hits.blackCoords.length > 0 ||
                g1Hits.blackCoords.length > 0;
        }

        if (clear.whiteQueenside)
        {
            const d1Hits = board.getPiecesThatHitSquare(Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE);
            const c1Hits = board.getPiecesThatHitSquare(Chonse2.WHITE_QUEENSIDE_KNIGHT_SQUARE);

            returnObj.whiteQueenside =
                d1Hits.blackCoords.length > 0 ||
                c1Hits.blackCoords.length > 0;
        }

        if (clear.blackKingside)
        {
            const f8Hits = board.getPiecesThatHitSquare(Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE);
            const g8Hits = board.getPiecesThatHitSquare(Chonse2.BLACK_KINGSIDE_KNIGHT_SQUARE);

            returnObj.blackKingside =
                f8Hits.whiteCoords.length > 0 ||
                g8Hits.whiteCoords.length > 0;
        }

        if (clear.blackQueenside)
        {
            const d8Hits = board.getPiecesThatHitSquare(Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE);
            const c8Hits = board.getPiecesThatHitSquare(Chonse2.BLACK_QUEENSIDE_KNIGHT_SQUARE);

            returnObj.blackQueenside =
                d8Hits.whiteCoords.length > 0 ||
                c8Hits.whiteCoords.length > 0;
        }

        return returnObj;
    }
    //#endregion
    
    //#region Skewers
    public static getSkewersOnBoard(board: Chonse2, optionalExistingHangingPieceArray: { white: Array<string>, black: Array<string> } | null = null): Array<Skewer>
    {
        let candidateSkewers: Array<Skewer> = [];

        //we will need to see what pieces are currently hanging so that we can make sure that the skewering attacker is not just straight up hanging.
        let hangingPieceCoords;
        if (optionalExistingHangingPieceArray == null)
        {
            hangingPieceCoords = this.getHangingPieces(board);
        }
        else 
        {
            hangingPieceCoords = optionalExistingHangingPieceArray;
        }

        //A piece can only be skewered by a bishop, a rook or a queen.
        const ATTACKER_TYPES = [PieceType.BISHOP, PieceType.ROOK, PieceType.QUEEN];

        //Will need to check all of the pieces to see which ones could be attackers.
        const pieceData = [board.getAllPiecesAndCoordsByColor(PieceColor.WHITE), board.getAllPiecesAndCoordsByColor(PieceColor.BLACK)];
        const candidateAttackers: { pieces: Array<string>, coords: Array<string> } = { pieces: [], coords: [] };

        //Check through all of the pieces and get the ones that could potentially be attackers (aka bishops, rooks, and queens which can skewer a piece).
        pieceData.forEach( collection => 
            {
                for(let i = 0; i < collection.coords.length; i++)
                {
                    const coord = collection.coords[i];
                    const piece = collection.pieces[i];
                    const lastChar = piece[piece.length - 1];

                    if (ATTACKER_TYPES.includes(lastChar))
                    {
                        candidateAttackers.pieces.push(piece);
                        candidateAttackers.coords.push(coord);
                    }
                }
            }
        )

        //Checks if the pieces are hanging.
        const nonHangingCandidateAttackers: {coords: Array<string>, pieces: Array<string>} = {coords: [], pieces: []};
        candidateAttackers.coords.forEach( (coord, idx) => 
            {
                const pieceInCoord = candidateAttackers.pieces[idx];
                const firstChar = pieceInCoord[0];

                const hangingPiecesToCheck = firstChar == PieceColor.WHITE ? hangingPieceCoords.white : hangingPieceCoords.black;

                if (!hangingPiecesToCheck.includes(coord))
                {
                    nonHangingCandidateAttackers.coords.push(coord);
                    nonHangingCandidateAttackers.pieces.push(pieceInCoord);
                }
            }
        )

        //For the remaining pieces:
        for( let i = 0; i < nonHangingCandidateAttackers.pieces.length; i++ )
        {
            //the current piece/coord data.
            const currentPiece = nonHangingCandidateAttackers.pieces[i];
            const currentCoord = nonHangingCandidateAttackers.coords[i];

            //represents what type of piece it is.
            const lastCharOfPiece = currentPiece[currentPiece.length - 1];

            //indicates the color of the piece
            const colorOfPiece: PieceColor = currentPiece[0];

            //will need to determine how exactly that piece can move depending on what it is.
            let vectorX: Array<number> = [];
            let vectorY: Array<number>  = [];

            //get the corresponding vector (diagonals for bishop, horizontal for rook, and a combination of both for queen).
            switch(lastCharOfPiece)
            {
                case PieceType.BISHOP:
                    vectorX = Chonse2._BISHOP_VECTOR_X;
                    vectorY = Chonse2._BISHOP_VECTOR_Y;
                    break;

                case PieceType.ROOK:
                    vectorX = Chonse2._ROOK_VECTOR_X;
                    vectorY = Chonse2._ROOK_VECTOR_Y;
                    break;

                case PieceType.QUEEN:
                    vectorX = Chonse2._QUEEN_KING_VECTOR_X;
                    vectorY = Chonse2._QUEEN_KING_VECTOR_Y;
            }

            //Loop through the possible vector coords
            const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(currentCoord);

            for(let offsetIndex = 0; offsetIndex < vectorX.length; offsetIndex++)
            {
                //change in x and y coordinates that will be applied as offsets.
                let dx = vectorX[offsetIndex];
                let dy = vectorY[offsetIndex];

                //cap to ensure that it cannot run longer than the chessboard itself.
                let runCount = 0;

                //Will be the higher-value target at the front of the skewer.
                let highValuePieceCoord = "";
                let highValuePieceType = "";

                for( 
                    let currentXOffset = dx, currentYOffset = dy; //starts at the places of the vector components relative to the piece.
                    runCount < Chonse2.SIZE; //ensures that it does not check outside the bounds.
                    currentXOffset += dx, currentYOffset += dy, runCount++ //keep incrementing the offsets accordingly
                )   
                {
                    //The row that contains the square that is being checked.
                    const rowInQuestion = board.pieceState[rowIndex + currentXOffset];
                    
                    if (rowInQuestion)
                    {
                        //the square that is being checked.
                        const squareInQuestionPiece = rowInQuestion[colIndex + currentYOffset];

                        if (squareInQuestionPiece != undefined)
                        {
                            //If there's nothing in that square, then this piece can't do anything.
                            if (squareInQuestionPiece == "")
                            {
                                continue;
                            }

                            const enemyPieceColor: PieceColor = colorOfPiece == PieceColor.WHITE ? PieceColor.BLACK : PieceColor.WHITE;
                            //if the piece is a friendly piece, then it's not skewering anything.
                            if (!squareInQuestionPiece.startsWith(enemyPieceColor.toString()))
                            {
                                break;
                            }

                            //if the piece is an enemy one and there is no high-value piece already, make that the skewered piece.
                            if (!highValuePieceCoord)
                            {
                                highValuePieceCoord = Chonse2.COORDS[rowIndex + currentXOffset][colIndex + currentYOffset];
                                highValuePieceType = squareInQuestionPiece;
                                //after the first piece is found, continue the loop and search for a potential piece for this one to be pinned to.
                                continue;
                            }

                            //if the skewered piece is already defined, then check if this piece is an enemy
                            const materialOfSkeweredPiece = PieceMaterial.getMaterialFromPiece(highValuePieceType);
                            const materialOfPotentialSecondPiece = PieceMaterial.getMaterialFromPiece(squareInQuestionPiece);

                            if (materialOfSkeweredPiece > materialOfPotentialSecondPiece)
                            {
                                const newSkewer = new Skewer();

                                newSkewer.attackerCoordinate = currentCoord;
                                newSkewer.highValuePieceCoordinate = highValuePieceCoord;
                                newSkewer.lowValuePieceBehindCoordinate = Chonse2.COORDS[rowIndex + currentXOffset][colIndex + currentYOffset];
                                
                                candidateSkewers.push(newSkewer);
                            }
                        }
                    }
                }
            }
        }

        //Time to check some additional edge cases

        const boardCopy = board.getFullDeepCopy();
        const turnInCurrentState = board.turn;

        //Now, need to check if the skewered high value piece or the piece behind it cannot just check the king without hanging, or move and defend both.
        candidateSkewers = candidateSkewers.filter( sk => 
            {
                const attackerPiece = board.findPieceAtCoordinate(sk.attackerCoordinate);
                const attackerColor = attackerPiece[0];

                //Sets the turn to the defender.
                attackerColor == PieceColor.WHITE ? boardCopy.turn = false : boardCopy.turn = true;

                //Gotta check each legal move for the high value piece.
                const legalMovesForHighValuePiece = boardCopy.getLegalMoves(sk.highValuePieceCoordinate);
                const legalMovesForLowValuePiece = boardCopy.getLegalMoves(sk.lowValuePieceBehindCoordinate);

                let canHighValuePieceGiveCheckWithoutHanging: boolean = false;
                let canHighValuePieceDefendWithoutHanging: boolean = false;
                let canLowValuePieceGiveCheck: boolean = false;

                //check that the high value piece can't move to either check the king without hanging or defend both pieces.
                for(let i = 0; i < legalMovesForHighValuePiece.length; i++)
                {
                    const mv = legalMovesForHighValuePiece[i];

                    const r = boardCopy.completeMove(sk.highValuePieceCoordinate, mv);
                    const isOpponentInCheck = r.notation.includes(AlgebraicNotationMaker.CHECK);

                    //if the opponent can be checked without hanging the piece, don't count this as a valid skewer.
                    if (isOpponentInCheck)
                    {
                        if (!Chonse2Extensions.doesSquareHaveHangingPiece(boardCopy,r.toCoord))
                        {
                            canHighValuePieceGiveCheckWithoutHanging = true;
                            boardCopy.undoMostRecentMove();
                            break;
                        }
                    }

                    //If both pieces could be defended, don't count this as a valid skewer.
                    const isLowerValuePieceHanging = Chonse2Extensions.doesSquareHaveHangingPiece(boardCopy,r.toCoord);
                    const isHigherValuePieceHanging = Chonse2Extensions.doesSquareHaveHangingPiece(boardCopy, sk.lowValuePieceBehindCoordinate);

                    if (!isLowerValuePieceHanging && !isHigherValuePieceHanging)
                    {
                        canHighValuePieceDefendWithoutHanging = true;
                    }

                    boardCopy.undoMostRecentMove();
                }

                //Verify that the low value piece can't check the king and escape.
                for(let i = 0; i < legalMovesForLowValuePiece.length; i++)
                {
                    const mv = legalMovesForLowValuePiece[i];

                    const r = boardCopy.completeMove(sk.lowValuePieceBehindCoordinate, mv);
                    const isOpponentInCheck = r.notation.includes(AlgebraicNotationMaker.CHECK);

                    if (isOpponentInCheck)
                    {
                        canLowValuePieceGiveCheck = true;
                        boardCopy.undoMostRecentMove();
                        break;
                    }
                    boardCopy.undoMostRecentMove();
                }

                //If the opponent can't use the high value piece to check the king without hanging it, protect both pieces, or the lower value piece can't give a check, consider it valid so far.
                return !canHighValuePieceGiveCheckWithoutHanging && !canHighValuePieceDefendWithoutHanging && !canLowValuePieceGiveCheck;
            }
        )

        //Reset the turn so that it's correct.
        boardCopy.turn = turnInCurrentState;

        //And need to check that the skewered piece is hanging without the high value piece on the board (aka that the piece can even be viably captured).
        candidateSkewers = candidateSkewers.filter( sk =>
            {
                let isLowValuePieceHanging = false;

                const highValuePiece = boardCopy.findPieceAtCoordinate(sk.highValuePieceCoordinate);

                const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(sk.highValuePieceCoordinate);

                //Temporarily remove the piece.
                boardCopy.pieceState[rowIndex][colIndex] = "";

                //check if the piece is hanging.
                isLowValuePieceHanging = Chonse2Extensions.doesSquareHaveHangingPiece(boardCopy, sk.lowValuePieceBehindCoordinate);
                
                //Put the piece back after
                boardCopy.pieceState[rowIndex][colIndex] = highValuePiece;

                //if the piece is hanging without the high value piece, it's a valid skewer.
                return isLowValuePieceHanging;
            }
        )

        //For now don't count pawns in skewers
        candidateSkewers = candidateSkewers.filter( sk => 
            {
                const lowValuePiece = boardCopy.findPieceAtCoordinate(sk.lowValuePieceBehindCoordinate);

                return lowValuePiece != PieceType.WHITE_PAWN && lowValuePiece != PieceType.BLACK_PAWN;
            }
        )

        return candidateSkewers;
    }
    //#endregion

    //#region Connecting rooks
    public static doesBoardHaveConnectedRooks(board: Chonse2):{white: boolean, black: boolean}
    {
        const returnObj = {white: false, black: false};

        //All of the pieces on the board.
        const boardData = [board.getAllPiecesAndCoordsByColor(PieceColor.WHITE), board.getAllPiecesAndCoordsByColor(PieceColor.BLACK)];
        
        //Used to differentiate different colored rooks
        const colors = [PieceColor.WHITE, PieceColor.BLACK];

        //Used to store each color
        const whiteRookCoords: Array<string> = [];
        const blackRookCoords: Array<string> = [];

        //Filter out which pieces are the rooks of each color.
        for(let cCounter = 0; cCounter < boardData.length; cCounter++)
        {
            const colorPieceData = boardData[cCounter];
            const color = colors[cCounter];
            const addToArr = color == PieceColor.WHITE ? whiteRookCoords : blackRookCoords;

            colorPieceData.coords.forEach((coord, idx) => 
                {
                    const piece = colorPieceData.pieces[idx];
                    const rookType = color == PieceColor.WHITE ? PieceType.WHITE_ROOK : PieceType.BLACK_ROOK;

                    if (piece == rookType)
                    {
                        addToArr.push(coord);
                    }
                }
            )
        }

        //black and white rook coords in array for code reuse
        const rookCoordData = [whiteRookCoords, blackRookCoords];

        //loop through both arrays
        for(let cCounter = 0; cCounter < rookCoordData.length; cCounter++)
        {
            //the specific rook coords (color) we are checking
            const rookCoords = rookCoordData[cCounter];
            const color = colors[cCounter];

            //Check through every coord of a rook.
            for(let i = 0; i < rookCoords.length; i++)
            {
                //efficiency: don't run this loop more times than necessary
                if ( color == PieceColor.WHITE ? returnObj.white : returnObj.black )
                {
                    break;
                }

                //the place where the rook is.
                const currentRookCoord = rookCoords[i];

                //every piece that can see it.
                const piecesThatHitSquare = color == PieceColor.WHITE ? board.getPiecesThatHitSquare(currentRookCoord).whitePieces : board.getPiecesThatHitSquare(currentRookCoord).blackPieces;

                //Loop through every piece that can see this rook and check if another rook (same color) can see it.
                for(let j = 0; j < piecesThatHitSquare.length; j++)
                {
                    const pieceInSquareWeAreChecking = piecesThatHitSquare[j];
                    const rookType = color == PieceColor.WHITE ? PieceType.WHITE_ROOK : PieceType.BLACK_ROOK;

                    //if a rook of the same color can see this rook, then it follows that there is at least one instance of connected rooks on the board. 
                    if (pieceInSquareWeAreChecking == rookType)
                    {
                        color == PieceColor.WHITE ? returnObj.white = true : returnObj.black = true;
                        break;
                    }
                }
            }
        }

        return returnObj;
    }
    //#endregion

    //#region Rooks on open files
    public static getOpenFilesWithRooks(board: Chonse2): { white: string[], black: string[] }
    {
        const returnObj = 
        {
            white: [] as string[],
            black: [] as string[]
        };

        const openFiles = Chonse2Extensions.getAllOpenFiles(board);

        for (const fileLetter of openFiles)
        {
            //convert file letter back to index
            const fileIndex = Chonse2.COORDS[0].findIndex(coord => coord[0] === fileLetter);

            //check through each square to see if a rook is controlling it.
            for (let rank = 0; rank < Chonse2.SIZE; rank++)
            {
                const piece = board.pieceState[rank][fileIndex];

                if (piece === PieceType.WHITE_ROOK)
                {
                    returnObj.white.push(fileLetter);
                    
                    //only one rook needs to be on the file.
                    break; 
                }

                if (piece === PieceType.BLACK_ROOK)
                {
                    returnObj.black.push(fileLetter);
                    break;
                }
            }
        }

        return returnObj;
    }
    //#endregion

    //#region Doubled pawns
    public static getDoubledPawnFiles(board: Chonse2): {white: Array<string>, black: Array<string>}
    {
        const returnObj = {white: [] as Array<string>, black: [] as Array<string>}

        //check through every file
        for(let file = 0; file < Chonse2.SIZE; file++)
        {
            let fileWhitePawnCount: number = 0;
            let fileBlackPawnCount: number = 0;
            
            for(let rank = 0; rank < Chonse2.SIZE; rank++)
            {
                const pieceInSquare = board.pieceState[rank][file];
                
                if (pieceInSquare == PieceType.WHITE_PAWN)
                {
                    fileWhitePawnCount++;
                }

                if (pieceInSquare == PieceType.BLACK_PAWN)
                {
                    fileBlackPawnCount++;
                }
            }

            const fileLetter = Chonse2.COORDS[0][file][0];

            if (fileWhitePawnCount >= 2)
            {
                returnObj.white.push(fileLetter);
            }

            if (fileBlackPawnCount >= 2)
            {
                returnObj.black.push(fileLetter);
            }
        }

        return returnObj;
    }
    //#endregion

    //#region Passed pawns
    public static getAllPassedPawns(board: Chonse2): {white: Array<string>, black: Array<string>}
    {
        //return object with the passed pawn coords. 
        const returnObj: { white: string[], black: string[] } = { white: [], black: [] };

        const allPawns = Chonse2Extensions.getAllPieceCoordsOfType(board, PieceType.PAWN);
        const whitePawns: Array<string> = allPawns.white;
        const blackPawns: Array<string> = allPawns.black;

        whitePawns.forEach( whitePawnCoord => 
            {
                const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(whitePawnCoord);

                let isPassed = true;

                //Checks through every row above that one.
                for (let r = rowIndex - 1; r >= 0 && isPassed; r--)
                {
                    //Checks through the columns to ensure that no opposing pawn can capture it or block it
                    for (let c = colIndex - 1; c <= colIndex + 1; c++)
                    {
                        if (c < 0 || c > 7) continue;

                        if (board.pieceState[r][c] === PieceType.BLACK_PAWN)
                        {
                            isPassed = false;
                            break;
                        }
                    }
                }

                if (isPassed)
                {
                    returnObj.white.push(whitePawnCoord);
                }
            }
        )

        blackPawns.forEach( blackPawnCoord => 
            {
                const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(blackPawnCoord);

                let isPassed = true;

                for (let r = rowIndex + 1; r <= 7 && isPassed; r++)
                {
                    for (let c = colIndex - 1; c <= colIndex + 1; c++)
                    {
                        if (c < 0 || c > 7) continue;

                        if (board.pieceState[r][c] === PieceType.WHITE_PAWN)
                        {
                            isPassed = false;
                            break;
                        }
                    }
                }

                if (isPassed)
                {
                    returnObj.black.push(blackPawnCoord);
                }
            }
        )

        return returnObj;
    }
    //#endregion

    //#region Piece sitting on passed pawn promotion square.
    public static getCoordsOfPiecesSittingOnPassedPawnPromotionSquares(board: Chonse2): {white: Array<string>, black: Array<string>}
    {
        const returnObj = {white: [] as Array<string>, black: [] as Array<string>}
        
        const passedPawns = Chonse2Extensions.getAllPassedPawns(board);
        
        //For each of the passed pawns, check if there is a piece of the opponent color sitting on the spot, actively preventing it from promotion.
        passedPawns.white.forEach( wppCoord => 
            {
                const {colIndex} = Chonse2.findIndexFromCoordinate(wppCoord);

                const promotionSquare = Chonse2.COORDS[0][colIndex];

                const pieceInPromotionSquare = board.findPieceAtCoordinate(promotionSquare);

                if (pieceInPromotionSquare)
                {
                    if (pieceInPromotionSquare.startsWith(PieceColor.BLACK))
                    {
                        if (!returnObj.black.includes(wppCoord))
                        {
                            returnObj.black.push(wppCoord);
                        }
                    }
                }
            }
        )

        passedPawns.black.forEach( bpp => 
            {
                const {colIndex} = Chonse2.findIndexFromCoordinate(bpp);

                const promotionSquare = Chonse2.COORDS[7][colIndex];

                const pieceInPromotionSquare = board.findPieceAtCoordinate(promotionSquare);

                if (pieceInPromotionSquare)
                {
                    if (pieceInPromotionSquare.startsWith(PieceColor.WHITE))
                    {
                        if (!returnObj.white.includes(bpp))
                        {
                            returnObj.white.push(bpp);
                        }
                    }
                }
            }
        )

        return returnObj;
    }
    //#endregion

    //#region Isolated pawns
    public static getAllIsolatedPawns(board: Chonse2): { white: Array<string>, black: Array<string> }
    {
        const returnObj = { white: [] as Array<string>, black: [] as Array<string> };
        const allPawns = Chonse2Extensions.getAllPieceCoordsOfType(board, PieceType.PAWN);

        [
            {
                pawns: allPawns.white,
                pawnType: PieceType.WHITE_PAWN,
                output: returnObj.white
            },
            {
                pawns: allPawns.black,
                pawnType: PieceType.BLACK_PAWN,
                output: returnObj.black
            }
        ].forEach(({ pawns, pawnType, output }) =>
        {
            //Check every pawn for its isolation status.
            pawns.forEach(pawnCoord =>
            {
                const { colIndex } = Chonse2.findIndexFromCoordinate(pawnCoord);

                const filesToCheck: number[] = [];

                //Ensure it doesn't check outside the chess board.
                if (colIndex - 1 >= 0)
                {
                    filesToCheck.push(colIndex - 1);
                }

                if (colIndex + 1 < Chonse2.SIZE)
                {
                    filesToCheck.push(colIndex + 1);
                }

                let nearbyFileContainsFriendlyPawn = false;

                //Verify that the left/right files contain no friendly pawns.
                for (const fileIdx of filesToCheck)
                {
                    for (let row = 0; row < Chonse2.SIZE; row++)
                    {
                        if (board.pieceState[row][fileIdx] === pawnType)
                        {
                            nearbyFileContainsFriendlyPawn = true;
                            break;
                        }
                    }

                    //If there is a friendly pawn, stop because this one isn't isolated.
                    if (nearbyFileContainsFriendlyPawn)
                    {
                        break;
                    }
                }

                //And if there is no friendly pawn on either nearby file, it's isolated.
                if (!nearbyFileContainsFriendlyPawn)
                {
                    output.push(pawnCoord);
                }
            });
        });

        return returnObj;
    }
    //#endregion
    
    //#region Pawn chain
    public static getAllPawnChainsOnBoard(board: Chonse2): { white: Array<Array<string>>, black: Array<Array<string>>, whiteAttackSquares: Array<string>,  blackAttackSquares: Array<string> }
    {
        const returnObj = 
        { 
            white: [] as Array<Array<string>>, 
            black: [] as Array<Array<string>>,
            whiteAttackSquares: [] as Array<string>,
            blackAttackSquares: [] as Array<string> 
        };

        const allPawns = Chonse2Extensions.getAllPieceCoordsOfType(board, PieceType.PAWN);

        const vectorX = Chonse2._BISHOP_VECTOR_X;
        const vectorY = Chonse2._BISHOP_VECTOR_Y;

        const MIN_PAWN_CHAIN_SIZE = 3;

        [
            {
                pawns: allPawns.white,
                pawnType: PieceType.WHITE_PAWN,
                output: returnObj.white,
                outputAttack: returnObj.whiteAttackSquares,
                trackingArr: [] as Array<string>
            },
            {
                pawns: allPawns.black,
                pawnType: PieceType.BLACK_PAWN,
                output: returnObj.black,
                outputAttack: returnObj.blackAttackSquares,
                trackingArr: [] as Array<string>
            }
        ].forEach(({ pawns, pawnType, output, outputAttack, trackingArr }) =>
        {
            //For each pawn.
            for(let i = 0; i < pawns.length; i++)
            {
                const currentPawnCoord = pawns[i];
                const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(currentPawnCoord);
                const currentPawnChain: Array<string> = [];
                currentPawnChain.push(currentPawnCoord);

                if (trackingArr.includes(currentPawnCoord))
                {
                    continue;
                }

                //For each vector branch
                for(let offsetIndex = 0; offsetIndex < vectorX.length; offsetIndex++)
                {
                    //change in x and y coordinates that will be applied as offsets.
                    let dx = vectorX[offsetIndex];
                    let dy = vectorY[offsetIndex];

                    //Ensures it can't run longer than the board.
                    let runCount = 0;

                    //For each element in that vector branch
                    for(
                        let currentXOffset = dx, currentYOffset = dy; 
                        runCount < Chonse2.SIZE;
                        currentXOffset += dx, currentYOffset += dy, runCount++
                    )
                    {
                        //the row the current square is in.
                        const rowInQuestion = board.pieceState[rowIndex + currentXOffset];

                        if (rowInQuestion)
                        {
                            //the content of the current square.
                            const squareInQuestionPiece = rowInQuestion[colIndex + currentYOffset];

                            if (squareInQuestionPiece != undefined)
                            {
                                if (squareInQuestionPiece == pawnType)
                                {
                                    const appliedRowIdx = rowIndex + currentXOffset;
                                    const appliedColIdx = colIndex + currentYOffset;

                                    const c = Chonse2.COORDS[appliedRowIdx][appliedColIdx];
                                    
                                    if (!currentPawnChain.includes(c))
                                    {
                                        currentPawnChain.push(c);
                                    }
                                }
                                else 
                                {
                                    break;
                                }
                            }
                            else 
                            {
                                break;
                            }
                        }
                    }
                }

                //We don't need to worry about a pawn chain that's too small.
                if (currentPawnChain.length >= MIN_PAWN_CHAIN_SIZE)
                {
                    //Now, compute the squares where a pawn could hit it.
                    const currentAttackSquares: Array<string> = [];
                    currentPawnChain.forEach( coord => 
                        {
                            const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(coord);

                            let attackLeftRowIndex = -1;
                            let attackLeftColIndex = -1; 
                            let attackRightRowIndex = -1;
                            let attackRightColIndex = -1;

                            //Compute the indeces of squares where the pawn threatens the structure of the chain.
                            if (pawnType == PieceType.WHITE_PAWN)
                            {
                                attackLeftRowIndex = rowIndex - 1;
                                attackLeftColIndex = colIndex - 1;
                                attackRightRowIndex = rowIndex - 1;
                                attackRightColIndex = colIndex + 1;
                            }
                            else 
                            {
                                attackLeftRowIndex = rowIndex + 1;
                                attackLeftColIndex = colIndex - 1;
                                attackRightRowIndex = rowIndex + 1;
                                attackRightColIndex = colIndex + 1;
                            }

                            //Get the actual squares themselves.
                            let leftAttackSquare = board.pieceState[attackLeftRowIndex][attackLeftColIndex];
                            let rightAttackSquare = board.pieceState[attackRightRowIndex][attackRightColIndex];

                            //If the square is outside or has a piece already in it, don't push anything.
                            if (leftAttackSquare != undefined)
                            {
                                //An attacking square is only valid if it's in the board (obviously) and there's nothing in it.
                                if (leftAttackSquare == PieceType.NONE)
                                {
                                    currentAttackSquares.push(Chonse2.COORDS[attackLeftRowIndex][attackLeftColIndex]);
                                }
                            }

                            if (rightAttackSquare != undefined)
                            {
                                if (rightAttackSquare == PieceType.NONE)
                                {
                                    currentAttackSquares.push(Chonse2.COORDS[attackRightRowIndex][attackRightColIndex]);
                                }    
                            }
                        }
                    )
                    
                    //If there's already been a pawn checked, push it so we don't check it again.
                    trackingArr.push(...currentPawnChain);

                    //Register the chain and the squares where pawns can attack it.
                    output.push(currentPawnChain);
                    outputAttack.push(...currentAttackSquares);
                }
            }

        })
        return returnObj;
    }
    //#endregion

    //#region Discovered check
    public static wasMoveDiscoveredCheck(afterState: Chonse2, move: {from: string, to: string, promotion: string}): DiscoveredCheckType
    {
        //check if move was castling move, if so return false.

        const pieceInToSquare = afterState.findPieceAtCoordinate(move.to);

        //If there's no piece here... then why the hell did you call this function.
        if (!pieceInToSquare)
        {
            return DiscoveredCheckType.None;
        }

        //Castling is not a discovered check. The rook may be the checking piece, but that is a consequence of castling rather than a discovered check.
        if (
            (pieceInToSquare === PieceType.WHITE_KING || pieceInToSquare === PieceType.BLACK_KING) &&
            (
                (move.from === Chonse2.WHITE_KING_SQUARE &&
                    (move.to === Chonse2.WHITE_KINGSIDE_KNIGHT_SQUARE ||
                    move.to === Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE)) ||
                (move.from === Chonse2.BLACK_KING_SQUARE &&
                    (move.to === Chonse2.BLACK_KINGSIDE_KNIGHT_SQUARE ||
                    move.to === Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE))
            )
        )
        {
            return DiscoveredCheckType.None;
        }

        //Will need to verify that the king is indeed in check
        const colorToVerifyIsInCheck: string = afterState.turn ? PieceColor.WHITE : PieceColor.BLACK;
        const isKingInCheck: boolean = afterState.isInCheck(colorToVerifyIsInCheck);
        if (!isKingInCheck)
        {
            return DiscoveredCheckType.None;
        }

        //If we got this far, the move was a check. Verify what pieces are actually hitting it. 
        const kingCoord: string = afterState.getKingCoordinate(colorToVerifyIsInCheck);
        const checkingData = afterState.getPiecesThatHitSquare(kingCoord);
        const checkingPieces = colorToVerifyIsInCheck == PieceColor.WHITE ? checkingData.blackPieces : checkingData.whitePieces;

        //If there is more than one piece checking the king, issa double check. 
        if (checkingPieces.length > 1)
        {
            return DiscoveredCheckType.DoubleCheck;
        }

        //There cannot be any other case than a double check or a single check.
        const checkingPieceCoords = colorToVerifyIsInCheck == PieceColor.WHITE ? checkingData.blackCoords : checkingData.whiteCoords;
        const cpc = checkingPieceCoords[0];

        //If the piece that moved was not the piece that caused the check, it's a discovered check.
        if (cpc != move.to)
        {
            return DiscoveredCheckType.SingleCheck;
        }

        //checkingPieces.length > 1;

        return DiscoveredCheckType.None;
    }
    //#endregion

    //#region Knight outpost
    public static getAllOutpostKnights(board: Chonse2): { white: string[]; black: string[] }
    {
        const knights = Chonse2Extensions.getAllPieceCoordsOfType(board, PieceType.KNIGHT);

        return {
            white: knights.white.filter(coord => this.isOutpostKnight(board, coord, true)),
            black: knights.black.filter(coord => this.isOutpostKnight(board, coord, false))
        };
    }

    private static isOutpostKnight(board: Chonse2, coord: string, isWhite: boolean): boolean
    {
        const { rowIndex, colIndex } = Chonse2.findIndexFromCoordinate(coord);

        if (!this._isInEnemyTerritory(rowIndex, isWhite))
            return false;

        if (!this._isDefendedByPawn(board, rowIndex, colIndex, isWhite))
            return false;

        if (this._canEnemyPawnAttack(board, rowIndex, colIndex, isWhite))
            return false;

        return true;
    }

    private static _isInEnemyTerritory(rowIndex: number, isWhite: boolean): boolean
    {
        return isWhite
            ? rowIndex <= 3   //White must be on ranks 5-8
            : rowIndex >= 4;  //Black must be on ranks 1-4
    }

    private static _isDefendedByPawn
    (
        board: Chonse2,
        row: number,
        col: number,
        isWhite: boolean
    ): boolean
    {
        const pawn = isWhite ? PieceType.WHITE_PAWN : PieceType.BLACK_PAWN;
        const pawnRow = isWhite ? row + 1 : row - 1;

        if (pawnRow < 0 || pawnRow > 7)
            return false;

        return (
            (col > 0 && board.pieceState[pawnRow][col - 1] === pawn) ||
            (col < 7 && board.pieceState[pawnRow][col + 1] === pawn)
        );
    }

    private static _canEnemyPawnAttack
    (
        board: Chonse2,
        row: number,
        col: number,
        isWhite: boolean
    ): boolean
    {
        const enemyPawn = isWhite ? PieceType.BLACK_PAWN : PieceType.WHITE_PAWN;

        for (const attackCol of [col - 1, col + 1])
        {
            if (attackCol < 0 || attackCol > 7)
                continue;

            if (isWhite)
            {
                for (let r = 0; r < row; r++)
                {
                    if (board.pieceState[r][attackCol] === enemyPawn)
                        return true;
                }
            }
            else
            {
                for (let r = 7; r > row; r--)
                {
                    if (board.pieceState[r][attackCol] === enemyPawn)
                        return true;
                }
            }
        }

        return false;
    }

    //#region General board state

    //All open files on a given board
    public static getAllOpenFiles(board: Chonse2): Array<string>
    {
        const openFiles: Array<string> = [];

        //check through every file
        for(let file = 0; file < Chonse2.SIZE; file++)
        {
            let fileDoesContainPawn = false;
            for(let rank = 0; rank < Chonse2.SIZE; rank++)
            {
                const pieceInSquare = board.pieceState[rank][file];
                
                //if the file contains a pawn, then it's not an open file.
                if (pieceInSquare == PieceType.WHITE_PAWN || pieceInSquare == PieceType.BLACK_PAWN)
                {
                    fileDoesContainPawn = true;
                    break;
                }
            }

            if (!fileDoesContainPawn)
            {
                const fileCoord = Chonse2.COORDS[0][file];

                //first letter of rank and file combo
                openFiles.push(fileCoord[0]);
            }
        }
        return openFiles;
    }

    public static getAllPieceCoordsOfType(board: Chonse2, pieceType: PieceType): {white: Array<string>, black: Array<string>}
    {
        const returnObj: { white: string[], black: string[] } = { white: [], black: [] };
        const allWhitePieces = board.getAllPiecesAndCoordsByColor(PieceColor.WHITE);
        const allBlackPieces = board.getAllPiecesAndCoordsByColor(PieceColor.BLACK);

        let desiredWhitePiece: PieceType = PieceType.NONE;
        if (pieceType == PieceType.PAWN || pieceType == PieceType.WHITE_PAWN || pieceType == PieceType.BLACK_PAWN)
        {
            desiredWhitePiece = PieceType.WHITE_PAWN;
        }
        else if (pieceType == PieceType.KNIGHT || pieceType == PieceType.WHITE_KNIGHT || pieceType == PieceType.BLACK_KNIGHT)
        {
            desiredWhitePiece = PieceType.WHITE_KNIGHT;
        }
        else if (pieceType == PieceType.BISHOP || pieceType == PieceType.WHITE_BISHOP || pieceType == PieceType.BLACK_BISHOP)
        {
            desiredWhitePiece = PieceType.WHITE_BISHOP;
        }
        else if (pieceType == PieceType.ROOK || pieceType == PieceType.WHITE_ROOK || pieceType == PieceType.BLACK_ROOK)
        {
            desiredWhitePiece = PieceType.WHITE_ROOK;
        }
        else if (pieceType == PieceType.QUEEN || pieceType == PieceType.WHITE_QUEEN || pieceType == PieceType.BLACK_QUEEN)
        {
            desiredWhitePiece = PieceType.WHITE_QUEEN;
        }
        else if (pieceType == PieceType.KING || pieceType == PieceType.WHITE_KING || pieceType == PieceType.BLACK_KING)
        {
            desiredWhitePiece = PieceType.WHITE_KING;
        }

        let desiredBlackPiece: PieceType = PieceType.NONE;
        if (pieceType == PieceType.PAWN || pieceType == PieceType.WHITE_PAWN || pieceType == PieceType.BLACK_PAWN)
        {
            desiredBlackPiece = PieceType.BLACK_PAWN;
        }
        else if (pieceType == PieceType.KNIGHT || pieceType == PieceType.WHITE_KNIGHT || pieceType == PieceType.BLACK_KNIGHT)
        {
            desiredBlackPiece = PieceType.BLACK_KNIGHT;
        }
        else if (pieceType == PieceType.BISHOP || pieceType == PieceType.WHITE_BISHOP || pieceType == PieceType.BLACK_BISHOP)
        {
            desiredBlackPiece = PieceType.BLACK_BISHOP;
        }
        else if (pieceType == PieceType.ROOK || pieceType == PieceType.WHITE_ROOK || pieceType == PieceType.BLACK_ROOK)
        {
            desiredBlackPiece = PieceType.BLACK_ROOK;
        }
        else if (pieceType == PieceType.QUEEN || pieceType == PieceType.WHITE_QUEEN || pieceType == PieceType.BLACK_QUEEN)
        {
            desiredBlackPiece = PieceType.BLACK_QUEEN;
        }
        else if (pieceType == PieceType.KING || pieceType == PieceType.WHITE_KING || pieceType == PieceType.BLACK_KING)
        {
            desiredBlackPiece = PieceType.BLACK_KING;
        }

        allWhitePieces.coords.forEach( (coord, idx) => 
        {
            const p = allWhitePieces.pieces[idx];
            
            if (p == desiredWhitePiece)
            {
                returnObj.white.push(coord);
            }
        } )

        allBlackPieces.coords.forEach( (coord, idx) => 
        {
            const p = allBlackPieces.pieces[idx];
            
            if (p == desiredBlackPiece)
            {
                returnObj.black.push(coord);
            }
        } );

        return returnObj;
    }
    //#endregion
}

export class Fork 
{
    attackerCoordinate: string = "";
    coordinatesAttacked: string[] = [];

    constructor(attackerCoordinate_: string, coordinatesAttacked_: string[])
    {
        this.attackerCoordinate = attackerCoordinate_;
        this.coordinatesAttacked = coordinatesAttacked_;
    }
}

export class Pin 
{
    attackerCoordinate: string = "";
    pinnedPieceCoordinate: string = "";
    highValuePieceCoordinate: string = "";
}

export class Skewer 
{
    attackerCoordinate: string = "";
    highValuePieceCoordinate: string = "";
    lowValuePieceBehindCoordinate: string = "";
}

export enum DiscoveredCheckType
{
    None,
    SingleCheck,
    DoubleCheck
}