import MoveResult from "../../app/chessboard/chessboard/move-result";
import Chonse2 from "../chonse2-lib/chonse2";
import Chonse2Extensions from "../chonse2-lib/extensions";
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
    ]

    //If the player missed the opportunity to capture a vulnerable piece
    private static readonly MISSED_HANGING_PIECE_SENTENCES: Array<string> =
    [
        `${CoachUtils.TURN_PLACEHOLDER} missed an opportunity to capture a free ${CoachUtils.PIECE_PLACEHOLDER}.`,
        `The best bet here was to capture a vulnerable ${CoachUtils.PIECE_PLACEHOLDER}. `
    ]

    //If the player had a viable checkmate but missed it.
    private static readonly MISSED_CHECKMATE_SENTENCES: Array<string> = 
    [
        `This misses an opportunity to checkmate the king. `,
        `${CoachUtils.TURN_PLACEHOLDER} had an opportunity to checkmate the king. `,
        `There was an opportunity to force checkmate, but ${CoachUtils.TURN_PLACEHOLDER} overlooked it. `
    ]

    //If the opponent had a good move but instead allowed forced mate by mistake.
    private static readonly ALLOWED_CHECKMATE_SENTENCES: Array<string> = 
    [
        `This allows the opponent to checkmate the king. `,
        `${CoachUtils.TURN_PLACEHOLDER} just allowed the opponent to force checkmate. `,
        `${CoachUtils.TURN_PLACEHOLDER} slipped up, allowing the opponent to force checkmate with correct play. `
    ]


    //Good============
    private static readonly FOUND_MATE_SENTENCES: Array<string> = 
    [
        `${CoachUtils.TURN_PLACEHOLDER} can now force checkmate with correct play. `,
        `${CoachUtils.TURN_PLACEHOLDER} will checkmate the opponent if they find the right moves. `
    ]

    private static readonly ON_ROAD_TO_CHECKMATE_SENTENCES: Array<string> = 
    [
        `${CoachUtils.TURN_PLACEHOLDER} is still on the road to checkmate. `,
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
                    //Case: Player leaves a piece hanging.
                    {
                        const bestMove = CoachUtils.convertUciToChonse2Move(posEval.bestMove);
                        const hangingPiecesArrToCheck = whiteToMove ? allHangingPieceCoords.black : allHangingPieceCoords.white;

                        let pieceToTake = PieceType.NONE;
                        //let pieceToTakeMaterial = 0;

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
                                    let newSentence = CoachUtils.PIECE_HANG_SENTENCES[CoachUtils.getRandomIndex(CoachUtils.PIECE_HANG_SENTENCES.length)]

                                    newSentence = CoachUtils.formatCoachStringWithPlaceholders(newSentence, colorToMoveText, CoachUtils.convertPieceToText(pieceToTake));
                                    move.coachComment += newSentence;

                                    move.coachFlags.push(CoachFlagType.LeftPieceHanging);

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
                                    
                                    if (coord === previousBestMove.toSquare)
                                    {   
                                        const pieceToCapture = CoachUtils.convertPieceToText(Chonse2Extensions.findPieceAtCoordinate(state, previousBestMove.toSquare));

                                        let newSentence = CoachUtils.MISSED_HANGING_PIECE_SENTENCES[CoachUtils.getRandomIndex(CoachUtils.MISSED_HANGING_PIECE_SENTENCES.length)];
                                        newSentence = CoachUtils.formatCoachStringWithPlaceholders(newSentence, colorToMoveText, pieceToCapture);

                                        move.coachFlags.push(CoachFlagType.MissedHangingPiece);
                                        move.coachComment += newSentence;
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
                                    let newSentence = CoachUtils.MISSED_CHECKMATE_SENTENCES[CoachUtils.getRandomIndex(CoachUtils.MISSED_CHECKMATE_SENTENCES.length)]
                                    newSentence = CoachUtils.formatCoachStringWithPlaceholders(newSentence, colorToMoveText, "");
                                    
                                    
                                    move.coachComment += newSentence;
                                    move.coachFlags.push(CoachFlagType.MissedCheckmate);
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
                                    let newSentence = CoachUtils.ALLOWED_CHECKMATE_SENTENCES[CoachUtils.getRandomIndex(CoachUtils.ALLOWED_CHECKMATE_SENTENCES.length)]
                                    newSentence = CoachUtils.formatCoachStringWithPlaceholders(newSentence, colorToMoveText, "");
                                    move.coachComment += newSentence;

                                    move.coachFlags.push(CoachFlagType.AllowedCheckmate);
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
                                        let newSentence = CoachUtils.FOUND_MATE_SENTENCES[this.getRandomIndex(CoachUtils.FOUND_MATE_SENTENCES.length)];
                                        newSentence = CoachUtils.formatCoachStringWithPlaceholders(newSentence, colorToMoveText, "");
                                        move.coachComment += newSentence;
                                    }
                                    else 
                                    {
                                        let newSentence = CoachUtils.FOUND_MATE_SENTENCES[this.getRandomIndex(CoachUtils.FOUND_MATE_SENTENCES.length)];
                                        newSentence = CoachUtils.formatCoachStringWithPlaceholders(newSentence, oppositeColorText, "");
                                        move.coachComment += newSentence;
                                    }
                                }   

                                //Subcase 2: Player is continuing the mating sequence.
                                if (previousEngineLine.mate && currentEngineLine.mate)
                                {
                                    if ((whiteToMove && currentEngineLine.mate < 0) || (!whiteToMove && currentEngineLine.mate > 0 ))
                                    {
                                        let newSentence = CoachUtils.ON_ROAD_TO_CHECKMATE_SENTENCES[this.getRandomIndex(CoachUtils.ON_ROAD_TO_CHECKMATE_SENTENCES.length)];
                                        newSentence = CoachUtils.formatCoachStringWithPlaceholders(newSentence, colorToMoveText, "");
                                        move.coachComment += newSentence;
                                    }
                                }
                            }
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
}

export enum CoachMoveSequenceType
{
    None = "None",
    FollowUp = "FollowUp",
    MissedOpportunity = "MissedOpportunity"
}

export enum CoachFlagType 
{
    //Bad
    LeftPieceHanging,
    MissedHangingPiece,
    AllowedCheckmate,
    MissedCheckmate,
    AllowedFork,
    AllowedSkewer,
    

    //Good (future)
    OpportunityToCheckmate,
    OpportunityToFork,
    OpportunityToSkewer,

    //Good (current)
    PinnedPiece,

}