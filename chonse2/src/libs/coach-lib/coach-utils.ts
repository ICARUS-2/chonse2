import { Arrow, ArrowContext, createArrow } from "../../app/chessboard/chessboard/arrow";
import MoveResult from "../../app/chessboard/chessboard/move-result";
import Chonse2 from "../chonse2-lib/chonse2";
import Chonse2Extensions, { Fork } from "../chonse2-lib/extensions";
import { PieceColor } from "../chonse2-lib/piece-color";
import PieceMaterial from "../chonse2-lib/piece-material";
import { PieceType } from "../chonse2-lib/piece-type";
import { MoveClassification } from "../engine-lib/types/enums";
import { LineEval, PositionEval } from "../engine-lib/types/eval";

export class CoachUtils
{
    //#region Static text data
    static readonly COACH_MOVE_DELIMITER = "*";
    static readonly TURN_PLACEHOLDER = "{turn}";
    static readonly PIECE_PLACEHOLDER = "{piece}";

    //At minimum one sentence should be displayed.
    private static readonly BASE_SENTENCES: Map<MoveClassification, string[]> = new Map<MoveClassification, string[]>(
        [
            //Luminous moves.
            [MoveClassification.Splendid, 
                [
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

    //Bad=============
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

    //Good============
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

                const colorToMoveText = whiteToMove ? "Black" : "White";
                const oppositeColorText = whiteToMove ? "White" : "Black";
            
                //=======Bad
                if (posEval.moveClassification == MoveClassification.Inaccuracy ||
                    posEval.moveClassification == MoveClassification.Mistake || 
                    posEval.moveClassification == MoveClassification.Blunder
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

                                    move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.PIECE_HANG_SENTENCES, colorToMoveText, pieceToTake);
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
                                            move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.CAPTURED_WITH_WRONG_PIECE_SENTENCES, colorToMoveText, pieceToCapture);
                                            move.coachMoveFlags.push(CoachMoveFlagType.CapturedPieceWithWrongAttacker);
                                        }
                                        else //Subcase 2: If they missed the capture altogether.
                                        {
                                            move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.MISSED_HANGING_PIECE_SENTENCES, colorToMoveText, pieceToCapture);
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
                                    move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.MISSED_CHECKMATE_SENTENCES, colorToMoveText, "");
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
                                    move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.ALLOWED_CHECKMATE_SENTENCES, colorToMoveText, "");
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
                                move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.MISSED_FORK_SENTENCES, colorToMoveText, "");
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
                                }
                            }

                            if (allowedFork)
                            {
                                move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.ALLOWED_FORK_SENTENCES, colorToMoveText, "");
                                move.coachMoveFlags.push(CoachMoveFlagType.AllowedFork);
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
                                        move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.FOUND_MATE_SENTENCES, colorToMoveText, "");
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
                                        move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.ON_ROAD_TO_CHECKMATE_SENTENCES, colorToMoveText, "");
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
                                    const newArrow = createArrow(fk.attackerCoordinate, forkedPieceCoord, "hotpink", ArrowContext.Coach);
                                    
                                    if(newArrow)
                                    {
                                        arrows.push(newArrow);
                                    }
                                }
                            }

                            move.coachComment += CoachUtils.selectAndFormatSentence(CoachUtils.FOUND_FORK_SENTENCES, colorToMoveText, displayPiece)
                            move.coachIdeas.set( CoachIdeaFlagType.ForkIdea, arrows );
                        }
                    }
                }
            
                if (move.coachComment == "")
                {
                    move.coachComment = this.getBaseSentence(posEval.moveClassification ?? MoveClassification.None).replace(this.TURN_PLACEHOLDER, colorToMoveText);
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

    private static formatCoachStringWithPlaceholders(sentence: string, playerColor: string, piece: string): string
    {
        return sentence
            .replace(CoachUtils.TURN_PLACEHOLDER, playerColor)
            .replace(CoachUtils.PIECE_PLACEHOLDER, piece);
    }

    private static selectAndFormatSentence(arr: Array<string>, playerColor: string, piece: string)
    {
        let newSentence = arr[CoachUtils.getRandomIndex(arr.length)];
        newSentence = this.formatCoachStringWithPlaceholders(newSentence, playerColor, CoachUtils.convertPieceToText(piece));

        return newSentence;
    }
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

    //Good (show follow up)
    OpportunityToCheckmate,
    OpportunityToSkewer,

    //Good (show idea)
    PinnedPiece,
    OpportunityToFork,
}

export enum CoachIdeaFlagType
{
    ForkIdea
}