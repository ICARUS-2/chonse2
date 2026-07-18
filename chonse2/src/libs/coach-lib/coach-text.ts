import MoveResult from "../../app/chessboard/chessboard/move-result";
import { PieceType } from "../chonse2-lib/piece-type";
import { MoveClassification } from "../engine-lib/types/enums";
import { CoachSentence, FormattedCoachSentence } from "./coach-types";

export default class CoachText 
{
//#region Static text data
    static readonly TURN_PLACEHOLDER = "{turn}";
    static readonly PIECE_PLACEHOLDER = "{piece}";
    static readonly SECONDARY_PIECE_PLACEHOLDER = "{piece2}";

    static readonly LIGHT_SQUARED = "light-squared";
    static readonly DARK_SQUARED = "dark-squared";

    //At minimum one sentence should be displayed.
    public static readonly BASE_SENTENCES: Map<MoveClassification, CoachSentence[]> = new Map<MoveClassification, CoachSentence[]>(
        [
            //Luminous moves.
            [MoveClassification.Luminous,
                [
                    new CoachSentence(`Well done, a luminous sacrifice of the ${this.PIECE_PLACEHOLDER}!`, `base-sentences/luminous/0/audio_${this.PIECE_PLACEHOLDER}.mp3`),
                    new CoachSentence(`A luminous sacrifice. Leaving that ${this.PIECE_PLACEHOLDER} hanging will improve the position. I see what ${this.TURN_PLACEHOLDER} is trying to do here.`, `base-sentences/luminous/1/audio_${this.PIECE_PLACEHOLDER}_${this.TURN_PLACEHOLDER}.mp3`),
                    new CoachSentence(`And ${this.TURN_PLACEHOLDER} sacrifices........ the ${this.PIECE_PLACEHOLDER}!!!!!`, `base-sentences/luminous/2/audio_${this.TURN_PLACEHOLDER}_${this.PIECE_PLACEHOLDER}.mp3`)
                ]
            ],

            //Perfect moves.
            [MoveClassification.Perfect,
                [
                    new CoachSentence(`There was one good move and ${this.TURN_PLACEHOLDER} found it!`, `base-sentences/perfect/0/audio_${this.TURN_PLACEHOLDER}.mp3`)
                ]
            ],

            //Best moves.
            [
                MoveClassification.Best,
                [
                    new CoachSentence("Right on target.", `base-sentences/best/0/audio.mp3`),
                    new CoachSentence("Best move!", `base-sentences/best/1/audio.mp3`),
                    new CoachSentence(`${this.TURN_PLACEHOLDER} found the top move!`, `base-sentences/best/2/audio_${this.TURN_PLACEHOLDER}.mp3`)
                ]
            ],

            //Excellent moves.
            [
                MoveClassification.Excellent,
                [
                    new CoachSentence("This is a great move!", `base-sentences/excellent/0/audio.mp3`),
                    new CoachSentence("Well done, an excellent move.", `base-sentences/excellent/1/audio.mp3`)
                ]
            ],

            //Okay moves
            [
                MoveClassification.Okay,
                [
                    new CoachSentence(`Okay move, but ${this.TURN_PLACEHOLDER} had a better one.`, `base-sentences/okay/0/audio_${this.TURN_PLACEHOLDER}.mp3`),
                    new CoachSentence(`This is decent, but not what I would have played.`, `base-sentences/okay/1/audio.mp3`)
                ]
            ],

            //Inaccuracies
            [
                MoveClassification.Inaccuracy,
                [
                    new CoachSentence(`${this.TURN_PLACEHOLDER} had a chance to play something better.`, `base-sentences/inaccuracy/0/audio_${this.TURN_PLACEHOLDER}.mp3`),
                    new CoachSentence(`${this.TURN_PLACEHOLDER} didn't find the right idea here.`, `base-sentences/inaccuracy/1/audio_${this.TURN_PLACEHOLDER}.mp3`)
                ]
            ],

            //Mistakes
            [
                MoveClassification.Mistake,
                [
                    new CoachSentence(`Hmm, this seems like an error to me.`, `base-sentences/mistake/0/audio.mp3`),
                    new CoachSentence(`Oh my god, ${this.TURN_PLACEHOLDER} made a mistake.`, `base-sentences/mistake/1/audio_${this.TURN_PLACEHOLDER}.mp3`)
                ]
            ],

            //Blunders
            [
                MoveClassification.Blunder,
                [
                    new CoachSentence(`${this.TURN_PLACEHOLDER} just made a blunder.`, `base-sentences/blunder/0/audio_${this.TURN_PLACEHOLDER}.mp3`),
                    new CoachSentence(`This move is going to cost ${this.TURN_PLACEHOLDER}.`, `base-sentences/blunder/1/audio_${this.TURN_PLACEHOLDER}.mp3`)
                ]
            ],

            [
                MoveClassification.Miss,
                [
                    new CoachSentence(`${this.TURN_PLACEHOLDER} missed the chance to capitalize on the opponent's hang, not taking enough time to spot it.`, `base-sentences/miss/0/audio_${this.TURN_PLACEHOLDER}.mp3`),
                    new CoachSentence(`The opponent slipped up and hung a piece, but ${this.TURN_PLACEHOLDER} overlooked it.`, `base-sentences/miss/1/audio_${this.TURN_PLACEHOLDER}.mp3`)
                ]
            ],

            //Forced
            [
                MoveClassification.Forced,
                [
                    new CoachSentence(`This was the only move.`, `base-sentences/forced/0/audio.mp3`)
                ]
            ],

            //Opening
            [
                MoveClassification.Opening,
                [
                    new CoachSentence("", `base-sentences/opening/0/audio.mp3`)
                ]
            ],

            //None
            [
                MoveClassification.None,
                [
                    new CoachSentence("", `base-sentences/none/0/audio.mp3`)
                ]
            ]
        ]
    )

    //#region Game end

    //Player checkmated the king
    public static readonly CHECKMATE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} did it! Nice checkmate!`, `checkmate-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`Checkmate and the game is over!`, `checkmate-sentences/1/audio.mp3`),
        new CoachSentence(`Checkmate is always the best move!`, `checkmate-sentences/2/audio.mp3`),
        new CoachSentence(`Always feels luminous to win! 🩵`, `checkmate-sentences/3/audio.mp3`)
    ]

    //Game ends in stalemate.
    public static readonly STALEMATE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`Snatching a stalemate from the jaws of defeat!`, `stalemate-sentences/0/audio.mp3`),
        new CoachSentence(`Stalemate, a fitting end to this intense game.`, `stalemate-sentences/1/audio.mp3`),
        new CoachSentence(`The king had no legal moves, but was not in check. The game ends in a stalemate.`, `stalemate-sentences/2/audio.mp3`)
    ]

    //Game ends in a draw.
    public static readonly DRAW_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`As they say, perfect chess is always a draw.`, `draw-sentences/0/audio.mp3`),
        new CoachSentence(`And the game ends in a draw.`, `draw-sentences/1/audio.mp3`),
        new CoachSentence(`Draw, the game is over.`, `draw-sentences/2/audio.mp3`)
    ]
    //#endregion

    //#region Bad=============
    //If the player just hung a piece.
    public static readonly PIECE_HANG_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`OUCH, ${CoachText.TURN_PLACEHOLDER} left their ${CoachText.PIECE_PLACEHOLDER} hanging!`, `piece-hang-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`Whoopsie, ${CoachText.TURN_PLACEHOLDER} gave up a ${CoachText.PIECE_PLACEHOLDER}!`, `piece-hang-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`This move loses a ${CoachText.PIECE_PLACEHOLDER}.`, `piece-hang-sentences/2/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ];

    public static readonly QUEEN_BLUNDER_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER}... your QUEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEN!!!`, `queen-blunder-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} just blundered their queen.`, `queen-blunder-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`BLUNDERING THE QUEEN FOR NO REASON WHATSOEVER!`, `queen-blunder-sentences/2/audio.mp3`)
    ]

    //If the player made a move that will lose material in the line but not outright hanging a piece
    public static readonly PIECE_LOSS_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`They've made a mistake, and their ${CoachText.PIECE_PLACEHOLDER} is now lost.`, `piece-loss-sentences/0/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} slipped up, which will cost them a ${CoachText.PIECE_PLACEHOLDER}.`, `piece-loss-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`They've made an error, allowing the opponent to win ${CoachText.TURN_PLACEHOLDER}'s ${CoachText.PIECE_PLACEHOLDER} with correct play. `, `piece-loss-sentences/2/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} is losing a ${CoachText.PIECE_PLACEHOLDER} this way :(`, `piece-loss-sentences/3/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //If the player missed the opportunity to capture a vulnerable piece
    public static readonly MISSED_HANGING_PIECE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} missed an opportunity to capture a free ${CoachText.PIECE_PLACEHOLDER}. `, `missed-hanging-piece-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`The best bet here was to capture a vulnerable ${CoachText.PIECE_PLACEHOLDER}.`, `missed-hanging-piece-sentences/1/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ];

    //If the player correctly identifies the best capture but did so with the wrong piece.
    public static readonly CAPTURED_WITH_WRONG_PIECE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} correctly captured the piece, but with the wrong attacker.`, `captured-with-wrong-piece-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`The correct capture was identified, but the best bet was to capture the ${CoachText.PIECE_PLACEHOLDER} with a different piece. `, `captured-with-wrong-piece-sentences/1/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //If the player had a viable checkmate but missed it.
    public static readonly MISSED_CHECKMATE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`This misses an opportunity to checkmate the king.`, `missed-checkmate-sentences/0/audio.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} had an opportunity to checkmate the king.`, `missed-checkmate-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`There was an opportunity to force checkmate, but ${CoachText.TURN_PLACEHOLDER} overlooked it.`, `missed-checkmate-sentences/2/audio_${CoachText.TURN_PLACEHOLDER}.mp3`)
    ];

    //If the opponent had a good move but instead allowed forced mate by mistake.
    public static readonly ALLOWED_CHECKMATE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`This allows the opponent to checkmate the king.`, `allowed-checkmate-sentences/0/audio.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} just allowed the opponent to force checkmate.`, `allowed-checkmate-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} slipped up, allowing the opponent to force checkmate with correct play.`, `allowed-checkmate-sentences/2/audio_${CoachText.TURN_PLACEHOLDER}.mp3`)
    ];

    //If the opponent missed an opportunity to fork two+ pieces.
    public static readonly MISSED_FORK_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} just missed an opportunity to win material through a fork.`, `missed-fork-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`)
    ];

    //Allowed an opponent to fork them.
    public static readonly ALLOWED_FORK_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`This allows the opponent to win material through a fork.`, `allowed-fork-sentences/0/audio.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} just allowed their own piece to get forked.`, `allowed-fork-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}.mp3`)
    ]

    //Missed the opportunity to pin a piece
    public static readonly MISSED_PIN_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`They missed an opportunity to pin a ${CoachText.PIECE_PLACEHOLDER} to the ${CoachText.SECONDARY_PIECE_PLACEHOLDER}.`, `missed-pin-sentences/0/audio_${CoachText.PIECE_PLACEHOLDER}_${CoachText.SECONDARY_PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`The best move was to cut the mobility of the opponent's ${CoachText.PIECE_PLACEHOLDER} by pinning it to the ${CoachText.SECONDARY_PIECE_PLACEHOLDER}. `, `missed-pin-sentences/1/audio_${CoachText.PIECE_PLACEHOLDER}_${CoachText.SECONDARY_PIECE_PLACEHOLDER}.mp3`)
    ]

    //Ignored a relative pin
    public static readonly IGNORED_PIN_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} completely ignored the pin of their ${CoachText.PIECE_PLACEHOLDER}, and now their ${CoachText.SECONDARY_PIECE_PLACEHOLDER} is lost.`, `ignored-pin-sentences/0/audio_${CoachText.PIECE_PLACEHOLDER}_${CoachText.SECONDARY_PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} didn't notice their ${CoachText.PIECE_PLACEHOLDER} was pinned, exposing the ${CoachText.SECONDARY_PIECE_PLACEHOLDER} behind it.`, `ignored-pin-sentences/1/audio_${CoachText.PIECE_PLACEHOLDER}_${CoachText.SECONDARY_PIECE_PLACEHOLDER}.mp3`)
    ]

    //missed a skewer
    public static readonly MISSED_SKEWER_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} lost a chance to win a ${CoachText.PIECE_PLACEHOLDER} through a skewer.`, `missed-skewer-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} had a chance to acquire a ${CoachText.PIECE_PLACEHOLDER} via a skewer, but overlooked it.`, `missed-skewer-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //Allowed their piece to get skewered
    public static readonly ALLOWED_SKEWER_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} just allowed their opponent to capture their ${CoachText.PIECE_PLACEHOLDER} with a skewer.`, `allowed-skewer-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`This allows ${CoachText.TURN_PLACEHOLDER}'s opponent to grab a ${CoachText.PIECE_PLACEHOLDER} through a skewer.`, `allowed-skewer-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //Did not connect their rooks
    public static readonly MISSED_ROOK_CONNECTION_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER}'s best move in this position was to connect their rooks in order for them to provide mutual defence.`, `missed-rook-connection-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`Instead, ${CoachText.TURN_PLACEHOLDER} should have connected their rooks so that they can both defend each other and team up for attacks.`, `missed-rook-connection-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} missed a chance to connect their rooks here.`, `missed-rook-connection-sentences/2/audio_${CoachText.TURN_PLACEHOLDER}.mp3`)
    ]

    //Inaccurately disconnected their rooks
    public static readonly DISCONNECTED_ROOKS: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} erroneously disconnected their rooks here. They can no longer defend each other.`, `disconnected-rooks/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} should have kept their rooks connected.`, `disconnected-rooks/1/audio_${CoachText.TURN_PLACEHOLDER}.mp3`)
    ]

    //Inaccurately missed castling kingside.
    public static readonly MISSED_CASTLING_KINGSIDE: Array<CoachSentence> =
    [
        new CoachSentence(`A better option here was for ${CoachText.TURN_PLACEHOLDER} to secure their king with a kingside castle.`, `missed-castling-kingside/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`They should have prioritized king safety via a kingside castle.`, `missed-castling-kingside/1/audio.mp3`),
        new CoachSentence(`Castling kingside here would have improved king safety and activated a rook immediately.`, `missed-castling-kingside/2/audio.mp3`),
        new CoachSentence(`Delaying castling leaves their king more exposed in the center, where tactics are more dangerous.`, `missed-castling-kingside/3/audio.mp3`),
        new CoachSentence(`In most positions like this, early kingside castling is the most reliable way to stabilize.`, `missed-castling-kingside/4/audio.mp3`)
    ]

    //Inaccurately missed castling queenside.
    public static readonly MISSED_CASTLING_QUEENSIDE: Array<CoachSentence> =
    [
        new CoachSentence(`Better option here was for ${CoachText.TURN_PLACEHOLDER} to perform a queenside castle, both securing their king and getting a rook extremely active.`, `missed-castling-queenside/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`Castling queenside was a better option here, for both king safety and piece activity.`, `missed-castling-queenside/1/audio.mp3`),
        new CoachSentence(`Castling queenside was the more active option here, giving your rook faster access to central play, while providing good king safety.`, `missed-castling-queenside/2/audio.mp3`),
        new CoachSentence(`This position favored castling queenside, and delaying it often means missing your best chance to seize the initiative in controlling open files with the corresponding rook.`, `missed-castling-queenside/3/audio.mp3`)
    ]

    //Inaccurately missed development
    public static readonly MISSED_DEVELOPMENT: Array<CoachSentence> =
    [
        new CoachSentence(`A better option for ${CoachText.TURN_PLACEHOLDER} was to develop a ${CoachText.PIECE_PLACEHOLDER}.`, `missed-development/0/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} should have focused on developing their ${CoachText.PIECE_PLACEHOLDER} here instead.`, `missed-development/1/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} missed a chance to develop a ${CoachText.PIECE_PLACEHOLDER}.`, `missed-development/2/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //Developed a piece but there was a better way to do so.
    public static readonly INCORRECT_DEVELOPMENT: Array<CoachSentence> =
    [
        new CoachSentence(`There was a better way for ${CoachText.TURN_PLACEHOLDER} to have developed their ${CoachText.PIECE_PLACEHOLDER} here.`, `incorrect-development/0/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} correctly identified that their ${CoachText.PIECE_PLACEHOLDER} needed to be developed, but there was a better development square.`, `incorrect-development/1/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} had a better way to develop their ${CoachText.PIECE_PLACEHOLDER} long-term.`, `incorrect-development/2/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //Player should have placed their rook on an open file.
    public static readonly MISSED_ROOK_OPEN_FILE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`Taking an open file with the rook would have increased its scope tremendously.`, `missed-rook-open-file-sentences/0/audio.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} should have increased the scope of their rook by moving it to an open file.`, `missed-rook-open-file-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER}'s better option here was to take an open file with a rook.`, `missed-rook-open-file-sentences/2/audio_${CoachText.TURN_PLACEHOLDER}.mp3`)
    ]

    //Player missed an opportunity to force doubling of pawns.
    public static readonly MISSED_FORCED_DOUBLED_PAWNS: Array<CoachSentence>  =
    [
        new CoachSentence(`The best move here was to force doubling of pawns.`, `missed-forced-doubled-pawns/0/audio.mp3`),
        new CoachSentence(`They should have forced the opponent to double their pawns.`, `missed-forced-doubled-pawns/1/audio.mp3`),
        new CoachSentence(`They missed an opportunity to force the opponent to damage their structure by doubling pawns.`, `missed-forced-doubled-pawns/2/audio.mp3`)
    ]

    //Player blocked their own bishop with a pawn.
    public static readonly BLOCKED_BISHOP_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`They are blocking in their ${CoachText.PIECE_PLACEHOLDER} bishop with their pawn by doing this.`, `blocked-bishop-sentences/0/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`The ${CoachText.PIECE_PLACEHOLDER} bishop is being blocked by a pawn with this move.`, `blocked-bishop-sentences/1/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`This move weakens ${CoachText.TURN_PLACEHOLDER}'s development by blocking in the ${CoachText.PIECE_PLACEHOLDER} bishop with a pawn.`, `blocked-bishop-sentences/2/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //Player allowed the opponent to have a passed pawn.
    public static readonly CREATED_PASSED_PAWN_FOR_OPPONENT_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`This is giving the opponent a passed pawn, which can be difficult to stop from queening at times.`, `created-passed-pawn-for-opponent-sentences/0/audio.mp3`),
        new CoachSentence(`It's best to avoid giving the opponent a passed pawn wherever possible.`, `created-passed-pawn-for-opponent-sentences/1/audio.mp3`),
        new CoachSentence(`This creates a passed pawn for the opponent.`, `created-passed-pawn-for-opponent-sentences/2/audio.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} will need to watch out for the passed pawn they created for their opponent, as it will have an easier time queening.`, `created-passed-pawn-for-opponent-sentences/3/audio_${CoachText.TURN_PLACEHOLDER}.mp3`)
    ]

    //Player isolated their own pawn
    public static readonly ISOLATED_OWN_PAWN_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`This isolates ${CoachText.TURN_PLACEHOLDER}'s pawn, giving it no defence from other ones.`, `isolated-own-pawn-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`Now ${CoachText.TURN_PLACEHOLDER} has an isolated pawn.`, `isolated-own-pawn-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`Being stuck with an isolated pawn may make it harder to advance long-term.`, `isolated-own-pawn-sentences/2/audio.mp3`)
    ]

    //Player weakened their castled king with a b or g pawn push
    public static readonly WEAKENED_KING_WITH_PAWN_MOVE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`That pawn is there to protect the king, moving it simply reduces king safety.`, `weakened-king-with-pawn-move-sentences/0/audio.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} is weakening their king with that pawn move.`, `weakened-king-with-pawn-move-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`That pawn move undermines the safety of ${CoachText.TURN_PLACEHOLDER}'s king, as it can potentially allow infiltration.`, `weakened-king-with-pawn-move-sentences/2/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`That pawn move can weaken the safety of a castled king.`, `weakened-king-with-pawn-move-sentences/3/audio.mp3`)
    ]

    //Missed attacking pawn chain.
    public static readonly MISSED_PAWN_CHAIN_ATTACK_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`A better option was to attack a pawn chain.`, `missed-pawn-chain-attack-sentences/0/audio.mp3`),
        new CoachSentence(`A better bet here was to apply pressure to the opponent's pawn chain.`, `missed-pawn-chain-attack-sentences/1/audio.mp3`),
        new CoachSentence(`A better bet here was to force open the position by attacking a pawn chain.`, `missed-pawn-chain-attack-sentences/2/audio.mp3`)
    ]

    //Was a better way to attack a pawn chain
    public static readonly WRONG_PAWN_CHAIN_ATTACK_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} correctly identified the need to interfere with the opponent's pawn structure, but had a better option to do so.`, `wrong-pawn-chain-attack-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`They had a better way to apply pressure to a pawn chain.`, `wrong-pawn-chain-attack-sentences/1/audio.mp3`),
        new CoachSentence(`There was a better way to attack a pawn chain here.`, `wrong-pawn-chain-attack-sentences/2/audio.mp3`)
    ]

    //Should have struck in the center with a pawn.
    public static readonly MISSED_CENTER_STRIKE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`A better option here was to strike in the center with a pawn.`, `missed-center-strike-sentences/0/audio.mp3`),
        new CoachSentence(`${CoachText.PIECE_PLACEHOLDER} should have taken center space with a pawn.`, `missed-center-strike-sentences/1/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`This misses an opportunity to take center space with a pawn.`, `missed-center-strike-sentences/2/audio.mp3`),
        new CoachSentence(`They really should have taken the chance to bust open the center with a double pawn move.`, `missed-center-strike-sentences/3/audio.mp3`),
        new CoachSentence(`A better option was to increase center control with a pawn.`, `missed-center-strike-sentences/4/audio.mp3`)
    ]

    //Should have moved a piece to safety in a different way.
    public static readonly BETTER_SAFETY_MOVE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`There was a better way to move a ${CoachText.PIECE_PLACEHOLDER} to safety.`, `better-safety-move-sentences/0/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`They missed a better way to move a ${CoachText.PIECE_PLACEHOLDER} to safety.`, `better-safety-move-sentences/1/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`There was a better way to safely secure their ${CoachText.PIECE_PLACEHOLDER}.`, `better-safety-move-sentences/2/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //Should have defended a piece with a different piece.
    public static readonly BETTER_DEFEND_MOVE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`They missed a better option to defend a piece that was under attack.`, `better-defend-move-sentences/0/audio.mp3`),
        new CoachSentence(`There was a better way to defend a hanging piece here.`, `better-defend-move-sentences/1/audio.mp3`)
    ]

    //Player should have forced the loss of castling rights.
    public static readonly MISSED_FORCED_LOSS_OF_CASTLING_RIGHTS_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`A better move in this position was to force the loss of castling rights.`, `missed-forced-loss-of-castling-rights-sentences/0/audio.mp3`),
        new CoachSentence(`This misses an opportunity to force the loss of castling rights.`, `missed-forced-loss-of-castling-rights-sentences/1/audio.mp3`),
        new CoachSentence(`There was a chance to force the loss of castling rights, and by extension, king safety, but ${CoachText.TURN_PLACEHOLDER} overlooked it.`, `missed-forced-loss-of-castling-rights-sentences/2/audio_${CoachText.TURN_PLACEHOLDER}.mp3`)
    ]

    //Player should have discovered checked the opponent
    public static readonly MISSED_DISCOVERED_CHECK_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`A better option was to launch a discovered check.`, `missed-discovered-check-sentences/0/audio.mp3`),
        new CoachSentence(`The best option here was to launch a discovered check on the enemy king.`, `missed-discovered-check-sentences/1/audio.mp3`),
        new CoachSentence(`The better course of action here was to discovered-check the king.`, `missed-discovered-check-sentences/2/audio.mp3`)
    ]

    //Player should have double checked the opponent.
    public static readonly MISSED_DOUBLE_CHECK_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`The best option here was to hit the enemy king with a double check.`, `missed-double-check-sentences/0/audio.mp3`),
        new CoachSentence(`This overlooks a chance to use the most powerful tactic in chess: A double check.`, `missed-double-check-sentences/1/audio.mp3`)
    ]

    //Player had a better option to discovered check
    public static readonly BETTER_DISCOVERED_CHECK_OPTION_SENTENCES: Array<CoachSentence>=
    [
        new CoachSentence(`There was a better way to launch a discovered check on the enemy king.`, `better-discovered-check-option-sentences/0/audio.mp3`),
        new CoachSentence(`They had a better option to launch a discovered attack on the king.`, `better-discovered-check-option-sentences/1/audio.mp3`)
    ]

    //Player missed an opportunity to take an outpost with a knight.
    public static readonly MISSED_OUTPOST_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`They had a chance to take an outpost with a knight to make its presence stronger but missed it.`, `missed-outpost-sentences/0/audio.mp3`),
        new CoachSentence(`This missed a chance to take an outpost with a knight.`, `missed-outpost-sentences/1/audio.mp3`),
        new CoachSentence(`They should have taken an outpost with a knight here.`, `missed-outpost-sentences/2/audio.mp3`),
        new CoachSentence(`Taking an outpost with a knight would have made the thing a lot harder to kill.`, `missed-outpost-sentences/3/audio.mp3`)
    ]

    //Player took wrong outpost with a knight.
    public static WRONG_OUTPOST_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`There was a better way to take an outpost with a knight.`, `wrong-outpost-sentences/0/audio.mp3`),
        new CoachSentence(`There was a better way an outpost could have been achieved with the knight.`, `wrong-outpost-sentences/1/audio.mp3`),
        new CoachSentence(`There was a more powerful outpost square for that knight.`, `wrong-outpost-sentences/2/audio.mp3`)
    ]

    //#endregion

    //#region Good============
    //Player accurately found a mating sequence.
    public static readonly FOUND_MATE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} can now force checkmate with correct play.`, `found-mate-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} will checkmate the opponent if they find the right moves.`, `found-mate-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}.mp3`)
    ];

    //Player is continuing mating sequence.
    public static readonly ON_ROAD_TO_CHECKMATE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} is still on the road to checkmate.`, `on-road-to-checkmate-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`)
    ];

    //Player has positioned a piece to win material through a fork.
    public static readonly FOUND_FORK_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} is able to pick up a ${CoachText.PIECE_PLACEHOLDER} with that fork.`, `found-fork-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} can now win a ${CoachText.PIECE_PLACEHOLDER} with that fork.`, `found-fork-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //Player has pinned a piece.
    public static readonly FOUND_PIN_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`This is a good move as it pins a ${CoachText.PIECE_PLACEHOLDER} to the ${CoachText.SECONDARY_PIECE_PLACEHOLDER}, restricting its control over further squares.`, `found-pin-sentences/0/audio_${CoachText.PIECE_PLACEHOLDER}_${CoachText.SECONDARY_PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`The opponent will have to watch the pin on their ${CoachText.PIECE_PLACEHOLDER}.`, `found-pin-sentences/1/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} just pinned the ${CoachText.PIECE_PLACEHOLDER} to the ${CoachText.SECONDARY_PIECE_PLACEHOLDER}, restricting its mobility.`, `found-pin-sentences/2/audio_${CoachText.PIECE_PLACEHOLDER}_${CoachText.SECONDARY_PIECE_PLACEHOLDER}.mp3`)
    ]

    //Player set up a skewer
    public static readonly FOUND_SKEWER_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`Amazing! ${CoachText.TURN_PLACEHOLDER} has set up a skewer, which can win a ${CoachText.PIECE_PLACEHOLDER}!`, `found-skewer-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} can win a ${CoachText.PIECE_PLACEHOLDER} through a skewer.`, `found-skewer-sentences/1/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //Player connected their rooks
    public static readonly CONNECTED_ROOKS_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`A great find by ${CoachText.TURN_PLACEHOLDER}, connecting the rooks will allow them to provide mutual defence.`, `connected-rooks-sentences/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`Connected rooks are a good idea, as they can easily defend each other this way.`, `connected-rooks-sentences/1/audio.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} has connected their rooks, allowing them to team up more effectively.`, `connected-rooks-sentences/2/audio_${CoachText.TURN_PLACEHOLDER}.mp3`)
    ]

    //Player accurately castled kingside
    public static readonly CASTLED_KINGSIDE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`Castling kingside is generally better for king safety as the king is further from the center.`, `castled-kingside-sentences/0/audio.mp3`),
        new CoachSentence(`Castling kingside is a solid defensive choice that quickly hides the king behind a safe pawn shield.`, `castled-kingside-sentences/1/audio.mp3`),
        new CoachSentence(`Securing the king via a kingside castle and activating a rook.`, `castled-kingside-sentences/2/audio.mp3`)
    ]

    //Player accurately castled queenside
    public static readonly CASTLED_QUEENSIDE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`Because the king starts closer to open lines, timing and preparation are critical to avoid tactical pressure when choosing a queenside castle.`, `castled-queenside-sentences/0/audio.mp3`),
        new CoachSentence(`Castling queenside is considered a good balance between king safety and piece activity because your rook starts closer to the center files.`, `castled-queenside-sentences/1/audio.mp3`),
        new CoachSentence(`Castling queenside is an ambitious choice that often supports faster piece activity on the center and queenside.`, `castled-queenside-sentences/2/audio.mp3`)
    ]

    //players caseul on opposite sides
    public static readonly OPPOSITE_SIDE_CASTLING_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`Players chose to castle on opposite sides, often resulting in a race to see who can pawn storm the crap out of the other first.`, `opposite-side-castling-sentences/0/audio.mp3`),
        new CoachSentence(`Opposite-side castling often leads to both interesting and highly aggressive games with pawn bombardments on either side.`, `opposite-side-castling-sentences/1/audio.mp3`),
        new CoachSentence(`When opposite-side castling occurs, small inaccuracies can decide the game quickly since both kings are in direct line of fire.`, `opposite-side-castling-sentences/2/audio.mp3`),
        new CoachSentence(`Oooh, opposite side castling... It becomes a race to see who can bust down the other's defence first with a pawn storm.`, `opposite-side-castling-sentences/3/audio.mp3`)
    ]

    //player cleared the necessary squares to castle on a side
    public static readonly CLEARED_CASTLING_WAY_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`This development prepares a safe ${CoachText.PIECE_PLACEHOLDER}side castle for ${CoachText.TURN_PLACEHOLDER}'s king.`, `cleared-castling-way-sentences/0/audio_${CoachText.PIECE_PLACEHOLDER}_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`Good development here will allow for ${CoachText.PIECE_PLACEHOLDER}side castling as early as next move.`, `cleared-castling-way-sentences/1/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} is preparing to potentially castle ${CoachText.PIECE_PLACEHOLDER}side with this move.`, `cleared-castling-way-sentences/2/audio_${CoachText.TURN_PLACEHOLDER}_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //player placed their rook on an open file.
    public static readonly TOOK_OPEN_FILE_WITH_ROOK: Array<CoachSentence> =
    [
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} placed their rook on an open file.`, `took-open-file-with-rook/0/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} is controlling the open file with their rook.`, `took-open-file-with-rook/1/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`${CoachText.TURN_PLACEHOLDER} took an open file with their rook.`, `took-open-file-with-rook/2/audio_${CoachText.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`Placing the rook on an open file will increase ${CoachText.TURN_PLACEHOLDER}'s control over the board.`, `took-open-file-with-rook/3/audio_${CoachText.TURN_PLACEHOLDER}.mp3`)
    ]

    //Player forced opponent to double pawns.
    public static readonly FORCED_DOUBLING_OF_PAWNS_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`Nice, now the opponent's best move is to double their own pawns, damaging their structure.`, `forced-doubling-of-pawns-sentences/0/audio.mp3`),
        new CoachSentence(`This will make the opponent double their pawns with the best move, reducing pawn mobility.`, `forced-doubling-of-pawns-sentences/1/audio.mp3`),
        new CoachSentence(`With the best move in the opponent's position, pawns will become doubled, hindering mobility and creating easy targets long-term.`, `forced-doubling-of-pawns-sentences/2/audio.mp3`),
        new CoachSentence(`Good, now they have to double pawns in order to maintain the best position possible in their circumstances.`, `forced-doubling-of-pawns-sentences/3/audio.mp3`)
    ]

    //Player recaptured a piece.
    public static readonly CAPTURE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`A straightforward capture.`, `capture-sentences/0/audio.mp3`),
        new CoachSentence(`Good capture.`, `capture-sentences/1/audio.mp3`),
        new CoachSentence(`Capturing.`, `capture-sentences/2/audio.mp3`),
        new CoachSentence(`Well done, a solid capture.`, `capture-sentences/3/audio.mp3`)
    ]

    //Player created a passed pawn for themselves
    public static readonly CREATED_PASSED_PAWN_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`This creates a passed pawn with a clear path to promotion.`, `created-passed-pawn-sentences/0/audio.mp3`),
        new CoachSentence(`The opponent will have to watch that passed pawn.`, `created-passed-pawn-sentences/1/audio.mp3`),
        new CoachSentence(`The opponent will have to be careful of that newly created passed pawn.`, `created-passed-pawn-sentences/2/audio.mp3`),
        new CoachSentence(`This makes a passed pawn, potentially making it easier to promote to a queen.`, `created-passed-pawn-sentences/3/audio.mp3`)
    ]

    //Player sat a piece on the promotion square of a passed pawn preventing it from queening.
    public static readonly SAT_PIECE_ON_PROMOTION_SQUARE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`Cool idea, that passed pawn cannot promote as long as that ${CoachText.PIECE_PLACEHOLDER} is chilling there. `, `sat-piece-on-promotion-square-sentences/0/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`That passed pawn won't be promoting with that ${CoachText.PIECE_PLACEHOLDER} sitting on its promotion square. `, `sat-piece-on-promotion-square-sentences/1/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //Player accurately attacked a pawn chain
    public static readonly ATTACKED_PAWN_CHAIN_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`This applies pressure to the opponent's pawn chain, undermining their overall structure.`, `attacked-pawn-chain-sentences/0/audio.mp3`),
        new CoachSentence(`This move attacks a pawn chain.`, `attacked-pawn-chain-sentences/1/audio.mp3`),
        new CoachSentence(`Solid, this is applying pressure to that pawn chain.`, `attacked-pawn-chain-sentences/2/audio.mp3`),
        new CoachSentence(`Attacking the pawn chain is a good way to open up the position.`, `attacked-pawn-chain-sentences/3/audio.mp3`)
    ]

    //Player forced the loss of castling rights.
    public static readonly FORCED_LOSS_OF_CASTLING_RIGHTS_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`Nice, now the best move is for the opponent to lose castling rights.`, `forced-loss-of-castling-rights-sentences/0/audio.mp3`),
        new CoachSentence(`The best move for the opponent in this position is to completely lose the right to castle.`, `forced-loss-of-castling-rights-sentences/1/audio.mp3`),
        new CoachSentence(`Now the opponent has to lose castling rights to maintain the best possible position.`, `forced-loss-of-castling-rights-sentences/2/audio.mp3`)
    ]

    //Player set up a discovered check
    public static readonly DISCOVERED_CHECK_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`That move just hit the king with a discovered check.`, `discovered-check-sentences/0/audio.mp3`),
        new CoachSentence(`A discovered check was used in order to pressure both the king and other pieces at the same time.`, `discovered-check-sentences/1/audio.mp3`),
        new CoachSentence(`Discovered checks like that are always scary.`, `discovered-check-sentences/2/audio.mp3`),
        new CoachSentence(`The opponent's king just got hit with a discovered check tactic.`, `discovered-check-sentences/3/audio.mp3`)
    ]

    //Player used a double check
    public static readonly DOUBLE_CHECK_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`The most badass and scary tactic in chess, the double check. This forces the opponent to move the king.`, `double-check-sentences/0/audio.mp3`),
        new CoachSentence(`That double check will force the opponent to move their king.`, `double-check-sentences/1/audio.mp3`),
        new CoachSentence(`That double check puts a ton of pressure on the enemy king.`, `double-check-sentences/2/audio.mp3`),
        new CoachSentence(`Even the laziest king flees wildly in the face of a double check.`, `double-check-sentences/3/audio.mp3`)
    ]
    //#endregion

    //#region Good (development)
    //moved a center pawn allowing bishop development
    public static readonly PREPARES_BISHOP_FOR_DEVELOPMENT_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence("This move prepares a bishop for development.", `prepares-bishop-for-development-sentences/0/audio.mp3`),
        new CoachSentence("This move prepares the bishop to become active.", `prepares-bishop-for-development-sentences/1/audio.mp3`),
        new CoachSentence("Moving the pawn allowing the bishop to step into the action.", `prepares-bishop-for-development-sentences/2/audio.mp3`)
    ]

    //moved the pawn allowing a bishop to be fianchettoed
    public static readonly PREPARES_BISHOP_FOR_FIANCHETTO_DEVELOPMENT_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence("This prepares the bishop for a fianchetto to control the main diagonal.", `prepares-bishop-for-fianchetto-development-sentences/0/audio.mp3`),
        new CoachSentence("Opens their bishop up for a fianchetto move to exert pressure on the long diagonal.", `prepares-bishop-for-fianchetto-development-sentences/1/audio.mp3`)
    ]

    //moved the bishop out
    public static readonly BISHOP_DEVELOPED_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`${this.TURN_PLACEHOLDER} develops their bishop off its starting square.`, `bishop-developed-sentences/0/audio_${this.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`Their bishop comes into play, joining the action.`, `bishop-developed-sentences/1/audio.mp3`),
        new CoachSentence(`${this.TURN_PLACEHOLDER} activates their bishop to control surrounding squares.`, `bishop-developed-sentences/2/audio_${this.TURN_PLACEHOLDER}.mp3`),
        new CoachSentence(`The bishop comes into play to control the diagonals.`, `bishop-developed-sentences/3/audio.mp3`)
    ]

    //moved the bishop out on the main diag.
    public static readonly BISHOP_FIANCHETTOED_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`They fianchettoed their bishop in order to snipe enemy pieces from a distance. `, `bishop-fianchettoed-sentences/0/audio.mp3`),
        new CoachSentence(`This fianchettos the bishop on the long diagonal, prioritizing long-range effectiveness. `, `bishop-fianchettoed-sentences/1/audio.mp3`),
        new CoachSentence(`Fianchettoing their bishop, putting pressure on the main diagonal. `, `bishop-fianchettoed-sentences/2/audio.mp3`)
    ]

    //developed the knight and attacked the center.
    public static readonly KNIGHT_DEVELOPMENT_CENTER_CONTROL_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence("This brings the knight into play and increases influence in the center.", `knight-development-center-control-sentences/0/audio.mp3`),
        new CoachSentence("This move develops the knight and pressures key squares in the center.", `knight-development-center-control-sentences/1/audio.mp3`),
        new CoachSentence("The knight is brought into play, eyeing the central squares.", `knight-development-center-control-sentences/2/audio.mp3`),
        new CoachSentence("This aims to control central space with the knight.", `knight-development-center-control-sentences/3/audio.mp3`),
        new CoachSentence("The knight is moved to an active square, strengthening control over the center.", `knight-development-center-control-sentences/4/audio.mp3`),
        new CoachSentence("Develops the knight and attacks the center.", `knight-development-center-control-sentences/5/audio.mp3`)
    ]

    //forced an isolated pawn for the opponent.
    public static readonly ISOLATED_OPPONENT_PAWN_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`Now the opponent has an isolated pawn.`, `isolated-opponent-pawn-sentences/0/audio.mp3`),
        new CoachSentence(`Now the opponent is stuck with an isolated pawn which has no help from others.`, `isolated-opponent-pawn-sentences/1/audio.mp3`),
        new CoachSentence(`Pawns excel at defending each other when pushing to the other side, and isolating that pawn will make that much harder for the opponent.`, `isolated-opponent-pawn-sentences/2/audio.mp3`),
        new CoachSentence(`This forces the opponent to have an isolated pawn, which has no existing adjacent ones to help defend it.`, `isolated-opponent-pawn-sentences/3/audio.mp3`),
        new CoachSentence(`This creates an isolated pawn for the opponent, breaking the backbone of their structure.`, `isolated-opponent-pawn-sentences/4/audio.mp3`)
    ]

    //Defended a hanging piece
    public static readonly DEFENDED_HANGING_PIECE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`This defends a piece that was previously under attack.`, `defended-hanging-piece-sentences/0/audio.mp3`),
        new CoachSentence(`This defends their hanging piece.`, `defended-hanging-piece-sentences/1/audio.mp3`),
        new CoachSentence(`They protected a piece that was under attack.`, `defended-hanging-piece-sentences/2/audio.mp3`),
        new CoachSentence(`They are correctly providing protection for a piece that was under attack.`, `defended-hanging-piece-sentences/3/audio.mp3`),
        new CoachSentence(`That piece is no longer hanging, and is now defended.`, `defended-hanging-piece-sentences/4/audio.mp3`)
    ]

    //Stepped a hanging piece out of trouble
    public static readonly MOVED_HANGING_PIECE_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`The ${CoachText.PIECE_PLACEHOLDER} moves away as they avoid material loss.`, `moved-hanging-piece-sentences/0/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`They moved their ${CoachText.PIECE_PLACEHOLDER} to safety.`, `moved-hanging-piece-sentences/1/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`They stepped their ${CoachText.PIECE_PLACEHOLDER} out of the way before it could be captured.`, `moved-hanging-piece-sentences/2/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`This moves the previously hanging ${CoachText.PIECE_PLACEHOLDER} to a safer square.`, `moved-hanging-piece-sentences/3/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //Blocked opponent's castling with a piece
    public static readonly BLOCKING_CASTLING_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`This now prevents the opponent from castling ${CoachText.PIECE_PLACEHOLDER}side.`, `blocking-castling-sentences/0/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`The opponent's ability to castle ${CoachText.PIECE_PLACEHOLDER}side is now on hold since a piece is targeting the square it must pass through. `, `blocking-castling-sentences/1/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`The opponent cannot castle ${CoachText.PIECE_PLACEHOLDER}side as long as that piece is blocking its path.`, `blocking-castling-sentences/2/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //Kicked a piece with a pawn
    public static readonly KICKED_PIECE_WITH_PAWN_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`This kicks a ${CoachText.PIECE_PLACEHOLDER} with a pawn, forcing it to move or be captured.`, `kicked-piece-with-pawn-sentences/0/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`This threatens a ${CoachText.PIECE_PLACEHOLDER} with a pawn.`, `kicked-piece-with-pawn-sentences/1/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`That pawn move attacks a ${CoachText.PIECE_PLACEHOLDER}, pushing it out of its current position.`, `kicked-piece-with-pawn-sentences/2/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`),
        new CoachSentence(`Kicking the ${CoachText.PIECE_PLACEHOLDER} with a pawn.`, `kicked-piece-with-pawn-sentences/3/audio_${CoachText.PIECE_PLACEHOLDER}.mp3`)
    ]

    //Took an outpost with a knight
    public static readonly TOOK_OUTPOST_WITH_KNIGHT_SENTENCES: Array<CoachSentence> =
    [
        new CoachSentence(`Their knight took an outpost square, making it unattackable by pawns and difficult to fight with pieces.`, `took-outpost-with-knight-sentences/0/audio.mp3`),
        new CoachSentence(`This takes an outpost with a knight, giving it a strong presence inside enemy lines.`, `took-outpost-with-knight-sentences/1/audio.mp3`),
        new CoachSentence(`That is a comfy outpost square for the knight.`, `took-outpost-with-knight-sentences/2/audio.mp3`)
    ]
    //#endregion

    //#region Text helper functions

    public static convertPieceToText(piece: string): string
    {
        //Pawn
        if (piece === PieceType.WHITE_PAWN || piece === PieceType.BLACK_PAWN || piece === PieceType.PAWN)
        {
            return "pawn";
        }

        //Knight
        if (piece === PieceType.WHITE_KNIGHT || piece === PieceType.BLACK_KNIGHT || piece === PieceType.KNIGHT)
        {
            return "knight";
        }

        //Bishop
        if (piece === PieceType.WHITE_BISHOP || piece === PieceType.BLACK_BISHOP || piece === PieceType.BISHOP)
        {
            return "bishop";
        }

        //Rook
        if (piece === PieceType.WHITE_ROOK || piece === PieceType.BLACK_ROOK || piece === PieceType.ROOK)
        {
            return "rook";
        }

        //Queen
        if (piece === PieceType.WHITE_QUEEN || piece === PieceType.BLACK_QUEEN || piece === PieceType.QUEEN)
        {
            return "queen";
        }

        //King
        if (piece === PieceType.WHITE_KING || piece === PieceType.BLACK_KING || piece === PieceType.KING)
        {
            return "king";
        }

        return piece;
    }

    public static getAndFormatRandomSentence(
        sentenceArray: Array<CoachSentence>, 
        playerColor: string, 
        piece: string = "", 
        secondaryPiece: string = ""
    ): FormattedCoachSentence {
        if (!sentenceArray || sentenceArray.length === 0) return {text: "", audioPath: ""} as FormattedCoachSentence;

        const randomIndex = Math.floor(Math.random() * sentenceArray.length);
        const selectedTemplate = sentenceArray[randomIndex];

        const pieceText = CoachText.convertPieceToText(piece);
        const secondaryPieceText = CoachText.convertPieceToText(secondaryPiece);

        return selectedTemplate.format(playerColor, pieceText, secondaryPieceText);
    }

    /**
     * Handles the logic of adding a formatted sentence to the move object.
     */
    public static addCoachSentence(
        move: MoveResult, 
        sentenceArray: Array<CoachSentence>, 
        playerColor: string, 
        piece: string = "", 
        secondaryPiece: string = ""
    ): void {
        const sentence = this.getAndFormatRandomSentence(sentenceArray, playerColor, piece, secondaryPiece);
        
        if (sentence) {
            move.coachSentences.push(sentence);
        }
    }

    private static _formatCoachStringWithPlaceholders(sentence: string, playerColor: string, piece: string, secondaryPiece: string): string
    {
        return sentence
            .replace(CoachText.TURN_PLACEHOLDER, playerColor)
            .replace(CoachText.PIECE_PLACEHOLDER, piece)
            .replace(CoachText.SECONDARY_PIECE_PLACEHOLDER, secondaryPiece);
    }

    public static selectAndFormatSentence(arr: Array<string>, playerColor: string, piece: string = "", secondaryPiece: string = "")
    {
        let newSentence = arr[CoachText.getRandomIndex(arr.length)];
        newSentence = this._formatCoachStringWithPlaceholders(newSentence, playerColor, CoachText.convertPieceToText(piece), CoachText.convertPieceToText(secondaryPiece));

        return newSentence;
    }

    private static getRandomIndex(length: number)
    {
        return Math.floor(Math.random() * length);
    }
    //#endregion
}