import { Arrow, ArrowColors, ArrowContext, createArrow } from "../../app/chessboard/chessboard/arrow";
import MoveResult from "../../app/chessboard/chessboard/move-result";
import Chonse2 from "../chonse2-lib/chonse2";
import Chonse2Extensions, { Fork, Pin } from "../chonse2-lib/extensions";
import { PieceColor } from "../chonse2-lib/piece-color";
import PieceMaterial from "../chonse2-lib/piece-material";
import { PieceType } from "../chonse2-lib/piece-type";
import { openings } from "../engine-lib/data/openings";
import { MoveClassification } from "../engine-lib/types/enums";
import { LineEval, PositionEval } from "../engine-lib/types/eval";

export class CoachUtils
{
    //#region Static text data
    static readonly COACH_MOVE_DELIMITER = "*";
    static readonly TURN_PLACEHOLDER = "{turn}";
    static readonly PIECE_PLACEHOLDER = "{piece}";
    static readonly SECONDARY_PIECE_PLACEHOLDER = "{piece2}";

    //At minimum one sentence should be displayed.
    private static readonly BASE_SENTENCES: Map<MoveClassification, string[]> = new Map<MoveClassification, string[]>(
        [
            //Luminous moves.
            [MoveClassification.Luminous, 
                [
                    `Well done, a luminous sacrifice!`,
                    `A luminous sacrifice. Leaving that piece hanging will improve the position. I see what ${this.TURN_PLACEHOLDER} is trying to do here. `
                ]
            ],

            //Perfect moves.
            [MoveClassification.Perfect, 
                [
                    `There was one good move and ${this.TURN_PLACEHOLDER} found it! `
                ]
            ],

            //Best moves.
            [
                MoveClassification.Best,
                [
                    "Right on target. ",
                    "Best move! ",
                    `${this.TURN_PLACEHOLDER} found the top move! `
                ]
            ],

            //Excellent moves.
            [
                MoveClassification.Excellent,
                [
                    "This is a great move! ",
                    "Well done, an excellent move. "
                ]
            ],

            //Okay moves
            [
                MoveClassification.Okay,
                [
                    `Okay move, but ${this.TURN_PLACEHOLDER} had a better one. `,
                    `This is decent, but not what I would have played. `
                ]
            ],

            //Inaccuracies
            [
                MoveClassification.Inaccuracy,
                [
                    `${this.TURN_PLACEHOLDER} had a chance to play something better. `,
                    `${this.TURN_PLACEHOLDER} didn't find the right idea here. `
                ]
            ],

            //Mistakes
            [
                MoveClassification.Mistake,
                [
                    `Hmm, this seems like an error to me. `,
                    `Oh my god, ${this.TURN_PLACEHOLDER} made a mistake. `
                ]
            ],

            //Blunders
            [
                MoveClassification.Blunder, 
                [
                    `${this.TURN_PLACEHOLDER} just made a blunder. `,
                    `This move is going to cost ${this.TURN_PLACEHOLDER}. `
                ]
            ],

            [
                MoveClassification.Miss,
                [
                    `${this.TURN_PLACEHOLDER} missed the chance to capitalize on the opponent's hang, not taking enough time to spot it. `,
                    `The opponent slipped up and hung a piece, but ${this.TURN_PLACEHOLDER} overlooked it. `
                ]
            ],

            //Forced
            [
                MoveClassification.Forced,
                [
                    `This was the only move. `
                ]
            ],

            //Opening 
            [
                MoveClassification.Opening,
                [
                    ""
                ]
            ],
            
            //None
            [
                MoveClassification.None,
                [
                    ""
                ]
            ]
        ]
    )

    //#region Bad=============
    //If the player just hung a piece.
    private static readonly PIECE_HANG_SENTENCES: Array<string> = 
    [
        `OUCH, ${CoachUtils.TURN_PLACEHOLDER} left their ${CoachUtils.PIECE_PLACEHOLDER} hanging! `,
        `Whoopsie, ${CoachUtils.TURN_PLACEHOLDER} gave up a ${CoachUtils.PIECE_PLACEHOLDER}! `,
        `This move loses a ${CoachUtils.PIECE_PLACEHOLDER}. `
    ];

    //If the player missed the opportunity to capture a vulnerable piece
    private static readonly MISSED_HANGING_PIECE_SENTENCES: Array<string> =
    [
        `${CoachUtils.TURN_PLACEHOLDER} missed an opportunity to capture a free ${CoachUtils.PIECE_PLACEHOLDER}. `,
        `The best bet here was to capture a vulnerable ${CoachUtils.PIECE_PLACEHOLDER}. `
    ];

    //If the player correctly identifies the best capture but did so with the wrong piece.
    private static readonly CAPTURED_WITH_WRONG_PIECE_SENTENCES: Array<string> = 
    [
        `${CoachUtils.TURN_PLACEHOLDER} correctly captured the piece, but with the wrong attacker. `,
        `The correct capture was identified, but the best bet was to capture the ${CoachUtils.PIECE_PLACEHOLDER} with a different piece. `
    ]

    //If the player had a viable checkmate but missed it.
    private static readonly MISSED_CHECKMATE_SENTENCES: Array<string> = 
    [
        `This misses an opportunity to checkmate the king. `,
        `${CoachUtils.TURN_PLACEHOLDER} had an opportunity to checkmate the king. `,
        `There was an opportunity to force checkmate, but ${CoachUtils.TURN_PLACEHOLDER} overlooked it. `
    ];

    //If the opponent had a good move but instead allowed forced mate by mistake.
    private static readonly ALLOWED_CHECKMATE_SENTENCES: Array<string> = 
    [
        `This allows the opponent to checkmate the king. `,
        `${CoachUtils.TURN_PLACEHOLDER} just allowed the opponent to force checkmate. `,
        `${CoachUtils.TURN_PLACEHOLDER} slipped up, allowing the opponent to force checkmate with correct play. `
    ];

    //If the opponent missed an opportunity to fork two+ pieces.
    private static readonly MISSED_FORK_SENTENCES: Array<string> =
    [
        `${CoachUtils.TURN_PLACEHOLDER} just missed an opportunity to win material through a fork. `
    ];

    //Allowed an opponent to fork them.
    private static readonly ALLOWED_FORK_SENTENCES: Array<string> = 
    [
        `This allows the opponent to win material through a fork. `,
        `${CoachUtils.TURN_PLACEHOLDER} just allowed their own piece to get forked. `
    ]

    //Missed the opportunity to pin a piece
    private static readonly MISSED_PIN_SENTENCES = 
    [
        `${CoachUtils.TURN_PLACEHOLDER} has missed an opportunity to pin a ${CoachUtils.PIECE_PLACEHOLDER} to the ${CoachUtils.SECONDARY_PIECE_PLACEHOLDER}. `,
        `The best move for ${CoachUtils.TURN_PLACEHOLDER} was to cut the mobility of the opponent's ${CoachUtils.PIECE_PLACEHOLDER} by pinning it to the ${CoachUtils.SECONDARY_PIECE_PLACEHOLDER}. `
    ]

    //Ignored a relative pin
    private static readonly IGNORED_PIN_SENTENCES = 
    [
        `${CoachUtils.TURN_PLACEHOLDER} completely ignored the pin of their ${CoachUtils.PIECE_PLACEHOLDER}, and now their ${CoachUtils.SECONDARY_PIECE_PLACEHOLDER} is lost. `,
        `${CoachUtils.TURN_PLACEHOLDER} didn't notice their ${CoachUtils.PIECE_PLACEHOLDER} was pinned, exposing the ${CoachUtils.SECONDARY_PIECE_PLACEHOLDER} behind it. `
    ]
    //#endregion

    //#region Good============
    //Player accurately found a mating sequence.
    private static readonly FOUND_MATE_SENTENCES: Array<string> = 
    [
        `${CoachUtils.TURN_PLACEHOLDER} can now force checkmate with correct play. `,
        `${CoachUtils.TURN_PLACEHOLDER} will checkmate the opponent if they find the right moves. `
    ];

    //Player is continuing mating sequence.
    private static readonly ON_ROAD_TO_CHECKMATE_SENTENCES: Array<string> = 
    [
        `${CoachUtils.TURN_PLACEHOLDER} is still on the road to checkmate. `,
    ];

    //Player has positioned a piece to win material through a fork.
    private static readonly FOUND_FORK_SENTENCES: Array<string> = 
    [
        `${CoachUtils.TURN_PLACEHOLDER} is able to pick up a ${CoachUtils.PIECE_PLACEHOLDER} with that fork. `,
        `${CoachUtils.TURN_PLACEHOLDER} can now win a ${CoachUtils.PIECE_PLACEHOLDER} with that fork. `,
    ]

    //Player has pinned a piece.
    private static readonly FOUND_PIN_SENTENCES: Array<string> = 
    [
        `This is a good move as it pins a ${CoachUtils.PIECE_PLACEHOLDER} to the ${CoachUtils.SECONDARY_PIECE_PLACEHOLDER}, restricting its control over further squares. `,
        `The opponent will have to watch the pin on their ${CoachUtils.PIECE_PLACEHOLDER}. `,
        `${CoachUtils.TURN_PLACEHOLDER} just pinned the ${CoachUtils.PIECE_PLACEHOLDER} to the ${CoachUtils.SECONDARY_PIECE_PLACEHOLDER}, restricting its mobility. `
    ]
    //#endregion
    
    //#region Good (development)
    private static readonly PREPARES_BISHOP_FOR_DEVELOPMENT_SENTENCES: Array<string> = 
    [
        "This move prepares a bishop for development. ",
        "This move prepares the bishop to become active. ",
        "Moving the pawn allowing the bishop to step into the action. "
    ]

    private static readonly PREPARES_BISHOP_FOR_FIANCHETTO_DEVELOPMENT_SENTENCES: Array<string> = 
    [
        "This prepares the bishop for a fianchetto to control the main diagonal. ",
        "Opens their bishop up for a fianchetto move to exert pressure on the long diagonal. "
    ]

    private static readonly BISHOP_DEVELOPED_SENTENCES: Array<string> = 
    [
        `${this.TURN_PLACEHOLDER} develops their bishop off its starting square. `,
        `Their bishop comes into play, joining the action. `,
        `${this.TURN_PLACEHOLDER} activates their bishop to control surrounding squares. `,
        `The bishop comes into play to control the diagonals. `
    ]

    private static readonly BISHOP_FIANCHETTOED_SENTENCES: Array<string> = 
    [
        `${this.TURN_PLACEHOLDER} fianchettoed their bishop in order to snipe enemy pieces from a distance. `,
        `This fianchettos the bishop on the long diagonal, prioritizing long-range effectiveness. `,
        `Fianchettoing their bishop, putting pressure on the main diagonal. `
    ]

    private static readonly KNIGHT_DEVELOPMENT_CENTER_CONTROL_SENTENCES: Array<string> = 
    [
        "This brings the knight into play and increases influence in the center. ",
        "This move develops the knight and pressures key squares in the center. ",
        "The knight is brought into play, eyeing the central squares.",
        "This aims to control central space with the knight. ",
        "The knight is moved to an active square, strengthening control over the center. ",
        "Develops the knight and attacks the center. "
    ]
    //#endregion 

    //#endregion


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

            // if (isDivergenceStack)
            // {
            //     console.log(states);
            //     console.log(evals);
            //     console.log(moves);
            // }

            //Can only do analysis if all of the necessary components exist.
            if (state && move && posEval && posEval.bestMove)
            {
                //What the next best state will be.
                const nextBestMove = CoachUtils.convertUciToChonse2Move(posEval.bestMove);
                const nextBestState = state.getFullDeepCopy();
                nextBestState.completeMove(nextBestMove.fromSquare, nextBestMove.toSquare, nextBestMove.promotion);

                //If this is a move the coach played (like a follow up), it doesn't need an evaluation since it is already the best move.
                if (move.coachComment == CoachUtils.COACH_MOVE_DELIMITER)
                {
                    continue;
                }

                const whiteToMove = state.turn;

                const colorThatMovedText = whiteToMove ? "Black" : "White";
                const oppositeColorText = whiteToMove ? "White" : "Black";

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
                    const allHangingPieceCoords = Chonse2Extensions.getHangingPieces(state);
                    let previousBestMove: { fromSquare: string; toSquare: string; promotion: string} | null = null;
                    let missedState: Chonse2 | null = null;

                    if (previousPosEval.bestMove && previousState)
                    {
                        previousBestMove = CoachUtils.convertUciToChonse2Move(previousPosEval.bestMove);
                        const previousStateCopy = previousState.getFullDeepCopy();
                        previousStateCopy.completeMove(previousBestMove.fromSquare, previousBestMove.toSquare, previousBestMove.promotion);  
                        missedState = previousStateCopy;
                    }
                    
                    //Case: Player leaves a piece hanging.
                    {
                        const bestMove = CoachUtils.convertUciToChonse2Move(posEval.bestMove);
                        const hangingPiecesArrToCheck = whiteToMove ? allHangingPieceCoords.black : allHangingPieceCoords.white;

                        let pieceToTake = PieceType.NONE;

                        //If there is any hanging pieces, find if the best move is to take, otherwise move on.
                        if (hangingPiecesArrToCheck.length > 0)
                        {
                            for(let i = 0; i < hangingPiecesArrToCheck.length; i++)
                            {
                                const hangingPieceCoord = hangingPiecesArrToCheck[i];
                                const hangingPiece = Chonse2Extensions.findPieceAtCoordinate(state, hangingPieceCoord);

                                //If the best move in this position is to capture the vulnerable piece, have the coach say this.
                                if (bestMove.toSquare == hangingPieceCoord)
                                {
                                    pieceToTake = hangingPiece;

                                    move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.PIECE_HANG_SENTENCES, colorThatMovedText, pieceToTake);
                                    move.coachMoveFlags.push(CoachMoveFlagType.LeftPieceHanging);

                                    break;
                                }
                            }
                        }
                    }

                    //Case: Player missed the opportunity to capture a hanging piece 
                    {
                        if (previousState && previousPosEval)
                        {
                            if (previousPosEval.bestMove)
                            {
                                const allPreviousHangingPieceCoords = Chonse2Extensions.getHangingPieces(previousState)
                                const previousHangingPiecesArrToCheck = whiteToMove ? allPreviousHangingPieceCoords.white : allPreviousHangingPieceCoords.black;
                                
                                const previousBestMove = CoachUtils.convertUciToChonse2Move(previousPosEval.bestMove);

                                //For all the previously hanging pieces, check if the previous best move was to capture it. If it was, the coach should tell them.
                                for (let i = 0; i < previousHangingPiecesArrToCheck.length; i++)
                                {
                                    const coord = previousHangingPiecesArrToCheck[i];
                                    const pieceToCapture = Chonse2Extensions.findPieceAtCoordinate(previousState, previousBestMove.toSquare);
                                    
                                    if (coord === previousBestMove.toSquare)
                                    {                  
                                        //Subcase 1: If they correctly captured the piece but did so with the wrong attacker.
                                        if (previousBestMove.toSquare === move.toCoord)
                                        {
                                            move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.CAPTURED_WITH_WRONG_PIECE_SENTENCES, colorThatMovedText, pieceToCapture);
                                            move.coachMoveFlags.push(CoachMoveFlagType.CapturedPieceWithWrongAttacker);
                                        }
                                        else //Subcase 2: If they missed the capture altogether.
                                        {
                                            move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.MISSED_HANGING_PIECE_SENTENCES, colorThatMovedText, pieceToCapture);
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
                                    move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.MISSED_CHECKMATE_SENTENCES, colorThatMovedText, "");
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
                                    move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.ALLOWED_CHECKMATE_SENTENCES, colorThatMovedText, "");
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
                                move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.MISSED_FORK_SENTENCES, colorThatMovedText, "");
                                move.coachMoveFlags.push(CoachMoveFlagType.MissedFork)
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
                                move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.ALLOWED_FORK_SENTENCES, colorThatMovedText, "");
                                move.coachMoveFlags.push(CoachMoveFlagType.AllowedFork);
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
                                const pinnedPiece = Chonse2Extensions.findPieceAtCoordinate(missedState, correspondingPin.pinnedPieceCoordinate);
                                const highValuePiece = Chonse2Extensions.findPieceAtCoordinate(missedState, correspondingPin.highValuePieceCoordinate);

                                move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.MISSED_PIN_SENTENCES, colorThatMovedText, pinnedPiece, highValuePiece);
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
                                    const pinnedPiece = Chonse2Extensions.findPieceAtCoordinate(previousState, ignoredPin.pinnedPieceCoordinate);
                                    const highValuePiece = Chonse2Extensions.findPieceAtCoordinate(previousState, ignoredPin.highValuePieceCoordinate);


                                    move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.IGNORED_PIN_SENTENCES, colorThatMovedText, pinnedPiece, highValuePiece)
                                }
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
                                        move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.FOUND_MATE_SENTENCES, colorThatMovedText, "");
                                    }
                                    else 
                                    {
                                        move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.FOUND_MATE_SENTENCES, oppositeColorText, "");
                                    }
                                }   

                                //Subcase 2: Player is continuing the mating sequence.
                                if (previousEngineLine.mate && currentEngineLine.mate)
                                {
                                    if ((whiteToMove && currentEngineLine.mate < 0) || (!whiteToMove && currentEngineLine.mate > 0 ))
                                    {
                                        move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.ON_ROAD_TO_CHECKMATE_SENTENCES, colorThatMovedText, "");
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
                                const forkedPieces = fk.coordinatesAttacked.map( c => Chonse2Extensions.findPieceAtCoordinate(state, c) );
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

                            move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.FOUND_FORK_SENTENCES, colorThatMovedText, displayPiece)
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
                            const pinnedPiece = Chonse2Extensions.findPieceAtCoordinate(previousState, initiatedPin.pinnedPieceCoordinate);
                            const highValuePiece = Chonse2Extensions.findPieceAtCoordinate(previousState, initiatedPin.highValuePieceCoordinate);

                            move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.FOUND_PIN_SENTENCES, colorThatMovedText, pinnedPiece, highValuePiece);

                            const idea = new CoachIdea();
                            const arrow = createArrow(initiatedPin.attackerCoordinate, initiatedPin.highValuePieceCoordinate, ArrowColors.IDEA, ArrowContext.Coach);
                            if (arrow)
                            {
                                idea.arrows.push(arrow);
                            }
                            idea.highlightedSquares.push(initiatedPin.highValuePieceCoordinate);
                            idea.highlightedSquares.push(initiatedPin.pinnedPieceCoordinate);

                            move.coachIdeas.set(CoachIdeaFlagType.PinIdea, idea);
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
                        console.log(move);
                        move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.KNIGHT_DEVELOPMENT_CENTER_CONTROL_SENTENCES, "");

                        //To evaluate central squares hit by the knight, check if the knight can move to one of them.
                        const potentiallyLegalKnightMoves = getKnightSquareHits(state, move.toCoord);
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
                            && Chonse2Extensions.findPieceAtCoordinate(state, move.toCoord) == PieceType.WHITE_PAWN 
                            && Chonse2Extensions.findPieceAtCoordinate(state, Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE) == PieceType.WHITE_BISHOP
                        )
                        ||
                        (
                            move.notation.startsWith(Chonse2.WHITE_QUEEN_PAWN_SQUARE) 
                            && Chonse2Extensions.findPieceAtCoordinate(state, move.toCoord) == PieceType.WHITE_PAWN 
                            && Chonse2Extensions.findPieceAtCoordinate(state, Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE) == PieceType.WHITE_BISHOP
                        )
                        ||
                        (
                            move.notation.startsWith(Chonse2.BLACK_KING_PAWN_SQUARE) 
                            && Chonse2Extensions.findPieceAtCoordinate(state, move.toCoord) == PieceType.BLACK_PAWN 
                            && Chonse2Extensions.findPieceAtCoordinate(state, Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE) == PieceType.BLACK_BISHOP
                        )
                        ||
                        (
                            move.notation.startsWith(Chonse2.BLACK_QUEEN_PAWN_SQUARE) 
                            && Chonse2Extensions.findPieceAtCoordinate(state, move.toCoord) == PieceType.BLACK_PAWN 
                            && Chonse2Extensions.findPieceAtCoordinate(state, Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE) == PieceType.BLACK_BISHOP
                        )
                    )
                    {
                        //Add the comment saying they can develop the bishop.
                        move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.PREPARES_BISHOP_FOR_DEVELOPMENT_SENTENCES, colorThatMovedText);

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
                }

                //Case: Player moved a pawn allowing the bishop to be developed (fianchetto)
                if 
                (
                    (
                        move.notation.startsWith(Chonse2.WHITE_KINGSIDE_KNIGHT_PAWN_SQUARE) 
                        && Chonse2Extensions.findPieceAtCoordinate(state, move.toCoord) == PieceType.WHITE_PAWN 
                        && Chonse2Extensions.findPieceAtCoordinate(state, Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE) == PieceType.WHITE_BISHOP
                    )
                    ||
                    (
                        move.notation.startsWith(Chonse2.WHITE_QUEENSIDE_KNIGHT_PAWN_SQUARE) 
                        && Chonse2Extensions.findPieceAtCoordinate(state, move.toCoord) == PieceType.WHITE_PAWN 
                        && Chonse2Extensions.findPieceAtCoordinate(state, Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE) == PieceType.WHITE_BISHOP
                    )
                    ||
                    (
                        move.notation.startsWith(Chonse2.BLACK_KINGSIDE_KNIGHT_PAWN_SQUARE) 
                        && Chonse2Extensions.findPieceAtCoordinate(state, move.toCoord) == PieceType.BLACK_PAWN 
                        && Chonse2Extensions.findPieceAtCoordinate(state, Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE) == PieceType.BLACK_BISHOP
                    )
                    ||
                    (
                        move.notation.startsWith(Chonse2.BLACK_QUEENSIDE_KNIGHT_PAWN_SQUARE) 
                        && Chonse2Extensions.findPieceAtCoordinate(state, move.toCoord) == PieceType.BLACK_PAWN 
                        && Chonse2Extensions.findPieceAtCoordinate(state, Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE) == PieceType.BLACK_BISHOP
                    )
                )
                {
                    move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.PREPARES_BISHOP_FOR_FIANCHETTO_DEVELOPMENT_SENTENCES, "")

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
                    (move.fromCoord == Chonse2.WHITE_KINGSIDE_BISHOP_SQUARE && Chonse2Extensions.findPieceAtCoordinate(state, move.toCoord) == PieceType.WHITE_BISHOP) ||
                    (move.fromCoord == Chonse2.WHITE_QUEENSIDE_BISHOP_SQUARE && Chonse2Extensions.findPieceAtCoordinate(state, move.toCoord) == PieceType.WHITE_BISHOP ) ||
                    (move.fromCoord == Chonse2.BLACK_KINGSIDE_BISHOP_SQUARE && Chonse2Extensions.findPieceAtCoordinate(state, move.toCoord) == PieceType.BLACK_BISHOP) ||
                    (move.fromCoord == Chonse2.BLACK_QUEENSIDE_BISHOP_SQUARE && Chonse2Extensions.findPieceAtCoordinate(state, move.toCoord) == PieceType.BLACK_BISHOP)
                )
                {
                    if (FIANCHETTOS.includes(move.toCoord))
                    {
                        move.coachComment += CoachUtils.selectAndFormatSentence(this.BISHOP_FIANCHETTOED_SENTENCES, colorThatMovedText);
                    }
                    else 
                    {
                        move.coachComment += CoachUtils.selectAndFormatSentence(this.BISHOP_DEVELOPED_SENTENCES, colorThatMovedText);
                    }
                }

                if (move.coachComment == "")
                {
                    move.coachComment = this.getBaseSentence(posEval.moveClassification ?? MoveClassification.None).replace(this.TURN_PLACEHOLDER, colorThatMovedText);
                }
            }
        }
    }

    private static getBaseSentence(moveClassification: MoveClassification): string
    {
        //Get random item from hash map
        const sentences = CoachUtils.BASE_SENTENCES.get(moveClassification ?? MoveClassification.None);
        
        if (sentences)
        {
            const randIndex = this.getRandomIndex(sentences.length);
            return sentences[randIndex];
        }
        return "";
    }


    //#region Helper functions
    //Gets a random index given the length of an array.
    private static getRandomIndex(length: number)
    {
        return Math.floor(Math.random() * length);
    }

    //Converts a UCI move to the format in which it can be used to move in the Chonse2 library.
    public static convertUciToChonse2Move(uci: string) : {fromSquare: string, toSquare: string, promotion: string}
    {
        const fromSquare = uci[0] + uci[1];
        const toSquare = uci[2] + uci[3];
        const promotion = uci[4] ? uci[4].toUpperCase() : PieceType.QUEEN;

        return {fromSquare, toSquare, promotion};
    }

    public static convertPieceToText(piece: string): string
    {
        //Pawn
        if (piece === PieceType.WHITE_PAWN || piece === PieceType.BLACK_PAWN)
        {
            return "pawn";
        }

        //Knight
        if (piece === PieceType.WHITE_KNIGHT || piece === PieceType.BLACK_KNIGHT)
        {
            return "knight";
        }

        //Bishop
        if (piece === PieceType.WHITE_BISHOP || piece === PieceType.BLACK_BISHOP)
        {
            return "bishop";
        }

        //Rook
        if (piece === PieceType.WHITE_ROOK || piece === PieceType.BLACK_ROOK)
        {
            return "rook";
        }

        //Queen
        if (piece === PieceType.WHITE_QUEEN || piece === PieceType.BLACK_QUEEN)
        {
            return "queen";
        }

        //King
        if (piece === PieceType.WHITE_KING || piece === PieceType.BLACK_KING)
        {
            return "king";
        }

        return "piece";
    }

    private static _formatCoachStringWithPlaceholders(sentence: string, playerColor: string, piece: string, secondaryPiece: string): string
    {
        return sentence
            .replace(CoachUtils.TURN_PLACEHOLDER, playerColor)
            .replace(CoachUtils.PIECE_PLACEHOLDER, piece)
            .replace(CoachUtils.SECONDARY_PIECE_PLACEHOLDER, secondaryPiece);
    }

    private static selectAndFormatSentence(arr: Array<string>, playerColor: string, piece: string = "", secondaryPiece: string = "")
    {
        let newSentence = arr[CoachUtils.getRandomIndex(arr.length)];
        newSentence = this._formatCoachStringWithPlaceholders(newSentence, playerColor, CoachUtils.convertPieceToText(piece), CoachUtils.convertPieceToText(secondaryPiece));

        return newSentence;
    }
}

//#region Misc. helpers
    function getKnightSquareHits(board: Chonse2, coordinate: string): Array<string>
    {
        const {rowIndex, colIndex} = Chonse2.findIndexFromCoordinate(coordinate);
        const legalMoves: Array<string> = [];

        //A knight can only move two ahead and one to the side. These are the offsets for the eight possible squares a knight can go to relative to its current position
        const dRow: Array<number> = [2, 1, 2, 1, -1, -2, -1, -2];
        const dCol: Array<number> = [-1, -2, +1, +2, -2, -1, +2, +1];

        //Loop over each of the potential differences.
        for(let i = 0; i < dRow.length; i++)
        {
        //The rank that the knight will move to.
        const rankInQuestion = board.pieceState[rowIndex + dRow[i]];      

        //If the rank does in fact exist, find its square.
            if (rankInQuestion)
            {
                //The square that might be able to be moved to.
                const potentialMoveSquare = rankInQuestion[colIndex + dCol[i]];

                //It can also be undefined if the offset exists outside the board, check for this.
                if (potentialMoveSquare != undefined)
                {
                    //Legal move in either case is the current square with the 2 straight/1 side offset applied.
                    legalMoves.push(Chonse2.COORDS[rowIndex + dRow[i]][colIndex + dCol[i]]);
                }
            }
        }
        return legalMoves
    }

    const FIANCHETTOS = ["g2", "b2", "g7", "b7"];
//#endregion

export class CoachIdea 
{
    arrows: Array<Arrow> = [];
    highlightedSquares: Array<string> = [];
}

export enum CoachMoveSequenceType
{
    None = "None",
    FollowUp = "FollowUp",
    MissedOpportunity = "MissedOpportunity"
}

export enum CoachMoveFlagType 
{
    //Bad
    LeftPieceHanging,
    MissedHangingPiece,
    CapturedPieceWithWrongAttacker,
    AllowedCheckmate,
    MissedCheckmate,
    AllowedFork,
    AllowedSkewer,
    MissedFork,
    MissedPin,
    IgnoredPin,

    //Good (show follow up)
    OpportunityToCheckmate,
    OpportunityToSkewer,
    OpportunityToFork,
}

export enum CoachIdeaFlagType
{
    ForkIdea,
    PinIdea,
    CentralControlIdea,
    DevelopmentIdea,
    FianchettoIdea
}

export enum CoachResourceFlagType 
{
    Opening
}