import MoveResult from "../../app/chessboard/chessboard/move-result";
import Chonse2 from "../chonse2-lib/chonse2";
import Chonse2Extensions from "../chonse2-lib/extensions";
import PieceMaterial from "../chonse2-lib/piece-material";
import { PieceType } from "../chonse2-lib/piece-type";
import { MoveClassification } from "../engine-lib/types/enums";
import { PositionEval } from "../engine-lib/types/eval";

export class CoachUtils
{
    //#region Static text data
    static readonly COACH_MOVE_DELIMITER = "*";
    static readonly TURN_PLACEHOLDER = "{turn}";
    static readonly PIECE_PLACEHOLDER = "{piece}";

    private static readonly BASE_SENTENCES: Map<MoveClassification, string[]> = new Map<MoveClassification, string[]>(
        [
            //Luminous moves.
            [MoveClassification.Splendid, 
                [
                    `A luminous sacrifice. Leaving that piece hanging will improve the position. I see what ${this.TURN_PLACEHOLDER} is trying to do here.`
                ]
            ],

            //Perfect moves.
            [MoveClassification.Perfect, 
                [
                    `There was one good move and ${this.TURN_PLACEHOLDER} found it!`
                ]
            ],

            //Best moves.
            [
                MoveClassification.Best,
                [
                    "Right on target",
                    "Amazing move!",
                    `${this.TURN_PLACEHOLDER} found the top move!`
                ]
            ],

            //Excellent moves.
            [
                MoveClassification.Excellent,
                [
                    "This is a fine move!",
                    "Well done, an excellent move."
                ]
            ],

            //Okay moves
            [
                MoveClassification.Okay,
                [
                    `Decent move, but ${this.TURN_PLACEHOLDER} had a better one.`,
                    `This is alright, but not what I would have played.`
                ]
            ],

            //Inaccuracies
            [
                MoveClassification.Inaccuracy,
                [
                    `${this.TURN_PLACEHOLDER} had a chance to play something better.`,
                    `${this.TURN_PLACEHOLDER} didn't find the right idea here.`
                ]
            ],

            //Mistakes
            [
                MoveClassification.Mistake,
                [
                    `Hmm, this seems like a mistake to me.`,
                    `Oh my god, ${this.TURN_PLACEHOLDER} made a mistake.`
                ]
            ],

            //Blunders
            [
                MoveClassification.Blunder, 
                [
                    `${this.TURN_PLACEHOLDER} just made a blunder.`,
                    `This move is going to cost ${this.TURN_PLACEHOLDER}`
                ]
            ],

            //Forced
            [
                MoveClassification.Forced,
                [
                    `This was the only move.`
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

    private static readonly PIECE_HANG_SENTENCES: Array<string> = 
    [
        `OUCH, ${CoachUtils.TURN_PLACEHOLDER} left their ${CoachUtils.PIECE_PLACEHOLDER} hanging!`,
        `Whoopsie, ${CoachUtils.TURN_PLACEHOLDER} gave up a ${CoachUtils.PIECE_PLACEHOLDER}!`
    ]
    //#endregion


    public static performCoachAnalysis(states: Array<Chonse2>, moves: Array<MoveResult>, evals: Array<PositionEval>, isDivergenceStack: boolean = false)
    {
        //Main state and eval stacks are always the same length, with main move stack always being one shorter.
        //Divergence state, eval, and move stacks are always the same length.

        for(let i = 0; i < states.length; i++)
        {
            const stateStackPointer = isDivergenceStack ? i + 1 : i;
            const moveStackPointer = isDivergenceStack ? i : i - 1;
            const evalStackPointer = i;

            const state = states[stateStackPointer];
            const move = moves[moveStackPointer];
            const posEval = evals[evalStackPointer];

            if (state && move && posEval)
            {
                if (move.coachComment == CoachUtils.COACH_MOVE_DELIMITER)
                {
                    continue;
                }

                const whiteToMove = state.turn;

                const colorToMoveText = whiteToMove ? "Black" : "White";
            
                //=======Bad
                if (posEval.moveClassification == MoveClassification.Inaccuracy ||
                    posEval.moveClassification == MoveClassification.Mistake || 
                    posEval.moveClassification == MoveClassification.Blunder
                )
                {
                    {
                        //Case: Player leaves a piece hanging.
                        const allHangingPieces = Chonse2Extensions.getHangingPieces(state);
                        
                        const hangingPiecesArrToCheck = whiteToMove ? allHangingPieces.black : allHangingPieces.white;

                        let highestValuePiece = PieceType.NONE;
                        let highestValuePieceMaterial = 0;

                        //If there is any hanging pieces, find the highest value one that they hung, otherwise move on.
                        if (hangingPiecesArrToCheck.length > 0)
                        {
                            for(let i = 0; i < hangingPiecesArrToCheck.length; i++)
                            {
                                const hangingPieceCoord = hangingPiecesArrToCheck[i];
                                const hangingPiece = Chonse2Extensions.findPieceAtCoordinate(state, hangingPieceCoord);
                                const hangingPieceMaterialValue = PieceMaterial.getMaterialFromPiece(hangingPiece);

                                if (hangingPieceMaterialValue > highestValuePieceMaterial)
                                {
                                    highestValuePiece = hangingPiece;
                                    highestValuePieceMaterial = hangingPieceMaterialValue;
                                }
                            }

                            let phrase = CoachUtils.PIECE_HANG_SENTENCES[CoachUtils.getRandomIndex(CoachUtils.PIECE_HANG_SENTENCES.length)]
                            phrase = phrase.replace(CoachUtils.PIECE_PLACEHOLDER, CoachUtils.convertPieceToText(highestValuePiece)).replace(CoachUtils.TURN_PLACEHOLDER, colorToMoveText);

                            move.coachComment = phrase;
                        }
                    }
                }


                //=======Good
                //

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

        return "-";
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