import MoveResult from "../../app/chessboard/chessboard/move-result";
import Chonse2 from "../chonse2-lib/chonse2";
import { PieceType } from "../chonse2-lib/piece-type";
import { MoveClassification } from "../engine-lib/types/enums";
import { PositionEval } from "../engine-lib/types/eval";

export class CoachUtils
{
    static readonly COACH_MOVE_DELIMITER = "*"
    static readonly TURN_PLACEHOLDER = "{turn}"

    private static readonly SENTENCES: Map<MoveClassification, string[]> = new Map<MoveClassification, string[]>(
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

    public static convertUciToChonse2Move(uci: string) : {fromSquare: string, toSquare: string, promotion: string}
    {
        const fromSquare = uci[0] + uci[1];
        const toSquare = uci[2] + uci[3];
        const promotion = uci[4] ? uci[4].toUpperCase() : PieceType.QUEEN;

        return {fromSquare, toSquare, promotion};
    }

    public static performCoachAnalysis(states: Array<Chonse2>, moves: Array<MoveResult>, evals: Array<PositionEval>, isDivergenceStack: boolean = false)
    {
        //Main state and eval stacks are always the same length, with main move stack always being one shorter.
        //Divergence state, eval, and move stacks are always the same length.

        for(let i = 0; i < moves.length; i++)
        {
            const stateStackPointer = i;
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

                const colorToMove = isDivergenceStack ? (state.turn ? "White" : "Black") : (state.turn ? "Black" : "White")

                move.coachComment = this.getBaseSentence(posEval.moveClassification ?? MoveClassification.None).replace(this.TURN_PLACEHOLDER, colorToMove);
            
            }
        }
    }

    private static getBaseSentence(moveClassification: MoveClassification): string
    {
        //Get random item from hash map
        const sentences = CoachUtils.SENTENCES.get(moveClassification ?? MoveClassification.None);
        
        if (sentences)
        {
            const randIndex = Math.floor(Math.random() * sentences.length);
            return sentences[randIndex];
        }
        return "";
    }
}

export enum CoachMoveSequenceType
{
    None = "None",
    FollowUp = "FollowUp",
    MissedOpportunity = "MissedOpportunity"
}