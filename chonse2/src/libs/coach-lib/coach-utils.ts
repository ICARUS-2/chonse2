import { Arrow, ArrowColors, ArrowContext, createArrow } from "../../app/chessboard/chessboard/arrow";
import MoveResult from "../../app/chessboard/chessboard/move-result";
import Chonse2 from "../chonse2-lib/chonse2";
import Chonse2Extensions, { Fork, Pin, Skewer } from "../chonse2-lib/extensions";
import { PieceColor } from "../chonse2-lib/piece-color";
import PieceMaterial from "../chonse2-lib/piece-material";
import { PieceType } from "../chonse2-lib/piece-type";
import { openings } from "../engine-lib/data/openings";
import { MoveClassification } from "../engine-lib/types/enums";
import { LineEval, PositionEval } from "../engine-lib/types/eval";
import CoachText from "./coach-text";
import {BLOCKED_BISHOPS, CASTLING_MOVES, CENTER_STRIKE_MOVEMENTS, CoachMiscHelpers, CoachResourceLinks, PAWN_PUSH_KING_WEAKNESSES} from "./coach-misc-helpers";
import { CoachIdea, CoachIdeaFlagType, CoachMoveFlagType, CoachResourceFlagType } from "./coach-types";
import AlgebraicNotationMaker from "../chonse2-lib/algebraic-notation-builder";
import { GameOverReason } from "../chonse2-lib/game-state";
export class CoachUtils
{
    static readonly COACH_MOVE_DELIMITER = "*";


    public static performCoachAnalysis(states: Array<Chonse2>, moves: Array<MoveResult>, evals: Array<PositionEval>, isDivergenceStack: boolean = false)
    {
        //Main state and eval stacks are always the same length, with main move stack always being one shorter.
        //Divergence state, eval, and move stacks are always the same length.

        for(let i = 0; i < states.length; i++)
        {
            //Ensures that the correct pointer is selected based on whether we are diverging (since the stack lengths are different).
            const stateStackPointer = isDivergenceStack ? i + 1 : i;
            const moveStackPointer = isDivergenceStack ? i : i - 1;
            const evalStackPointer = isDivergenceStack ? i + 1 : i;

            //The current board state.
            const state = states[stateStackPointer];

            //The current move.
            const move = moves[moveStackPointer];

            //The current evaluation of the position.
            const posEval = evals[evalStackPointer];

            //The previous evaluation/state in order for the coach to comment on misses.
            const previousState = states[stateStackPointer - 1];
            const previousPosEval = evals[evalStackPointer - 1];

            //Verifying game end conditions first. 
            if (move && state && !move.coachComment.includes(CoachUtils.COACH_MOVE_DELIMITER))
            {
                const whiteToMove = state.turn;
                const colorThatMovedText = whiteToMove ? "Black" : "White";

                //Case: Player checkmated the king.
                if (state.gameState.reason == GameOverReason.Checkmate)
                {
                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.CHECKMATE_SENTENCES, colorThatMovedText);
                    break;
                }

                if (state.gameState.reason == GameOverReason.Stalemate)
                {
                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.STALEMATE_SENTENCES, colorThatMovedText);
                    break;
                }

                if (state.gameState.reason == GameOverReason.InsufficientMaterial || 
                    state.gameState.reason == GameOverReason.ThreefoldRepetition || 
                    state.gameState.reason == GameOverReason.FiftyMoveNoPawnMovementsOrCaptures)
                {
                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.DRAW_SENTENCES, colorThatMovedText);
                    break;
                }
            }

            //Can only do analysis if all of the necessary components exist.
            if (state && move && posEval && posEval.bestMove)
            {
                //What the next best state will be.
                const nextBestMove = CoachMiscHelpers.convertUciToChonse2Move(posEval.bestMove);
                const nextBestState = state.getFullDeepCopy();
                nextBestState.completeMove(nextBestMove.fromSquare, nextBestMove.toSquare, nextBestMove.promotion);
                

                //play out the engine line
                const currentFollowUp: Array<Chonse2> = CoachMiscHelpers.getEngineLineStates(state, posEval.lines[0]);

                let previousFollowUp: Array<Chonse2> = [];

                if (previousState && previousPosEval)
                {
                    if (previousPosEval.lines[0])
                    {
                        previousFollowUp = CoachMiscHelpers.getEngineLineStates(previousState, previousPosEval.lines[0]);
                    }
                }

                //If this is a move the coach played (like a follow up), it doesn't need an evaluation since it is already the best move.
                if (move.coachComment == CoachUtils.COACH_MOVE_DELIMITER)
                {
                    continue;
                }

                const whiteToMove = state.turn;

                const colorThatMovedText = whiteToMove ? "Black" : "White";
                const oppositeColorText = whiteToMove ? "White" : "Black";

                //misc stuff that can be reused
                const allHangingPieceCoords = Chonse2Extensions.getHangingPieces(state);

                let allPreviousHangingPieceCoords:{ white: Array<string>; black: Array<string>;} | undefined = undefined
                if (previousState)
                {
                    allPreviousHangingPieceCoords = Chonse2Extensions.getHangingPieces(previousState)
                }

                //=======Exclusively opening
                if (posEval.moveClassification == MoveClassification.Opening)
                {
                    const posFen = state.getFEN().split(" ")[0];
                    const openingObj = openings.find((opening) => opening.fen === posFen);

                    if (openingObj)
                    {
                        if (openingObj.link != "")
                        {
                            move.coachResources.set( CoachResourceFlagType.Opening, openingObj.link );
                            move.coachComment+= openingObj.name + ". ";
                        }

                        if (openingObj.name.includes("Wayward Queen Attack"))
                        {
                            move.coachComment += "Developing the queen this early is potentially dangerous, as the queen can easily become a target by other minor pieces. "
                        }
                    }
                }
            
                //=======Bad
                if (posEval.moveClassification == MoveClassification.Inaccuracy ||
                    posEval.moveClassification == MoveClassification.Mistake || 
                    posEval.moveClassification == MoveClassification.Blunder ||
                    posEval.moveClassification == MoveClassification.Miss
                )
                {
                    let previousBestMove: { fromSquare: string; toSquare: string; promotion: string} | null = null;
                    let missedState: Chonse2 | null = null;

                    if (previousPosEval.bestMove && previousState)
                    {
                        previousBestMove = CoachMiscHelpers.convertUciToChonse2Move(previousPosEval.bestMove);
                        const previousStateCopy = previousState.getFullDeepCopy();
                        previousStateCopy.completeMove(previousBestMove.fromSquare, previousBestMove.toSquare, previousBestMove.promotion);  
                        missedState = previousStateCopy;
                    }
                    
                    //Case: Player leaves a piece hanging.
                    {
                        const bestMove = CoachMiscHelpers.convertUciToChonse2Move(posEval.bestMove);
                        const hangingPiecesArrToCheck = whiteToMove ? allHangingPieceCoords.black : allHangingPieceCoords.white;

                        let pieceToTake = PieceType.NONE;

                        //If there is any hanging pieces, find if the best move is to take, otherwise move on.
                        if (hangingPiecesArrToCheck.length > 0)
                        {
                            for(let i = 0; i < hangingPiecesArrToCheck.length; i++)
                            {
                                const hangingPieceCoord = hangingPiecesArrToCheck[i];
                                const hangingPiece = state.findPieceAtCoordinate(hangingPieceCoord);

                                //Stops false positive where a piece was hanging after capturing a piece equal to or greater than it in value (ex: Knight captures a bishop inaccurately, even tho it's equal in material).
                                if (hangingPieceCoord == move.toCoord)
                                {
                                    const pieceInSpotBefore = previousState.findPieceAtCoordinate(move.toCoord);
                                    if (pieceInSpotBefore)
                                    {
                                        const hangingPieceMaterial = PieceMaterial.getMaterialFromPiece(hangingPiece);
                                        const capturedPieceMaterial = PieceMaterial.getMaterialFromPiece(pieceInSpotBefore);

                                        if (capturedPieceMaterial >= hangingPieceMaterial)
                                        {
                                            break;
                                        }
                                    }
                                }

                                //If the best move in this position is to capture the vulnerable piece, have the coach say this.
                                if (bestMove.toSquare == hangingPieceCoord)
                                {
                                    pieceToTake = hangingPiece;

                                    //if player REALLY screwed up and blundered their queen.
                                    if (pieceToTake == PieceType.WHITE_QUEEN || pieceToTake == PieceType.BLACK_QUEEN)
                                    {
                                        move.coachComment += CoachText.selectAndFormatSentence(CoachText.QUEEN_BLUNDER_SENTENCES, colorThatMovedText, pieceToTake);
                                    }
                                    else 
                                    {
                                        move.coachComment += CoachText.selectAndFormatSentence(CoachText.PIECE_HANG_SENTENCES, colorThatMovedText, pieceToTake);
                                    }

                                    move.coachMoveFlags.push(CoachMoveFlagType.LeftPieceHanging);

                                    break;
                                }
                            }
                        }
                    }

                    //Case: Player allowed a skewer on their own piece.
                    {
                        if (nextBestState)
                        {
                            const currentStateSkewers = Chonse2Extensions.getSkewersOnBoard(state, allHangingPieceCoords);
                            const bestStateSkewers = Chonse2Extensions.getSkewersOnBoard(nextBestState);

                            //Opponent's available skewers.
                            const currentAttackerSkewers = currentStateSkewers.filter( sk => 
                                {
                                    const attackingPiece = state.findPieceAtCoordinate(sk.attackerCoordinate);

                                    return whiteToMove ? attackingPiece.startsWith(PieceColor.WHITE) : attackingPiece.startsWith(PieceColor.BLACK);
                                }
                            )

                            //Opponent's available skewers after having played the best move.
                            const bestStateAttackerSkewers = bestStateSkewers.filter( sk => 
                                {
                                    const attackingPiece = nextBestState.findPieceAtCoordinate(sk.attackerCoordinate);

                                    return whiteToMove ? attackingPiece.startsWith(PieceColor.WHITE) : attackingPiece.startsWith(PieceColor.BLACK);
                                }
                            )
                
                            //Check if a new skewer is introduces because of the best move.
                            if (bestStateAttackerSkewers.length > currentAttackerSkewers.length)
                            {
                                const bestMoveToCoord = nextBestMove.toSquare;
                                let bestSkewer: Skewer | null = null;

                                for(let i = 0; i < bestStateAttackerSkewers.length; i++)
                                {
                                    const sk = bestStateAttackerSkewers[i];

                                    if (sk.attackerCoordinate == bestMoveToCoord)
                                    {
                                        bestSkewer = sk;
                                    }
                                }

                                if (bestSkewer != null)
                                {
                                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.ALLOWED_SKEWER_SENTENCES, colorThatMovedText, nextBestState.findPieceAtCoordinate(bestSkewer.lowValuePieceBehindCoordinate));
                                    move.coachMoveFlags.push(CoachMoveFlagType.AllowedSkewer);

                                    const idea = new CoachIdea();

                                    const bestMoveArrow = createArrow(nextBestMove.fromSquare, nextBestMove.toSquare, ArrowColors.IDEA, ArrowContext.Coach);
                                    const skewerArrow = createArrow(bestSkewer.attackerCoordinate, bestSkewer.lowValuePieceBehindCoordinate, ArrowColors.IDEA, ArrowContext.Coach);
                                    const highlights = [bestSkewer.highValuePieceCoordinate, bestSkewer.lowValuePieceBehindCoordinate];

                                    if (bestMoveArrow)
                                    {
                                        idea.arrows.push(bestMoveArrow);
                                    }

                                    if (skewerArrow)
                                    {
                                        idea.arrows.push(skewerArrow);
                                    }

                                    idea.highlightedSquares.push(...highlights);

                                    move.coachIdeas.set(CoachIdeaFlagType.SkewerIdea, idea);
                                    move.coachResources.set(CoachResourceFlagType.Skewer, CoachResourceLinks.SKEWER_LINK);
                                }
                            }
                        }
                    }

                    //Case: Player allowed the opportunity to fork
                    {
                        if (previousState)
                        {
                            let allowedFork: boolean = false;

                            const attackerColor = whiteToMove ? PieceColor.WHITE : PieceColor.BLACK;
                            const currentForksForOpponent: Array<Fork> = Chonse2Extensions.getForksOnBoard(state, attackerColor);

                            //Subcase 1: Opponent moved one of their own pieces into a fork.
                            if (currentForksForOpponent.length > 0)
                            {
                                allowedFork = true;
                            }
                            //Subcase 2: Opponent failed to move one of their pieces out of the fork.
                            else
                            {
                                const nextBestStateForks = Chonse2Extensions.getForksOnBoard(nextBestState, attackerColor);

                                if (nextBestStateForks.length > 0)
                                {
                                    allowedFork = true;

                                    //We want to show the possible fork with the coach arrows.
                                    const arrowsArr: Array<Arrow> = [];
                                    const moveToForkArrow = createArrow(nextBestMove.fromSquare, nextBestMove.toSquare, ArrowColors.IDEA, ArrowContext.Coach);
                                    
                                    //First, add the move that the piece takes to fork the other 2+ pieces.
                                    if (moveToForkArrow)
                                    {
                                        arrowsArr.push(moveToForkArrow);
                                    }

                                    //Then, add all of the arrows to the actual forked pieces that are hit once the best move is made.
                                    for(const fork of nextBestStateForks)
                                    {
                                        const attackercoord = fork.attackerCoordinate;
                                        
                                        for(const forkedPiece of fork.coordinatesAttacked)
                                        {
                                            const newArrow = createArrow(attackercoord, forkedPiece, ArrowColors.IDEA, ArrowContext.Coach);

                                            if (newArrow)
                                            {
                                                arrowsArr.push(newArrow);
                                            }
                                        }
                                    }

                                    const coachIdea = new CoachIdea();
                                    coachIdea.arrows = arrowsArr;

                                    move.coachIdeas.set(CoachIdeaFlagType.ForkIdea, coachIdea);
                                }
                            }

                            if (allowedFork)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.ALLOWED_FORK_SENTENCES, colorThatMovedText, "");
                                move.coachMoveFlags.push(CoachMoveFlagType.AllowedFork);
                            }
                        }
                    }

                    //Case: Player allowed material loss but not necessarily hanging something 
                    {
                        if (!move.coachMoveFlags.includes(CoachMoveFlagType.LeftPieceHanging) && !move.coachMoveFlags.includes(CoachMoveFlagType.AllowedSkewer) && !move.coachMoveFlags.includes(CoachMoveFlagType.AllowedFork))
                        {
                            //what white already had before the engine line
                            const whiteCapturedBefore = currentFollowUp[0].piecesWhiteCaptured;

                            //what white had after all follow up moves were completed.
                            const whiteCapturedAfter = currentFollowUp.at(-1)?.piecesWhiteCaptured;

                            //what black already had before the engine line
                            const blackCapturedBefore = currentFollowUp[0].piecesBlackCaptured;

                            //what black had after all follow up moves were completed.
                            const blackCapturedAfter = currentFollowUp.at(-1)?.piecesBlackCaptured;


                            //Only the NEW pieces gained after this engine line.
                            const whiteNewCaptures = whiteCapturedAfter?.slice(whiteCapturedBefore.length);
                            const blackNewCaptures = blackCapturedAfter?.slice(blackCapturedBefore.length);

                            if (whiteNewCaptures && blackNewCaptures)
                            {
                                let whiteMaterialGained = 0;
                                let blackMaterialGained = 0;

                                whiteNewCaptures.forEach( capturedPiece => 
                                    {
                                        const materialValueOfCapture = PieceMaterial.getMaterialFromPiece(capturedPiece);
                                        whiteMaterialGained += materialValueOfCapture;
                                    }
                                )

                                blackNewCaptures.forEach( capturedPiece => 
                                    {
                                        const materialValueOfCapture = PieceMaterial.getMaterialFromPiece(capturedPiece);
                                        blackMaterialGained += materialValueOfCapture;
                                    }
                                )

                                //If positive: white gained. If negative: black gained.
                                const materialDifference = whiteMaterialGained - blackMaterialGained;
                                
                                //If the material difference is nonzero, then one had to have lost material during this line.
                                if (materialDifference != 0)
                                {
                                    //who gained material - capture list
                                    let gainingArray: Array<string> = [];

                                    //who lost material - capture list
                                    let losingArray: Array<string> = [];

                                    //It can't be relevant if the person moving slipped up but will still win material.
                                    let isRelevantMaterialLoss = false;

                                    //possible case 1: black just moved and white gained material.
                                    if (materialDifference > 0 && whiteToMove)
                                    {
                                        gainingArray = whiteNewCaptures;
                                        losingArray = blackNewCaptures;
                                        isRelevantMaterialLoss = true;
                                    }

                                    //possible case 2: white just moved and black gained material.
                                    if (materialDifference < 0 && !whiteToMove)
                                    {
                                        gainingArray = blackNewCaptures;
                                        losingArray = whiteNewCaptures;
                                        isRelevantMaterialLoss = true;
                                    }

                                    //If the person who moved is the one who both messed up and will be losing material, check what material they'll lose.
                                    if (isRelevantMaterialLoss)
                                    {
                                        //Now, check what material swaps are not equal
                                        for( let i = gainingArray.length - 1; i >=0; i-- )
                                        {
                                            const pieceToCheckCompensationFor = gainingArray[i];
                                            const checkedPieceMaterialValue = PieceMaterial.getMaterialFromPiece(pieceToCheckCompensationFor);

                                            const losingCompensationIdx = losingArray.findIndex( potentialCompensationPiece => PieceMaterial.getMaterialFromPiece(potentialCompensationPiece) == checkedPieceMaterialValue);

                                            if (losingCompensationIdx != -1)
                                            {
                                                gainingArray.splice(i, 1);
                                                losingArray.splice(losingCompensationIdx, 1);
                                            }
                                        }

                                        //What remains is the uncompensated material gain.
                                        let highestMaterial = 0;
                                        let highestValueUncompensatedPiece = "";

                                        for(let i = 0; i < gainingArray.length; i++)
                                        {
                                            const piece = gainingArray[i];
                                            const material = PieceMaterial.getMaterialFromPiece(piece);

                                            if (material > highestMaterial)
                                            {
                                                highestMaterial = material;
                                                highestValueUncompensatedPiece = piece;
                                            }
                                        }

                                        move.coachComment += CoachText.selectAndFormatSentence(CoachText.PIECE_LOSS_SENTENCES, colorThatMovedText, highestValueUncompensatedPiece);
                                        move.coachMoveFlags.push(CoachMoveFlagType.CausedMaterialLoss);
                                    }
                                } 
                            }
                        }
                    }

                    //Case: Player missed the opportunity to capture a hanging piece 
                    {
                        if (previousState && previousPosEval && allPreviousHangingPieceCoords != undefined)
                        {
                            if (previousPosEval.bestMove)
                            {
                                const previousHangingPiecesArrToCheck = whiteToMove ? allPreviousHangingPieceCoords.white : allPreviousHangingPieceCoords.black;
                                
                                const previousBestMove = CoachMiscHelpers.convertUciToChonse2Move(previousPosEval.bestMove);

                                //For all the previously hanging pieces, check if the previous best move was to capture it. If it was, the coach should tell them.
                                for (let i = 0; i < previousHangingPiecesArrToCheck.length; i++)
                                {
                                    const coord = previousHangingPiecesArrToCheck[i];
                                    const pieceToCapture = previousState.findPieceAtCoordinate(previousBestMove.toSquare);
                                    
                                    if (coord === previousBestMove.toSquare)
                                    {                  
                                        //Subcase 1: If they correctly captured the piece but did so with the wrong attacker.
                                        if (previousBestMove.toSquare === move.toCoord)
                                        {
                                            move.coachComment += CoachText.selectAndFormatSentence(CoachText.CAPTURED_WITH_WRONG_PIECE_SENTENCES, colorThatMovedText, pieceToCapture);
                                            move.coachMoveFlags.push(CoachMoveFlagType.CapturedPieceWithWrongAttacker);
                                        }
                                        else //Subcase 2: If they missed the capture altogether.
                                        {
                                            move.coachComment += CoachText.selectAndFormatSentence(CoachText.MISSED_HANGING_PIECE_SENTENCES, colorThatMovedText, pieceToCapture);
                                            move.coachMoveFlags.push(CoachMoveFlagType.MissedHangingPiece);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    //Case: Player missed a checkmate
                    {
                        //Can only tell if a mate was missed if we can see the previous position
                        if (previousState && previousPosEval)
                        {
                            const previousEngineLine: LineEval = previousPosEval.lines[0];
                            const currentEngineLine: LineEval = posEval.lines[0];
                            
                            if (previousEngineLine && currentEngineLine)
                            {
                                if (previousEngineLine.mate && !currentEngineLine.mate)
                                {   
                                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.MISSED_CHECKMATE_SENTENCES, colorThatMovedText, "");
                                    move.coachMoveFlags.push(CoachMoveFlagType.MissedCheckmate);
                                }
                            }
                        }
                    }

                    //Case: Player allowed checkmate inaccurately.
                    {
                        //Player allowed checkmate inaccurately if the previous position had no forced mates, the player made an inaccurate move and the resulting position has a forced mate.
                        if (previousState && previousPosEval)
                        {
                            const previousEngineLine: LineEval = previousPosEval.lines[0];
                            const currentEngineLine: LineEval = posEval.lines[0];

                            if (previousEngineLine && currentEngineLine)
                            {
                                if (!previousEngineLine.mate && currentEngineLine.mate)
                                {
                                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.ALLOWED_CHECKMATE_SENTENCES, colorThatMovedText, "");
                                    move.coachMoveFlags.push(CoachMoveFlagType.AllowedCheckmate);
                                }
                            }
                        }
                    }

                    //Case: Player missed an opportunity to fork
                    {
                        if (previousState)
                        {
                            let didMissFork: boolean = false;

                            const attackerColor = whiteToMove ? PieceColor.BLACK : PieceColor.WHITE;
                            const currentForks: Array<Fork> = Chonse2Extensions.getForksOnBoard(state, attackerColor);
                            const previousStateForks: Array<Fork> = Chonse2Extensions.getForksOnBoard(previousState, attackerColor);
                            
                            //If the person had the fork but moved the attacking piece elsewhere
                            if (currentForks.length < previousStateForks.length)
                            {
                                didMissFork = true;
                            }

                            //If the best move was to move to a position with a fork but it was overlooked
                            if (missedState)
                            {
                                const missedStateForks = Chonse2Extensions.getForksOnBoard(missedState, attackerColor);
                                
                                if (currentForks.length < missedStateForks.length)
                                {
                                    didMissFork = true;
                                }
                            }

                            if (didMissFork)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.MISSED_FORK_SENTENCES, colorThatMovedText, "");
                                move.coachMoveFlags.push(CoachMoveFlagType.MissedFork)
                            }
                        }
                    }

                    //Case: Player missed an opportunity to skewer
                    {
                        if (missedState && previousState && previousBestMove)
                        {
                            //must check if the best move in this position was to cause a skewer
                            const missedStateSkewers = Chonse2Extensions.getSkewersOnBoard(missedState);

                            let bestMoveWasToCreateSkewer = false;
                            let correspondingSkewer: Skewer | null = null;

                            //verify all the skewers that existed
                            for (const sk of missedStateSkewers)
                            {
                                //if the best move in that position was to skewer a piece, show it.
                                if (previousBestMove.toSquare == sk.attackerCoordinate)
                                {
                                    bestMoveWasToCreateSkewer = true;
                                    correspondingSkewer = sk;
                                }
                            }

                            //if it was indeed best to create a skewer, add the coach comment
                            if (bestMoveWasToCreateSkewer && correspondingSkewer != null)
                            {
                                const lowValueSkewerPiece = missedState.findPieceAtCoordinate(correspondingSkewer.lowValuePieceBehindCoordinate);
                                
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.MISSED_SKEWER_SENTENCES, colorThatMovedText, lowValueSkewerPiece);
                                move.coachMoveFlags.push(CoachMoveFlagType.MissedSkewer);
                            }
                        }
                    }

                    //Case: Missed an opportunity to pin a piece
                    {
                        if (missedState && previousState && previousBestMove)
                        {
                            //Must check if the best move in this position included pinning something
                            const missedStatePins = Chonse2Extensions.getPinsOnBoard(missedState, true);

                            let bestMoveWasToPinPiece = false;
                            let correspondingPin: Pin | null = null;

                            //Need to check over all of the pins that existed.
                            for(const pin of missedStatePins)
                            {
                                //If the best move in that position was to pin a piece, show it.
                                if (previousBestMove.toSquare == pin.attackerCoordinate)
                                {
                                    bestMoveWasToPinPiece = true;
                                    correspondingPin = pin;
                                }
                            }

                            if (bestMoveWasToPinPiece && correspondingPin != null)
                            {
                                const pinnedPiece = missedState.findPieceAtCoordinate(correspondingPin.pinnedPieceCoordinate);
                                const highValuePiece = missedState.findPieceAtCoordinate(correspondingPin.highValuePieceCoordinate);

                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.MISSED_PIN_SENTENCES, colorThatMovedText, pinnedPiece, highValuePiece);
                                move.coachMoveFlags.push(CoachMoveFlagType.MissedPin);
                            }
                        }
                    }

                    //Case: Ignored a pin on a piece and lost what was behind it
                    {
                        if (previousState)
                        {
                            //Need to check that the piece was indeed pinned before it moved.
                            const previousStatePins = Chonse2Extensions.getPinsOnBoard(previousState);

                            let ignoredPin: Pin | null = null;
                            let playerDidMovePinnedPiece = false;

                            //If the player moved a pinned piece, register it.
                            for(const pin of previousStatePins)
                            {
                                if (move.fromCoord == pin.pinnedPieceCoordinate)
                                {
                                    ignoredPin = pin;
                                    playerDidMovePinnedPiece = true;
                                }
                            }

                            //If the player indeed fucked up and ignored the pin, check that the piece is actually hanging.
                            if (ignoredPin != null && playerDidMovePinnedPiece)
                            {
                                const hangingPiecesToCheck = whiteToMove ? allHangingPieceCoords.black : allHangingPieceCoords.white;

                                //If the piece is hanging, then it's considered an inaccurately ignored pin.
                                if (hangingPiecesToCheck.includes(ignoredPin.highValuePieceCoordinate))
                                {
                                    const pinnedPiece = previousState.findPieceAtCoordinate(ignoredPin.pinnedPieceCoordinate);
                                    const highValuePiece = previousState.findPieceAtCoordinate(ignoredPin.highValuePieceCoordinate);


                                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.IGNORED_PIN_SENTENCES, colorThatMovedText, pinnedPiece, highValuePiece)
                                }
                            }
                        }
                    }

                    //Case: Missed an opportunity to castle
                    {
                        if (previousBestMove)
                        {
                            const castlingRights = whiteToMove ? previousState.blackCastlingRights : previousState.whiteCastlingRights;

                            //Via this, we will automatically know that it's the king that's supposed to move because if the king weren't on the starting square there would be no castling rights.
                            if (castlingRights.kingSide || castlingRights.queenSide)
                            {
                                const kingsideCastle = whiteToMove ? Chonse2Extensions.BLACK_KINGSIDE_CASTLE : Chonse2Extensions.WHITE_KINGSIDE_CASTLE;
                                const queensideCastle = whiteToMove ? Chonse2Extensions.BLACK_QUEENSIDE_CASTLE : Chonse2Extensions.WHITE_QUEENSIDE_CASTLE;

                                if (previousBestMove.fromSquare == kingsideCastle.kingFrom && previousBestMove.toSquare == kingsideCastle.kingTo)
                                {
                                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.MISSED_CASTLING_KINGSIDE, colorThatMovedText);
                                    move.coachMoveFlags.push(CoachMoveFlagType.MissedCastle);
                                }

                                if (previousBestMove.fromSquare == queensideCastle.kingFrom && previousBestMove.toSquare == queensideCastle.kingTo)
                                {
                                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.MISSED_CASTLING_QUEENSIDE, colorThatMovedText);
                                    move.coachMoveFlags.push(CoachMoveFlagType.MissedCastle);
                                }
                            }
                        }
                    }

                    //Case: Player missed an opportunity to connect rooks.
                    {
                        if (previousState && missedState && !move.coachMoveFlags.includes(CoachMoveFlagType.MissedCastle))
                        {
                            const currentRookState = Chonse2Extensions.doesBoardHaveConnectedRooks(state);
                            const previousRookState = Chonse2Extensions.doesBoardHaveConnectedRooks(previousState);
                            const missedRookState = Chonse2Extensions.doesBoardHaveConnectedRooks(missedState);
                        
                            const areRooksCurrentlyConnected = whiteToMove ? currentRookState.black : currentRookState.white;
                            const wereRooksPreviouslyConnected = whiteToMove ? previousRookState.black : previousRookState.white;
                            const wasBestMoveToConnectRooks = whiteToMove ? missedRookState.black : missedRookState.white;

                            //If the rooks are not currently connected but the best move involved connecting them, tell the player.
                            if (!areRooksCurrentlyConnected && !wereRooksPreviouslyConnected && wasBestMoveToConnectRooks)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.MISSED_ROOK_CONNECTION_SENTENCES, colorThatMovedText);
                            }
                        }
                    }

                    //Case: Player erroneously disconnected their rooks
                    {
                        if (previousState && missedState)
                        {
                            const currentRookState = Chonse2Extensions.doesBoardHaveConnectedRooks(state);
                            const previousRookState = Chonse2Extensions.doesBoardHaveConnectedRooks(previousState);
                            const missedRookState = Chonse2Extensions.doesBoardHaveConnectedRooks(missedState);
                        
                            const areRooksCurrentlyConnected = whiteToMove ? currentRookState.black : currentRookState.white;
                            const wereRooksPreviouslyConnected = whiteToMove ? previousRookState.black : previousRookState.white;
                            const didBestMoveInvolveKeepingRooksConnected = whiteToMove ? missedRookState.black : missedRookState.white;

                            //If the rooks are disconnected when they previously were not, and the best move did not involve disconnecting them, flag this.
                            if (!areRooksCurrentlyConnected && wereRooksPreviouslyConnected && didBestMoveInvolveKeepingRooksConnected)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.DISCONNECTED_ROOKS, colorThatMovedText);
                            }
                        }
                    }

                    //Case: Player missed development or did it wrong.
                    {
                        if (previousState && previousBestMove)
                        {
                            const knightPiece = whiteToMove ? PieceType.BLACK_KNIGHT : PieceType.WHITE_KNIGHT;
                            const bishopPiece = whiteToMove ? PieceType.BLACK_BISHOP : PieceType.WHITE_BISHOP;
                            
                            const kingsideKnightSquare = whiteToMove ? Chonse2.BLACK_KINGSIDE_KNIGHT_SQUARE : Chonse2.WHITE_KINGSIDE_KNIGHT_SQUARE;
                            const kingsideBishopSquare = whiteToMove ? Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE : Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE;
                            const queensideKnightSquare = whiteToMove ? Chonse2.BLACK_QUEENSIDE_KNIGHT_SQUARE : Chonse2.WHITE_QUEENSIDE_KNIGHT_SQUARE;
                            const queensideBishopSquare = whiteToMove ? Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE : Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE;
                        
                            let developmentPieceInQuestion = "";
                            let didPlayerMissDevelopment = false;
                            let didPlayerDevelopRightPieceButToWrongSquare = false;

                            //kingside knight
                            if (
                                previousBestMove.fromSquare == kingsideKnightSquare //Best move in previous position was to move a piece from the kingside knight square.
                                && previousState.findPieceAtCoordinate(kingsideKnightSquare) == knightPiece //Confirms that there was indeed a knight there.
                            ) 
                            {
                                //Confirms that they didn't move the knight.
                                if (move.fromCoord != kingsideKnightSquare)
                                {
                                    didPlayerMissDevelopment = true;
                                }
                                else //If they did indeed move the knight, they did it to the wrong square. 
                                {
                                    didPlayerDevelopRightPieceButToWrongSquare = true;
                                }

                                developmentPieceInQuestion = PieceType.KNIGHT;
                            }

                            //kingside bishop
                            if (
                                previousBestMove.fromSquare == kingsideBishopSquare
                                && previousState.findPieceAtCoordinate(kingsideBishopSquare) == bishopPiece
                            )
                            {
                                if (move.fromCoord != kingsideBishopSquare)
                                {
                                    didPlayerMissDevelopment = true;
                                }
                                else
                                {
                                    didPlayerDevelopRightPieceButToWrongSquare = true;
                                }

                                developmentPieceInQuestion = PieceType.BISHOP;
                            }

                            //queenside knight
                            if (
                                previousBestMove.fromSquare == queensideKnightSquare
                                && previousState.findPieceAtCoordinate(queensideKnightSquare) == knightPiece
                            )
                            {
                                if (move.fromCoord != queensideKnightSquare)
                                {
                                    didPlayerMissDevelopment = true;
                                }
                                else
                                {
                                    didPlayerDevelopRightPieceButToWrongSquare = true;
                                }

                                developmentPieceInQuestion = PieceType.KNIGHT;
                            }

                            //queenside bishop
                            if (
                                previousBestMove.fromSquare == queensideBishopSquare
                                && previousState.findPieceAtCoordinate(queensideBishopSquare) == bishopPiece
                            )
                            {
                                if (move.fromCoord != queensideBishopSquare)
                                {
                                    didPlayerMissDevelopment = true;
                                }
                                else
                                {
                                    didPlayerDevelopRightPieceButToWrongSquare = true;
                                }

                                developmentPieceInQuestion = PieceType.BISHOP;
                            }

                            //If the player did indeed make a development error, coach should flag it
                            if (developmentPieceInQuestion != "")
                            {
                                if (didPlayerMissDevelopment)
                                {
                                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.MISSED_DEVELOPMENT, colorThatMovedText, developmentPieceInQuestion);
                                    move.coachMoveFlags.push(CoachMoveFlagType.MissedDevelopment);
                                }
                                else 
                                {
                                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.INCORRECT_DEVELOPMENT, colorThatMovedText, developmentPieceInQuestion);
                                    move.coachMoveFlags.push(CoachMoveFlagType.WrongDevelopment);
                                }
                            }
                        }
                    }

                    //Case: Player should have controlled an open file with the rook.
                    {
                        if (previousState && missedState && previousBestMove)
                        {
                            //need to check if the best thing was for the person to move their rook.
                            const rookPiece = whiteToMove ? PieceType.BLACK_ROOK : PieceType.WHITE_ROOK;
                            const bestMovePiece = previousState.findPieceAtCoordinate(previousBestMove.fromSquare);
                            const movedPiece = state.findPieceAtCoordinate(move.toCoord);

                            //if the best bet was to indeed move the rook, check if it was to place it on an open file.
                            if (bestMovePiece == rookPiece)
                            {
                                //this is in case they moved the wrong rook.
                                const rookOpenFiles = Chonse2Extensions.getOpenFilesWithRooks(state);
                                const rookOpenFilesControlledByColor = whiteToMove ? rookOpenFiles.black : rookOpenFiles.white; 
                        
                                const missedRookOpenFiles = Chonse2Extensions.getOpenFilesWithRooks(missedState);
                                const missedRookOpenFilesControlledByColor = whiteToMove ? missedRookOpenFiles.black : missedRookOpenFiles.white;

                                const fromFile = previousBestMove.fromSquare[0];
                                const toFile = previousBestMove.toSquare[0];

                                //If the rook was moved to any open file (Accounts for if they took the right file with the wrong rook).
                                const wasRookMovedToOpenFile = rookOpenFilesControlledByColor.includes(move.toCoord[0]) && movedPiece == rookPiece;
                                
                                //If the rook was already on the best open file (Accounts for if they moved the rook along the file but this file if open was already the best one).
                                const wasRookPreviouslyOnBestOpenFile = bestMovePiece == rookPiece && (fromFile == toFile);
                                

                                //If the player should have moved a rook to the open file in question.
                                const wasBestMoveToPlaceRookOnOpenFile = missedRookOpenFilesControlledByColor.includes(previousBestMove.toSquare[0]);

                                if (!wasRookMovedToOpenFile && !wasRookPreviouslyOnBestOpenFile && wasBestMoveToPlaceRookOnOpenFile)
                                {
                                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.MISSED_ROOK_OPEN_FILE_SENTENCES, colorThatMovedText);
                                }
                            }
                        }
                    }

                    //Case: Player missed an opportunity to get the opponent to double pawns
                    {
                        if (previousFollowUp)
                        {
                            if (previousFollowUp.length > 1)
                            {
                                const laterMissedState = previousFollowUp[1];
                                const laterState = currentFollowUp[1];

                                const laterMissedStateDoubledPawns = Chonse2Extensions.getDoubledPawnFiles(laterMissedState);
                                const laterStateDoubledPawns = Chonse2Extensions.getDoubledPawnFiles(laterState);

                                const missDoubledPawnInstances = whiteToMove ? laterMissedStateDoubledPawns.white.length : laterMissedStateDoubledPawns.black.length;
                                const laterDoubledPawnInstances = whiteToMove ? laterStateDoubledPawns.white.length : laterMissedStateDoubledPawns.black.length;

                                //If the previously best engine line doubled the opponent's pawns but does not anymore, flag it.
                                if (missDoubledPawnInstances > laterDoubledPawnInstances)
                                {
                                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.MISSED_FORCED_DOUBLED_PAWNS, colorThatMovedText);
                                    move.coachMoveFlags.push(CoachMoveFlagType.MissedForcedPawnDoubling);
                                }
                            }
                        }
                    }

                    //Case: Player blocked their own bishop
                    {
                        const pieceThatJustMoved = state.findPieceAtCoordinate(move.toCoord);
                        let blockedBishop: string = "";

                        //If the piece that moved was a pawn, it could have blocked a bishop.
                        if (whiteToMove ? pieceThatJustMoved == PieceType.BLACK_PAWN : pieceThatJustMoved == PieceType.WHITE_PAWN)
                        {
                            // White light-squared bishop
                            if (
                                move.toCoord == BLOCKED_BISHOPS.WhiteLightSquared.pawnSquare &&
                                state.findPieceAtCoordinate(BLOCKED_BISHOPS.WhiteLightSquared.bishopSquare) == PieceType.WHITE_BISHOP
                            )
                            {
                                blockedBishop = CoachText.LIGHT_SQUARED;
                            }

                            // White dark-squared bishop
                            else if (
                                move.toCoord == BLOCKED_BISHOPS.WhiteDarkSquared.pawnSquare &&
                                state.findPieceAtCoordinate(BLOCKED_BISHOPS.WhiteDarkSquared.bishopSquare) == PieceType.WHITE_BISHOP
                            )
                            {
                                blockedBishop = CoachText.DARK_SQUARED;
                            }

                            // Black light-squared bishop
                            else if (
                                move.toCoord == BLOCKED_BISHOPS.BlackLightSquared.pawnSquare &&
                                state.findPieceAtCoordinate(BLOCKED_BISHOPS.BlackLightSquared.bishopSquare) == PieceType.BLACK_BISHOP
                            )
                            {
                                blockedBishop = CoachText.LIGHT_SQUARED;
                            }

                            // Black dark-squared bishop
                            else if (
                                move.toCoord == BLOCKED_BISHOPS.BlackDarkSquared.pawnSquare &&
                                state.findPieceAtCoordinate(BLOCKED_BISHOPS.BlackDarkSquared.bishopSquare) == PieceType.BLACK_BISHOP
                            )
                            {
                                blockedBishop = CoachText.DARK_SQUARED;
                            }
                        }

                        if (blockedBishop)
                        {
                            move.coachComment += CoachText.selectAndFormatSentence(CoachText.BLOCKED_BISHOP_SENTENCES, colorThatMovedText, blockedBishop);
                        }
                    }

                    //Case: Player created a passed pawn for the opponent
                    {
                        if (previousState && missedState)
                        {
                            const currentPassedPawns = whiteToMove ? Chonse2Extensions.getAllPassedPawns(state).white : Chonse2Extensions.getAllPassedPawns(state).black;
                            const previousPassedPawns = whiteToMove ? Chonse2Extensions.getAllPassedPawns(previousState).white : Chonse2Extensions.getAllPassedPawns(previousState).black;
                            const bestStatePassedPawns = whiteToMove ? Chonse2Extensions.getAllPassedPawns(missedState).white : Chonse2Extensions.getAllPassedPawns(missedState).black;

                            const playerCreatedPassedPawnForOpponent = currentPassedPawns.length > previousPassedPawns.length;
                            const bestMoveDidNotCreatePassedPawnForOpponent = currentPassedPawns.length > bestStatePassedPawns.length;
                        
                            if (playerCreatedPassedPawnForOpponent && bestMoveDidNotCreatePassedPawnForOpponent)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.CREATED_PASSED_PAWN_FOR_OPPONENT_SENTENCES, colorThatMovedText);
                                const idea = new CoachIdea();
                                idea.highlightedSquares = currentPassedPawns;
                                move.coachIdeas.set(CoachIdeaFlagType.PassedPawnIdea, idea);
                            }
                        }
                    }

                    //Case: Player isolated their own pawn. 
                    {
                        if (previousState && missedState)
                        {
                            const currentIsolatedPawns = whiteToMove ? Chonse2Extensions.getAllIsolatedPawns(state).black : Chonse2Extensions.getAllIsolatedPawns(state).white;
                            const prevIsolatedPawns = whiteToMove ? Chonse2Extensions.getAllIsolatedPawns(previousState).black : Chonse2Extensions.getAllIsolatedPawns(previousState).white;
                            const missedIsolatedPawns = whiteToMove ? Chonse2Extensions.getAllIsolatedPawns(missedState).black : Chonse2Extensions.getAllIsolatedPawns(missedState).white;

                            const didPlayerIsolateOwnPawn = currentIsolatedPawns.length > prevIsolatedPawns.length;
                            const didBestMoveInvolveIsolatingOwnPawn = missedIsolatedPawns.length > prevIsolatedPawns.length;

                            if (didPlayerIsolateOwnPawn && !didBestMoveInvolveIsolatingOwnPawn)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.ISOLATED_OWN_PAWN_SENTENCES, colorThatMovedText);
                                const idea = new CoachIdea();
                                idea.highlightedSquares = currentIsolatedPawns;
                                move.coachIdeas.set(CoachIdeaFlagType.IsolatedPawnIdea, idea);
                            }
                        }
                    }

                    //Case: Player weakened their king with a b or g pawn push
                    {
                        //Check who is castled.
                        const castle = Chonse2Extensions.didPlayersLikelyCastle(state);
                        const didCastleKingside = whiteToMove ? castle.blackKingside : castle.whiteKingside;
                        const didCastleQueenside = whiteToMove ? castle.blackQueenside : castle.whiteQueenside;
                        let didPawnPushWeakenKing = false;

                        //Need to establish whether the player moved a pawn.
                        const movedPiece = state.findPieceAtCoordinate(move.toCoord);
                        const pawnPiece = whiteToMove ? PieceType.BLACK_PAWN : PieceType.WHITE_PAWN;

                        //If so, check if they weakened the king.
                        if (movedPiece == pawnPiece)
                        {
                            if (didCastleKingside || didCastleQueenside)
                            {
                                //If they pushed their g pawn, tell em it weakens the king.
                                if (didCastleKingside)
                                {
                                    const kingsideWeakenedPawn = whiteToMove ? PAWN_PUSH_KING_WEAKNESSES.blackKingside : PAWN_PUSH_KING_WEAKNESSES.whiteKingside;

                                    if (move.fromCoord == kingsideWeakenedPawn && previousBestMove?.fromSquare != kingsideWeakenedPawn)
                                    {
                                        didPawnPushWeakenKing = true;
                                    }
                                }

                                //Same for the b pawn queenside.
                                if (didCastleQueenside)
                                {
                                    const queensideWeakenedPawn = whiteToMove ? PAWN_PUSH_KING_WEAKNESSES.blackQueenside : PAWN_PUSH_KING_WEAKNESSES.whiteQueenside;

                                    if (move.fromCoord == queensideWeakenedPawn && previousBestMove?.fromSquare != queensideWeakenedPawn)
                                    {
                                        didPawnPushWeakenKing = true;
                                    }
                                }
                            }

                            //If they did indeed weaken the king, flag it.
                            if (didPawnPushWeakenKing)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.WEAKENED_KING_WITH_PAWN_MOVE_SENTENCES, colorThatMovedText);
                            }
                        }

                    }

                    //Case: Player should have attacked a pawn chain
                    {
                        if (previousState && previousBestMove)
                        {
                            const movedPiece = state.findPieceAtCoordinate(move.toCoord);
                            const bestPieceToMove = previousState.findPieceAtCoordinate(previousBestMove.fromSquare);

                            const pawnChainData = Chonse2Extensions.getAllPawnChainsOnBoard(previousState);
                            const attackSquaresForPawnChain = whiteToMove ? pawnChainData.whiteAttackSquares : pawnChainData.blackAttackSquares;
                            const pawnPiece = whiteToMove ? PieceType.BLACK_PAWN : PieceType.WHITE_PAWN;

                            const didPlayerAttackPawnChain = (movedPiece == pawnPiece && attackSquaresForPawnChain.includes(move.toCoord));
                            const wasBestMoveToAttackPawnChain = (bestPieceToMove == pawnPiece && attackSquaresForPawnChain.includes(previousBestMove.toSquare))

                            //if the player outright missed the chance to attack a pawn chain.
                            if (!didPlayerAttackPawnChain && wasBestMoveToAttackPawnChain)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.MISSED_PAWN_CHAIN_ATTACK_SENTENCES, colorThatMovedText);
                                move.coachMoveFlags.push(CoachMoveFlagType.MissedPawnChainAttack);
                            }

                            //if the player had a better way to attack a pawn chain.
                            if (didPlayerAttackPawnChain && wasBestMoveToAttackPawnChain)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.WRONG_PAWN_CHAIN_ATTACK_SENTENCES, colorThatMovedText);
                                move.coachMoveFlags.push(CoachMoveFlagType.WrongPawnChainAttack);
                            }

                        }
                    }

                    //Case: Player should have struck in the center with a pawn
                    {
                        if (previousBestMove)
                        {
                            const movedPiece = state.findPieceAtCoordinate(move.toCoord);
                            const pawnPiece = whiteToMove ? PieceType.BLACK_PAWN : PieceType.WHITE_PAWN;
                            const bestPieceToMove = previousState.findPieceAtCoordinate(previousBestMove.fromSquare);
                            const centerMovements = whiteToMove ? CENTER_STRIKE_MOVEMENTS.black : CENTER_STRIKE_MOVEMENTS.white;

                            const didAttackCenter = movedPiece == pawnPiece && centerMovements.some(cm => move.fromCoord == cm.from && move.toCoord == cm.to);
                            const wasBestMoveToAttackCenter = bestPieceToMove == pawnPiece && centerMovements.some(cm => previousBestMove.fromSquare == cm.from && previousBestMove.toSquare == cm.to);
                        
                            if (wasBestMoveToAttackCenter && !didAttackCenter)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.MISSED_CENTER_STRIKE_SENTENCES, colorThatMovedText);
                            }
                        }
                    }

                    //Case: Player missed a better way to move a piece to safety
                    {
                        if (previousState && 
                            allPreviousHangingPieceCoords && 
                            missedState && 
                            !move.coachMoveFlags.includes(CoachMoveFlagType.LeftPieceHanging) && //don't care about this if they straight up hung a piece.
                            previousBestMove && //Need to know what the previous best move was.
                            !move.notation.includes(AlgebraicNotationMaker.CAPTURE) &&//The played move being a capture isn't really moving a piece to safety.
                            previousState.findPieceAtCoordinate(previousBestMove.toSquare) == "" //Same goes for prev best move.
                        )
                        {
                            const hanging = whiteToMove ? allHangingPieceCoords.black : allHangingPieceCoords.white;
                            const prevHanging = whiteToMove ? allPreviousHangingPieceCoords.black : allPreviousHangingPieceCoords.white;
                            const missedHanging = whiteToMove ? Chonse2Extensions.getHangingPieces(missedState).black : Chonse2Extensions.getHangingPieces(missedState).white

                            let didPlayerMoveHangingPiece = false;
                            let didPlayerDefendHangingPiece = false;
                            let shouldPlayerHaveMovedHangingPiece = false;
                            let shouldPlayerHaveDefendedHangingPiece = false;

                            //If the amount of hanging pieces changed in this position, check it.
                            if (hanging.length < prevHanging.length && missedHanging.length < prevHanging.length)
                            {
                                for(let i = 0; i < prevHanging.length; i++)
                                {
                                    const hpCoord = prevHanging[i];

                                    if (hpCoord == move.fromCoord)
                                    {
                                        didPlayerMoveHangingPiece = true;

                                        if (hpCoord == previousBestMove.fromSquare)
                                        {
                                            shouldPlayerHaveMovedHangingPiece = true;
                                        }
                                    }
                                }

                                if (!didPlayerMoveHangingPiece)
                                {
                                    didPlayerDefendHangingPiece = true;
                                }

                                if (!shouldPlayerHaveMovedHangingPiece)
                                {
                                    shouldPlayerHaveDefendedHangingPiece = true;
                                }
                            }

                            if (didPlayerMoveHangingPiece && shouldPlayerHaveMovedHangingPiece)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.BETTER_SAFETY_MOVE_SENTENCES, colorThatMovedText, previousState.findPieceAtCoordinate(move.fromCoord));
                                move.coachMoveFlags.push(CoachMoveFlagType.WrongHangingPieceMove)
                            }

                            if (didPlayerDefendHangingPiece && shouldPlayerHaveDefendedHangingPiece)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.BETTER_DEFEND_MOVE_SENTENCES, colorThatMovedText);
                                move.coachMoveFlags.push(CoachMoveFlagType.WrongHangingPieceDefence)
                            }
                        }
                    }
                }

                //=======Good
                if (posEval.moveClassification == MoveClassification.Excellent ||
                    posEval.moveClassification == MoveClassification.Best || 
                    posEval.moveClassification == MoveClassification.Perfect ||
                    posEval.moveClassification == MoveClassification.Okay
                )
                {   
                    //Case: Player accurately captured a piece 
                    {
                        if (move.notation.includes(AlgebraicNotationMaker.CAPTURE))
                        {
                            move.coachComment += CoachText.selectAndFormatSentence(CoachText.CAPTURE_SENTENCES, colorThatMovedText);
                        }
                    }

                    //Case: Moving toward checkmate
                    {
                        if (previousState && previousPosEval)
                        {
                            const previousEngineLine: LineEval = previousPosEval.lines[0];
                            const currentEngineLine: LineEval = posEval.lines[0];

                            if (previousEngineLine && currentEngineLine)
                            {
                                //Subcase 1: Player just found the beginning of the mating sequence.
                                if (!previousEngineLine.mate && currentEngineLine.mate)
                                {
                                    if ((whiteToMove && currentEngineLine.mate < 0) || (!whiteToMove && currentEngineLine.mate > 0 ))
                                    {
                                        move.coachComment += CoachText.selectAndFormatSentence(CoachText.FOUND_MATE_SENTENCES, colorThatMovedText, "");
                                    }
                                    else 
                                    {
                                        move.coachComment += CoachText.selectAndFormatSentence(CoachText.FOUND_MATE_SENTENCES, oppositeColorText, "");
                                    }
                                }   

                                //Subcase 2: Player is continuing the mating sequence.
                                if (previousEngineLine.mate && currentEngineLine.mate)
                                {
                                    if ((whiteToMove && currentEngineLine.mate < 0) || (!whiteToMove && currentEngineLine.mate > 0 ))
                                    {
                                        move.coachComment += CoachText.selectAndFormatSentence(CoachText.ON_ROAD_TO_CHECKMATE_SENTENCES, colorThatMovedText, "");
                                    }
                                }
                            }
                        }
                    }

                    //Case: Player made a move that gives them a fork.
                    {
                        const attackerColor = whiteToMove ? PieceColor.BLACK : PieceColor.WHITE;
                        const currentForks = Chonse2Extensions.getForksOnBoard(state, attackerColor);
                        const previousForks = Chonse2Extensions.getForksOnBoard(previousState, attackerColor);

                        let displayPiece = PieceType.NONE;
                        let displayPieceValue = 0;

                        //Goes through all of the pieces to find the second highest value pieces of each fork.
                        //Finding the highest second most valuable piece will display the guaranteed piece profit to the user.
                        if (currentForks.length > previousForks.length)
                        {
                            for(const fk of currentForks)
                            {
                                const forkedPieces = fk.coordinatesAttacked.map( c => state.findPieceAtCoordinate(c) );
                                forkedPieces.sort( (a, b) => 
                                {
                                    const materialValA = PieceMaterial.getMaterialFromPiece(a);
                                    const materialValB = PieceMaterial.getMaterialFromPiece(b);

                                    return materialValB - materialValA;
                                } )

                                //Get the second highest valued piece of this specific fork.
                                const secondHighestPiece = forkedPieces[1];
                                const secondHighestPieceMaterialValue = PieceMaterial.getMaterialFromPiece(secondHighestPiece);

                                //If it is the highest second-highest value piece, update display value.
                                if (secondHighestPieceMaterialValue > displayPieceValue)
                                {
                                    displayPiece = secondHighestPiece;
                                    displayPieceValue = secondHighestPieceMaterialValue;
                                }
                            }

                            const arrows = new Array<Arrow>();
                            for(const fk of currentForks)
                            {
                                for(const forkedPieceCoord of fk.coordinatesAttacked)
                                {
                                    const newArrow = createArrow(fk.attackerCoordinate, forkedPieceCoord, "cyan", ArrowContext.Coach);
                                    
                                    if(newArrow)
                                    {
                                        arrows.push(newArrow);
                                    }
                                }
                            }

                            const coachIdea = new CoachIdea();
                            coachIdea.arrows = arrows;

                            move.coachComment += CoachText.selectAndFormatSentence(CoachText.FOUND_FORK_SENTENCES, colorThatMovedText, displayPiece)
                            move.coachIdeas.set( CoachIdeaFlagType.ForkIdea, coachIdea );
                        }
                    }

                    //Case: Player accurately pinned a piece.
                    {
                        const pins = Chonse2Extensions.getPinsOnBoard(state, true);

                        let initiatedPin = null;

                        //Check through all of the pins on the board and if the player moved a piece to where the current attacker is, it's the pin we're dealing with.
                        for(const pin of pins)
                        {
                            if (pin.attackerCoordinate == move.toCoord)
                            {
                                initiatedPin = pin;
                            }
                        }

                        //If this is the pin the player initiated it, add it.
                        if (initiatedPin)
                        {
                            const pinnedPiece = previousState.findPieceAtCoordinate(initiatedPin.pinnedPieceCoordinate);
                            const highValuePiece = previousState.findPieceAtCoordinate(initiatedPin.highValuePieceCoordinate);

                            move.coachComment += CoachText.selectAndFormatSentence(CoachText.FOUND_PIN_SENTENCES, colorThatMovedText, pinnedPiece, highValuePiece);

                            const idea = new CoachIdea();
                            const arrow = createArrow(initiatedPin.attackerCoordinate, initiatedPin.highValuePieceCoordinate, ArrowColors.IDEA, ArrowContext.Coach);
                            if (arrow)
                            {
                                idea.arrows.push(arrow);
                            }
                            idea.highlightedSquares.push(initiatedPin.highValuePieceCoordinate);
                            idea.highlightedSquares.push(initiatedPin.pinnedPieceCoordinate);

                            move.coachIdeas.set(CoachIdeaFlagType.PinIdea, idea);
                            move.coachResources.set(CoachResourceFlagType.Pin, CoachResourceLinks.PIN_LINK);
                        }
                    }

                    //Case: Player accurately set up a skewer
                    {
                        const skewers = Chonse2Extensions.getSkewersOnBoard(state, allHangingPieceCoords);

                        let initiatedSkewer = null;

                        for(const sk of skewers)
                        {
                            if (sk.attackerCoordinate == move.toCoord)
                            {
                                initiatedSkewer = sk;
                            }
                        }

                        if (initiatedSkewer)
                        {
                            const lowValuePiece = state.findPieceAtCoordinate(initiatedSkewer.lowValuePieceBehindCoordinate);
                            
                            move.coachComment += CoachText.selectAndFormatSentence(CoachText.FOUND_SKEWER_SENTENCES, colorThatMovedText, lowValuePiece);
                        
                            const idea = new CoachIdea();

                            const skewerArrow = createArrow(initiatedSkewer.attackerCoordinate, initiatedSkewer.lowValuePieceBehindCoordinate, ArrowColors.IDEA, ArrowContext.Coach);
                            const highlights = [initiatedSkewer.highValuePieceCoordinate, initiatedSkewer.lowValuePieceBehindCoordinate];
                            
                            if (skewerArrow)
                            {
                                idea.arrows.push(skewerArrow);
                            }

                            idea.highlightedSquares.push(...highlights)

                            move.coachIdeas.set(CoachIdeaFlagType.SkewerIdea, idea);
                            move.coachResources.set(CoachResourceFlagType.Skewer, CoachResourceLinks.SKEWER_LINK);
                        }
                    }

                    //Case: Player cleared the way for castling
                    {
                        if (previousState)
                        {
                            const currentCastlingClearance = Chonse2Extensions.areSquaresClearForCastlingProvidedRightsAreThere(state);
                            const previousCastlingClearance = Chonse2Extensions.areSquaresClearForCastlingProvidedRightsAreThere(previousState);

                            const currentKingside = whiteToMove ? currentCastlingClearance.blackKingside : currentCastlingClearance.whiteKingside;
                            const currentQueenside = whiteToMove ? currentCastlingClearance.blackQueenside : currentCastlingClearance.whiteQueenside;
                            const previousKingside = whiteToMove ? previousCastlingClearance.blackKingside : previousCastlingClearance.whiteKingside;
                            const previousQueenside = whiteToMove ? previousCastlingClearance.blackQueenside : previousCastlingClearance.whiteQueenside;
                        
                            if (currentKingside && !previousKingside)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.CLEARED_CASTLING_WAY_SENTENCES, colorThatMovedText, PieceType.WHITE_KING);
                                move.coachMoveFlags.push(CoachMoveFlagType.ClearedWayToCastle);
                            }
                            
                            if (currentQueenside && !previousQueenside)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.CLEARED_CASTLING_WAY_SENTENCES, colorThatMovedText, PieceType.WHITE_QUEEN);
                                move.coachMoveFlags.push(CoachMoveFlagType.ClearedWayToCastle);
                            }
                        }
                    }

                    //Case: Player accurately castled kingside or queenside
                    {
                        //player castled somewhere
                        if (move.notation.includes(AlgebraicNotationMaker.KINGSIDE_CASTLE))
                        {
                            let opponentCastledOpposite = false;

                            //used for checking opposite side castling
                            const castleStatus = Chonse2Extensions.didPlayersLikelyCastle(state);

                            //player just castled queenside
                            if (move.notation.includes(AlgebraicNotationMaker.QUEENSIDE_CASTLE))
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.CASTLED_QUEENSIDE_SENTENCES, colorThatMovedText);

                                opponentCastledOpposite = whiteToMove ? castleStatus.whiteKingside : castleStatus.blackKingside
                            }
                            else //player just castled kingside
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.CASTLED_KINGSIDE_SENTENCES, colorThatMovedText);
                            
                                opponentCastledOpposite = whiteToMove ? castleStatus.whiteQueenside : castleStatus.blackQueenside;
                            }

                            //additional comment if they castled opposite sides.
                            if (opponentCastledOpposite)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.OPPOSITE_SIDE_CASTLING_SENTENCES, colorThatMovedText);
                            }

                            move.coachMoveFlags.push(CoachMoveFlagType.Castled);
                        }
                    }

                    //Case: Player accurately connected rooks
                    {
                        //need to make sure we can see the previous state AND that the opponent didn't just castle (since we already know from those sentences that it connects rooks).
                        if (previousState && !move.coachMoveFlags.includes(CoachMoveFlagType.Castled))
                        {
                            const currentRookState = Chonse2Extensions.doesBoardHaveConnectedRooks(state);
                            const previousRookState = Chonse2Extensions.doesBoardHaveConnectedRooks(previousState);

                            const areRooksCurrentlyConnected = whiteToMove ? currentRookState.black : currentRookState.white;
                            const wereRooksPreviouslyConnected = whiteToMove ? previousRookState.black : previousRookState.white;

                            if (!wereRooksPreviouslyConnected && areRooksCurrentlyConnected)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.CONNECTED_ROOKS_SENTENCES, colorThatMovedText);
                            }
                        }
                    }

                    //Case: Player placed a rook on an open file
                    {
                        if (previousState)
                        {
                            const hanging = whiteToMove ? allHangingPieceCoords.black : allHangingPieceCoords.white;
                            
                            //Makes sure that the piece wasn't just left hanging.
                            if (!hanging.includes(move.toCoord))
                            {
                                const pieceInToSquare = state.findPieceAtCoordinate(move.toCoord);
                                const rookPiece = whiteToMove ? PieceType.BLACK_ROOK : PieceType.WHITE_ROOK;

                                //If the player moved a rook and it wasn't hanging.
                                if (pieceInToSquare == rookPiece)
                                {
                                    //Get what open files are controlled by rooks of the color that just moved.
                                    const rookOpenFiles = Chonse2Extensions.getOpenFilesWithRooks(state);
                                    const rookOpenFilesControlledByColor = whiteToMove ? rookOpenFiles.black : rookOpenFiles.white; 
                                    
                                    //Get the same thing but for the previous state.
                                    const prevRookOpenFiles = Chonse2Extensions.getOpenFilesWithRooks(previousState);
                                    const prevRookOpenFilesControlledByColor = whiteToMove ? prevRookOpenFiles.black : prevRookOpenFiles.white;

                                    //If this rook just moved to the open file, say it.
                                    if (rookOpenFilesControlledByColor.includes(move.toCoord[0]) && !prevRookOpenFilesControlledByColor.includes(move.toCoord[0]))
                                    {
                                        //Additional check to make rook endgames not show the message too much
                                        if (rookOpenFilesControlledByColor.length > prevRookOpenFilesControlledByColor.length)
                                        {
                                            move.coachComment += CoachText.selectAndFormatSentence(CoachText.TOOK_OPEN_FILE_WITH_ROOK, colorThatMovedText);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    //Case: Player forced opponent to double pawns
                    {
                        if (currentFollowUp)
                        {
                            if (currentFollowUp.length > 1)
                            {
                                const nextPosition = currentFollowUp[1];
                                const currentDoubledPawnFiles = Chonse2Extensions.getDoubledPawnFiles(state);
                                const nextDoubledPawnFiles = Chonse2Extensions.getDoubledPawnFiles(nextPosition);

                                const opponentDoubledPawnsAmount = whiteToMove ? currentDoubledPawnFiles.white.length : currentDoubledPawnFiles.black.length;
                                const opponentNextDoubledPawnsAmount = whiteToMove ? nextDoubledPawnFiles.white.length : nextDoubledPawnFiles.black.length;

                                if (opponentNextDoubledPawnsAmount > opponentDoubledPawnsAmount)
                                {
                                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.FORCED_DOUBLING_OF_PAWNS_SENTENCES, colorThatMovedText);
                                }
                            }
                        }
                    }

                    //Case: Player created a passed pawn for themselves
                    {
                        if (previousState)
                        {
                            const currentPassedPawns = whiteToMove ? Chonse2Extensions.getAllPassedPawns(state).black : Chonse2Extensions.getAllPassedPawns(state).white;
                            const previousPassedPawns = whiteToMove ? Chonse2Extensions.getAllPassedPawns(previousState).black : Chonse2Extensions.getAllPassedPawns(previousState).white;

                            if (currentPassedPawns.length > previousPassedPawns.length)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.CREATED_PASSED_PAWN_SENTENCES, colorThatMovedText);
                                const idea = new CoachIdea();
                                idea.highlightedSquares = currentPassedPawns;
                                move.coachIdeas.set(CoachIdeaFlagType.PassedPawnIdea, idea);
                            }
                        }
                    }

                    //Case: Player sat a promotion piece on a passed pawn's promotion square
                    {
                        if (previousState)
                        {
                            const passedPawnStoppers = whiteToMove ? Chonse2Extensions.getCoordsOfPiecesSittingOnPassedPawnPromotionSquares(state).black : Chonse2Extensions.getCoordsOfPiecesSittingOnPassedPawnPromotionSquares(state).white;
                            const previousPassedPawnStoppers = whiteToMove ? Chonse2Extensions.getCoordsOfPiecesSittingOnPassedPawnPromotionSquares(previousState).black : Chonse2Extensions.getCoordsOfPiecesSittingOnPassedPawnPromotionSquares(previousState).white;
                            const toCoordPiece = state.findPieceAtCoordinate(move.toCoord);

                            if (passedPawnStoppers.length > previousPassedPawnStoppers.length)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.SAT_PIECE_ON_PROMOTION_SQUARE_SENTENCES, colorThatMovedText, toCoordPiece);
                            }
                        }
                    }

                    //Case: Player isolated an opponent's pawn
                    {
                        if (previousState)
                        {
                            const currentIsolatedPawns = Chonse2Extensions.getAllIsolatedPawns(state);
                            const prevIsolatedPawns = Chonse2Extensions.getAllIsolatedPawns(previousState)
                        
                            const opponentCurrentIsolatedPawns = whiteToMove ? currentIsolatedPawns.white : currentIsolatedPawns.black;
                            const opponentPrevIsolatedPawns = whiteToMove ? prevIsolatedPawns.white : prevIsolatedPawns.black;

                            const colorThatJustPlayedIsolatedPawns = whiteToMove ? currentIsolatedPawns.black : currentIsolatedPawns.white;
                            const colorThatJustPlayedPrevIsolatedPawns = whiteToMove ? prevIsolatedPawns.black : prevIsolatedPawns.white;

                            if ( 
                                (opponentCurrentIsolatedPawns.length > opponentPrevIsolatedPawns.length) && //if the opponent is forced to isolate
                                (colorThatJustPlayedIsolatedPawns.length <= colorThatJustPlayedPrevIsolatedPawns.length)) //AND the player that just moved is NOT.
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.ISOLATED_OPPONENT_PAWN_SENTENCES, colorThatMovedText);
                                
                                const idea = new CoachIdea();
                                idea.highlightedSquares = opponentCurrentIsolatedPawns;
                                move.coachIdeas.set(CoachIdeaFlagType.IsolatedPawnIdea, idea);
                            }
                        }
                    }

                    //Case: Player attacked a pawn chain
                    {
                        if (previousState)
                        {
                            const movedPiece = state.findPieceAtCoordinate(move.toCoord);

                            const pawnChainData = Chonse2Extensions.getAllPawnChainsOnBoard(previousState);
                            const attackSquaresForPawnChain = whiteToMove ? pawnChainData.whiteAttackSquares : pawnChainData.blackAttackSquares;
                            const pawnPiece = whiteToMove ? PieceType.BLACK_PAWN : PieceType.WHITE_PAWN;

                            const didPlayerAttackPawnChain = (movedPiece == pawnPiece && attackSquaresForPawnChain.includes(move.toCoord));

                            if (didPlayerAttackPawnChain)
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.ATTACKED_PAWN_CHAIN_SENTENCES, colorThatMovedText);
                            }
                        }

                    }

                    //Case: Player stepped in to defend a hanging piece 
                    {
                        if (previousState && allPreviousHangingPieceCoords && !move.notation.includes(AlgebraicNotationMaker.CAPTURE))
                        {
                            const hanging = whiteToMove ? allHangingPieceCoords.black : allHangingPieceCoords.white;
                            const prevHanging = whiteToMove ? allPreviousHangingPieceCoords.black : allPreviousHangingPieceCoords.white;

                            if (hanging.length < prevHanging.length)
                            {
                                let didPlayerMoveHangingPiece = false;
                                
                                for(let i = 0; i < prevHanging.length; i++)
                                {
                                    const hpCoord = prevHanging[i];

                                    if (hpCoord == move.fromCoord)
                                    {
                                        didPlayerMoveHangingPiece = true;
                                        break;
                                    }
                                }

                                //if player did not move a hanging piece, but there were less hanging pieces, the only logical explanation is that they moved a piece to defend it.
                                if (!didPlayerMoveHangingPiece)
                                {
                                    move.coachComment += CoachText.selectAndFormatSentence(CoachText.DEFENDED_HANGING_PIECE_SENTENCES, colorThatMovedText);
                                }
                                else 
                                {
                                    const pc = previousState.findPieceAtCoordinate(move.fromCoord);
                                    if (pc != PieceType.WHITE_KING && pc != PieceType.BLACK_KING)
                                    {
                                        move.coachComment += CoachText.selectAndFormatSentence(CoachText.MOVED_HANGING_PIECE_SENTENCES, colorThatMovedText, pc);   
                                    }
                                }
                            }
                        }
                    }

                    //Case: Player forced the loss of castling rights
                    {
                        if (nextBestState && nextBestMove)
                        {
                            if (CoachMiscHelpers.didForceLossOfCastlingRights(state, nextBestState, whiteToMove, nextBestMove))
                            {
                                move.coachComment += CoachText.selectAndFormatSentence(CoachText.FORCED_LOSS_OF_CASTLING_RIGHTS_SENTENCES, colorThatMovedText);
                                move.coachMoveFlags.push(CoachMoveFlagType.ForcedLossOfCastlingRights);
                            }
                        }
                    }
                }
            
                //=======Good - Development
                if (posEval.moveClassification == MoveClassification.Excellent ||
                    posEval.moveClassification == MoveClassification.Best || 
                    posEval.moveClassification == MoveClassification.Perfect ||
                    posEval.moveClassification == MoveClassification.Okay ||
                    posEval.moveClassification == MoveClassification.Opening
                )
                {
                    //Case: Player developed a knight towards the center
                    if (
                        (move.fromCoord == Chonse2.WHITE_KINGSIDE_KNIGHT_SQUARE && (move.toCoord == "f3" || move.toCoord == "e2")) ||
                        (move.fromCoord == Chonse2.WHITE_QUEENSIDE_KNIGHT_SQUARE && (move.toCoord == "c3" || move.toCoord == "d2")) || 
                        (move.fromCoord == Chonse2.BLACK_KINGSIDE_KNIGHT_SQUARE && (move.toCoord == "f6" || move.toCoord == "e7")) || 
                        (move.fromCoord == Chonse2.BLACK_QUEENSIDE_KNIGHT_SQUARE && (move.toCoord == "d7" || move.toCoord == "c6"))
                    )
                    {
                        move.coachComment += CoachText.selectAndFormatSentence(CoachText.KNIGHT_DEVELOPMENT_CENTER_CONTROL_SENTENCES, "");

                        //To evaluate central squares hit by the knight, check if the knight can move to one of them.
                        const potentiallyLegalKnightMoves = CoachMiscHelpers.getKnightSquareHits(state, move.toCoord);
                        const controlledCentralSquares: Array<string> = [];

                        Chonse2.CENTER_SQUARES.forEach( centralSquare => 
                            {
                                potentiallyLegalKnightMoves.forEach( moveSquare => 
                                    {
                                        if (centralSquare == moveSquare)
                                        {
                                            controlledCentralSquares.push(centralSquare);
                                        }
                                    }
                                )
                            }
                        )

                        //If the knight can potentially move to one of the center squares, add arrows.
                        if (controlledCentralSquares.length > 0)
                        {
                            const idea = new CoachIdea();
                            
                            controlledCentralSquares.forEach( sq =>
                                {
                                    const arrow = createArrow(move.toCoord, sq, ArrowColors.IDEA, ArrowContext.Coach);
                                    if (arrow)
                                    {
                                        idea.arrows.push(arrow);
                                    }
                                }
                            )
                            
                            move.coachIdeas.set(CoachIdeaFlagType.CentralControlIdea, idea);
                        }
                    }

                    //Case: Player moved a pawn allowing the bishop to step into the game (normal development).
                    if 
                    (
                        (
                            move.notation.startsWith(Chonse2.WHITE_KING_PAWN_SQUARE) 
                            && state.findPieceAtCoordinate(move.toCoord) == PieceType.WHITE_PAWN 
                            && state.findPieceAtCoordinate(Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE) == PieceType.WHITE_BISHOP
                        )
                        ||
                        (
                            move.notation.startsWith(Chonse2.WHITE_QUEEN_PAWN_SQUARE) 
                            && state.findPieceAtCoordinate(move.toCoord) == PieceType.WHITE_PAWN 
                            && state.findPieceAtCoordinate(Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE) == PieceType.WHITE_BISHOP
                        )
                        ||
                        (
                            move.notation.startsWith(Chonse2.BLACK_KING_PAWN_SQUARE) 
                            && state.findPieceAtCoordinate(move.toCoord) == PieceType.BLACK_PAWN 
                            && state.findPieceAtCoordinate(Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE) == PieceType.BLACK_BISHOP
                        )
                        ||
                        (
                            move.notation.startsWith(Chonse2.BLACK_QUEEN_PAWN_SQUARE) 
                            && state.findPieceAtCoordinate(move.toCoord) == PieceType.BLACK_PAWN 
                            && state.findPieceAtCoordinate(Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE) == PieceType.BLACK_BISHOP
                        )
                    )
                    {
                        //Add the comment saying they can develop the bishop.
                        move.coachComment += CoachText.selectAndFormatSentence(CoachText.PREPARES_BISHOP_FOR_DEVELOPMENT_SENTENCES, colorThatMovedText);

                        //Clones the board to check the legal moves.
                        const boardCopy = state.getFullDeepCopy();
                        boardCopy.turn = !boardCopy.turn;

                        //Get the legal moves for the bishop that just got into the game.
                        let allLegalMovesForBishop: Array<string> = [];
                        let bishopSquare = "";
                        if (boardCopy.turn)
                        {
                            if (move.notation.startsWith(Chonse2.WHITE_KING_PAWN_SQUARE))
                            {
                                bishopSquare = Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE;
                                allLegalMovesForBishop.push(...["e2", "d3", "c4", "b5", "a6"]);
                            }

                            if (move.notation.startsWith(Chonse2.WHITE_QUEEN_PAWN_SQUARE))
                            {
                                bishopSquare = Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE;
                                allLegalMovesForBishop.push(...["d2", "e3", "f4", "g5", "h6"]);
                            }
                        }
                        else 
                        {
                            if (move.notation.startsWith(Chonse2.BLACK_KING_PAWN_SQUARE))
                            {
                                bishopSquare = Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE;
                                allLegalMovesForBishop.push(...["e7", "d6", "c5", "b4", "a3"]);
                            }

                            if (move.notation.startsWith(Chonse2.BLACK_QUEEN_PAWN_SQUARE))
                            {
                                bishopSquare = Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE;
                                allLegalMovesForBishop.push(...["d7", "e6", "f5", "g4", "h3"]);
                            }
                        }

                        const idea = new CoachIdea();

                        //Need to check that the move it is suggesting doesn't just straight up hang a bishop
                        const movesThatDontHangTheBishop = allLegalMovesForBishop.filter( moveCoord => 
                            {
                                //completes the move temporarily
                                const moveResult = boardCopy.completeMove(bishopSquare, moveCoord);
                                
                                if (moveResult.result)
                                {
                                    //gets which hanging pieces it should check
                                    const hangingPieces = Chonse2Extensions.getHangingPieces(boardCopy);
                                    const hangingPiecesToCheck = boardCopy.turn ? hangingPieces.black : hangingPieces.white;

                                    //undo the move so that we don't have to deep copy the whole ass object again.
                                    boardCopy.undoMostRecentMove();

                                    //if this move hangs the bishop, don't suggest it.
                                    return !hangingPiecesToCheck.includes(moveCoord);
                                }

                                return false;
                            }
                        )

                        if (movesThatDontHangTheBishop.length > 0)
                        {
                            const arrowToCoord = movesThatDontHangTheBishop[movesThatDontHangTheBishop.length - 1];
                            const arrow = createArrow(bishopSquare, arrowToCoord, ArrowColors.IDEA, ArrowContext.Coach);

                            if (arrow)
                            {
                                idea.arrows.push(arrow);
                            }
                        }

                        //set coach idea data.
                        idea.highlightedSquares.push(...movesThatDontHangTheBishop);
                        move.coachIdeas.set(CoachIdeaFlagType.DevelopmentIdea, idea);
                    }

                    //Case: Player moved a pawn allowing the bishop to be developed (fianchetto)
                    if 
                    (
                        (
                            move.notation.startsWith(Chonse2.WHITE_KINGSIDE_KNIGHT_PAWN_SQUARE) 
                            && state.findPieceAtCoordinate(move.toCoord) == PieceType.WHITE_PAWN 
                            && state.findPieceAtCoordinate(Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE) == PieceType.WHITE_BISHOP
                        )
                        ||
                        (
                            move.notation.startsWith(Chonse2.WHITE_QUEENSIDE_KNIGHT_PAWN_SQUARE) 
                            && state.findPieceAtCoordinate(move.toCoord) == PieceType.WHITE_PAWN 
                            && state.findPieceAtCoordinate(Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE) == PieceType.WHITE_BISHOP
                        )
                        ||
                        (
                            move.notation.startsWith(Chonse2.BLACK_KINGSIDE_KNIGHT_PAWN_SQUARE) 
                            && state.findPieceAtCoordinate(move.toCoord) == PieceType.BLACK_PAWN 
                            && state.findPieceAtCoordinate(Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE) == PieceType.BLACK_BISHOP
                        )
                        ||
                        (
                            move.notation.startsWith(Chonse2.BLACK_QUEENSIDE_KNIGHT_PAWN_SQUARE) 
                            && state.findPieceAtCoordinate(move.toCoord) == PieceType.BLACK_PAWN 
                            && state.findPieceAtCoordinate(Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE) == PieceType.BLACK_BISHOP
                        )
                    )
                    {
                        move.coachComment += CoachText.selectAndFormatSentence(CoachText.PREPARES_BISHOP_FOR_FIANCHETTO_DEVELOPMENT_SENTENCES, "")

                        //Determine where the fianchetto square & bishop coord is
                        let fianchettoSquare = "";
                        let bishopSquare = "";
                        if (move.notation.startsWith(Chonse2.WHITE_KINGSIDE_KNIGHT_PAWN_SQUARE))
                        {
                            fianchettoSquare = "g2";
                            bishopSquare = Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE;
                        }

                        if (move.notation.startsWith(Chonse2.WHITE_QUEENSIDE_KNIGHT_PAWN_SQUARE))
                        {
                            fianchettoSquare = "b2"
                            bishopSquare = Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE;
                        }

                        if (move.notation.startsWith(Chonse2.BLACK_KINGSIDE_KNIGHT_PAWN_SQUARE))
                        {
                            fianchettoSquare = "g7"
                            bishopSquare = Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE;
                        }

                        if (move.notation.startsWith(Chonse2.BLACK_QUEENSIDE_KNIGHT_PAWN_SQUARE))
                        {
                            fianchettoSquare = "b7"
                            bishopSquare = Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE;
                        }

                        //then add the idea to the move.
                        const idea = new CoachIdea();
                        const arrow = createArrow(bishopSquare, fianchettoSquare, ArrowColors.IDEA, ArrowContext.Coach);

                        if (arrow)
                        {
                            idea.arrows = [arrow];
                        }

                        idea.highlightedSquares = [fianchettoSquare];
                        move.coachIdeas.set(CoachIdeaFlagType.FianchettoIdea, idea);
                    }

                    //Case: Player moved a bishop off its starting square
                    if 
                    (
                        (move.fromCoord == Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE && state.findPieceAtCoordinate(move.toCoord) == PieceType.WHITE_BISHOP) ||
                        (move.fromCoord == Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE && state.findPieceAtCoordinate(move.toCoord) == PieceType.WHITE_BISHOP ) ||
                        (move.fromCoord == Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE && state.findPieceAtCoordinate(move.toCoord) == PieceType.BLACK_BISHOP) ||
                        (move.fromCoord == Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE && state.findPieceAtCoordinate(move.toCoord) == PieceType.BLACK_BISHOP)
                    )
                    {
                        if (CoachMiscHelpers.FIANCHETTOS.includes(move.toCoord))
                        {
                            move.coachComment += CoachText.selectAndFormatSentence(CoachText.BISHOP_FIANCHETTOED_SENTENCES, colorThatMovedText);
                        }
                        else 
                        {
                            move.coachComment += CoachText.selectAndFormatSentence(CoachText.BISHOP_DEVELOPED_SENTENCES, colorThatMovedText);
                        }
                    }
                }


                //=======Luminous
                if (posEval.moveClassification == MoveClassification.Luminous)
                {
                    const hungPiece = state.findPieceAtCoordinate(move.toCoord);
                    const luminousSentences = CoachText.BASE_SENTENCES.get(MoveClassification.Luminous);

                    if (luminousSentences)
                    {
                        let sentence = CoachText.selectAndFormatSentence(luminousSentences, colorThatMovedText, hungPiece);

                        if (sentence.includes("And"))
                        {
                            sentence = sentence.replace("rook", "ROOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOK");
                        }

                        move.coachComment += sentence;
                    }
                }

                if (move.coachComment == "")
                {
                    move.coachComment = CoachText.getBaseSentence(posEval.moveClassification ?? MoveClassification.None).replace(CoachText.TURN_PLACEHOLDER, colorThatMovedText);
                }
            }
        }
    }


}


//#endregion

