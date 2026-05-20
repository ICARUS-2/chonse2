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
        const hits = Chonse2Extensions.getPiecesThatHitSquare(board, squareCoord);

        const attackers = pieceInSquareColor == PieceColor.WHITE ? hits.black : hits.white;
        const defenders = pieceInSquareColor == PieceColor.WHITE ? hits.white : hits.black;

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
        _: { white: Array<string>, black: Array<string> } | null = null //Array of all hanging pieces. 
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
        const allHangingPieces = _ == null ? Chonse2Extensions.getHangingPieces(boardCopy) : _;
    
        //Need to check through every piece to find which ones might be forking.
        for(let i = 0; i < piecesAndCoords.coords.length; i++)
        {
            const currentPieceCoordinate = piecesAndCoords.coords[i];

            const squareHits = this.getPiecesThatHitSquare(boardCopy, currentPieceCoordinate);
            const squareHitsToCheck = attackerColor == PieceColor.WHITE ? squareHits.black : squareHits.white;

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
                const pieceInThatCoordinate = Chonse2Extensions.findPieceAtCoordinate(boardCopy,currentLegalMove);

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
                    const pieceInCoord = Chonse2Extensions.findPieceAtCoordinate(boardCopy, coord);
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
                            const pieceInLegalMoveSpot = Chonse2Extensions.findPieceAtCoordinate(boardCopy, move);
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
                    const p = Chonse2Extensions.findPieceAtCoordinate(boardCopy, c);

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
                        const p = Chonse2Extensions.findPieceAtCoordinate(boardCopy, c);

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
                            const piecesThatHitForkedPieceSquare = Chonse2Extensions.getPiecesThatHitSquare(boardCopy, nonKingPieceCoordinate);
                            boardCopy.undoMostRecentMove();
                            const piecesDefendingForkedPieceSquare = attackerColor == PieceColor.WHITE ? piecesThatHitForkedPieceSquare.black : piecesThatHitForkedPieceSquare.white;

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

    //#region General board state
    //Gets coords of all pieces that attack/defend a given square.
    public static getPiecesThatHitSquare(board: Chonse2, square: string): {white: Array<string>, black: Array<string>} {
        const boardCopy = board.getFullDeepCopy();
        const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(square);
        const o: { white: string[], black: string[] } = { white: [], black: [] };

        const colors = [PieceColor.WHITE, PieceColor.BLACK]; 

        for (const currentColor of colors) {
            boardCopy.turn = currentColor == PieceColor.WHITE;
            
            //Enemy ghost pawn to simulate "capturing"
            boardCopy.pieceState[rowIndex][colIndex] = (currentColor === PieceColor.WHITE) ? PieceType.BLACK_PAWN : PieceType.WHITE_PAWN;

            //Loop through every single piece.
            for (let i = 0; i < Chonse2.SIZE; i++) 
            {
                for (let j = 0; j < Chonse2.SIZE; j++) 
                {
                    //The current piece we are checking
                    const piece = boardCopy.pieceState[i][j];
                    
                    //If there is no piece there, it has no legal moves.
                    if (piece === PieceType.NONE) 
                    {
                        continue
                    };

                    //Ensures only the right color is checked.
                    if (piece[0] !== currentColor) continue;

                    //Gets the coordinate for the given square.
                    const coord = Chonse2.COORDS[i][j];

                    let legalMoves: Array<string> = [];

                    //Need to check legal moves to see what squares it hits.
                    if (piece != PieceType.WHITE_KING && piece != PieceType.BLACK_KING)
                    {
                        //legalMoves = boardCopy.getLegalMoves(coord);
                        legalMoves = boardCopy._getPotentiallyLegalMoves(coord);
                    }
                    else 
                    {
                        //Circumvents the fact that the king cannot put himself in check because he could be the last defender of a piece.
                        legalMoves = boardCopy._getPotentiallyLegalKingMoves(coord, piece[0]);
                    }

                    //If the piece has the square in question as a legal move, push it.                
                    if (legalMoves.includes(square)) 
                    {
                        if (currentColor === PieceColor.WHITE) 
                        {
                            o.white.push(piece);
                        } 
                        else 
                        {
                            o.black.push(piece);
                        }
                    }
                }
            }
        }
        return o;
    }

    //Gets a piece based off the coordinates.
    public static findPieceAtCoordinate(board: Chonse2, coord: string): string
    {
        const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(coord);

        return board.pieceState[rowIndex][colIndex];
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