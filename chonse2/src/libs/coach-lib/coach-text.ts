import { PieceType } from "../chonse2-lib/piece-type";
import { MoveClassification } from "../engine-lib/types/enums";

export default class CoachText 
{
    //#region Static text data
    static readonly TURN_PLACEHOLDER = "{turn}";
    static readonly PIECE_PLACEHOLDER = "{piece}";
    static readonly SECONDARY_PIECE_PLACEHOLDER = "{piece2}";

    static readonly LIGHT_SQUARED = "light-squared";
    static readonly DARK_SQUARED = "dark-squared";

    //At minimum one sentence should be displayed.
    public static readonly BASE_SENTENCES: Map<MoveClassification, string[]> = new Map<MoveClassification, string[]>(
        [
            //Luminous moves.
            [MoveClassification.Luminous, 
                [
                    `Well done, a luminous sacrifice of the ${this.PIECE_PLACEHOLDER}! `,
                    `A luminous sacrifice. Leaving that ${this.PIECE_PLACEHOLDER} hanging will improve the position. I see what ${this.TURN_PLACEHOLDER} is trying to do here. `,
                    `And ${this.TURN_PLACEHOLDER} sacrifices........ the ${this.PIECE_PLACEHOLDER}!!!!! `
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

    //#region Game end

    //Player checkmated the king
    public static readonly CHECKMATE_SENTENCES: Array<string> = 
    [
        `${CoachText.TURN_PLACEHOLDER} did it! Nice checkmate! `,
        `Checkmate and the game is over! `,
        `Checkmate is always the best move! `,
        `Always feels luminous to win! 🩵 `
    ]
    
    //Game ends in stalemate.
    public static readonly STALEMATE_SENTENCES: Array<string> = 
    [
        `Snatching a stalemate from the jaws of defeat! `,
        `Stalemate, a fitting end to this intense game. `,
        `The king had no legal moves, but was not in check. The game ends in a stalemate. `,
    ]

    //Game ends in a draw.
    public static readonly DRAW_SENTENCES: Array<string> = 
    [
        `As they say, perfect chess is always a draw. `,
        `And the game ends in a draw. `,
        `Draw, the game is over. `
    ]
    //#endregion

    //#region Bad=============
    //If the player just hung a piece.
    public static readonly PIECE_HANG_SENTENCES: Array<string> = 
    [
        `OUCH, ${CoachText.TURN_PLACEHOLDER} left their ${CoachText.PIECE_PLACEHOLDER} hanging! `,
        `Whoopsie, ${CoachText.TURN_PLACEHOLDER} gave up a ${CoachText.PIECE_PLACEHOLDER}! `,
        `This move loses a ${CoachText.PIECE_PLACEHOLDER}. `
    ];

    public static readonly QUEEN_BLUNDER_SENTENCES: Array<string> = 
    [
        `${CoachText.TURN_PLACEHOLDER}... your QUEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEN!!! `,
        `${CoachText.TURN_PLACEHOLDER} just blundered their queen. `,
        `BLUNDERING THE QUEEN FOR NO REASON WHATSOEVER! `
    ]

    //If the player made a move that will lose material in the line but not outright hanging a piece 
    public static readonly PIECE_LOSS_SENTENCES: Array<string> = 
    [
        `They've made a mistake, and their ${CoachText.PIECE_PLACEHOLDER} is now lost. `,
        `${CoachText.TURN_PLACEHOLDER} slipped up, which will cost them a ${CoachText.PIECE_PLACEHOLDER}. `,
        `They've made an error, allowing the opponent to win ${CoachText.TURN_PLACEHOLDER}'s ${CoachText.PIECE_PLACEHOLDER} with correct play. `,
        `${CoachText.TURN_PLACEHOLDER} is losing a ${CoachText.PIECE_PLACEHOLDER} this way :( `
    ]

    //If the player missed the opportunity to capture a vulnerable piece
    public static readonly MISSED_HANGING_PIECE_SENTENCES: Array<string> =
    [
        `${CoachText.TURN_PLACEHOLDER} missed an opportunity to capture a free ${CoachText.PIECE_PLACEHOLDER}. `,
        `The best bet here was to capture a vulnerable ${CoachText.PIECE_PLACEHOLDER}. `
    ];

    //If the player correctly identifies the best capture but did so with the wrong piece.
    public static readonly CAPTURED_WITH_WRONG_PIECE_SENTENCES: Array<string> = 
    [
        `${CoachText.TURN_PLACEHOLDER} correctly captured the piece, but with the wrong attacker. `,
        `The correct capture was identified, but the best bet was to capture the ${CoachText.PIECE_PLACEHOLDER} with a different piece. `
    ]

    //If the player had a viable checkmate but missed it.
    public static readonly MISSED_CHECKMATE_SENTENCES: Array<string> = 
    [
        `This misses an opportunity to checkmate the king. `,
        `${CoachText.TURN_PLACEHOLDER} had an opportunity to checkmate the king. `,
        `There was an opportunity to force checkmate, but ${CoachText.TURN_PLACEHOLDER} overlooked it. `
    ];

    //If the opponent had a good move but instead allowed forced mate by mistake.
    public static readonly ALLOWED_CHECKMATE_SENTENCES: Array<string> = 
    [
        `This allows the opponent to checkmate the king. `,
        `${CoachText.TURN_PLACEHOLDER} just allowed the opponent to force checkmate. `,
        `${CoachText.TURN_PLACEHOLDER} slipped up, allowing the opponent to force checkmate with correct play. `
    ];

    //If the opponent missed an opportunity to fork two+ pieces.
    public static readonly MISSED_FORK_SENTENCES: Array<string> =
    [
        `${CoachText.TURN_PLACEHOLDER} just missed an opportunity to win material through a fork. `
    ];

    //Allowed an opponent to fork them.
    public static readonly ALLOWED_FORK_SENTENCES: Array<string> = 
    [
        `This allows the opponent to win material through a fork. `,
        `${CoachText.TURN_PLACEHOLDER} just allowed their own piece to get forked. `
    ]

    //Missed the opportunity to pin a piece
    public static readonly MISSED_PIN_SENTENCES: Array<string> = 
    [
        `${CoachText.TURN_PLACEHOLDER} has missed an opportunity to pin a ${CoachText.PIECE_PLACEHOLDER} to the ${CoachText.SECONDARY_PIECE_PLACEHOLDER}. `,
        `The best move for ${CoachText.TURN_PLACEHOLDER} was to cut the mobility of the opponent's ${CoachText.PIECE_PLACEHOLDER} by pinning it to the ${CoachText.SECONDARY_PIECE_PLACEHOLDER}. `
    ]

    //Ignored a relative pin
    public static readonly IGNORED_PIN_SENTENCES: Array<string> = 
    [
        `${CoachText.TURN_PLACEHOLDER} completely ignored the pin of their ${CoachText.PIECE_PLACEHOLDER}, and now their ${CoachText.SECONDARY_PIECE_PLACEHOLDER} is lost. `,
        `${CoachText.TURN_PLACEHOLDER} didn't notice their ${CoachText.PIECE_PLACEHOLDER} was pinned, exposing the ${CoachText.SECONDARY_PIECE_PLACEHOLDER} behind it. `
    ]

    //missed a skewer
    public static readonly MISSED_SKEWER_SENTENCES: Array<string> = 
    [
        `${CoachText.TURN_PLACEHOLDER} lost a chance to win a ${CoachText.PIECE_PLACEHOLDER} through a skewer. `,
        `${CoachText.TURN_PLACEHOLDER} had a chance to acquire a ${CoachText.PIECE_PLACEHOLDER} via a skewer, but overlooked it. `
    ]

    //Allowed their piece to get skewered
    public static readonly ALLOWED_SKEWER_SENTENCES: Array<string> = 
    [
        `${CoachText.TURN_PLACEHOLDER} just allowed their opponent to capture their ${CoachText.PIECE_PLACEHOLDER} with a skewer. `,
        `This allows ${CoachText.TURN_PLACEHOLDER}'s opponent to grab a ${CoachText.PIECE_PLACEHOLDER} through a skewer. `,
    ]

    //Did not connect their rooks
    public static readonly MISSED_ROOK_CONNECTION_SENTENCES: Array<string> =
    [
        `${CoachText.TURN_PLACEHOLDER}'s best move in this position was to connect their rooks in order for them to provide mutual defence. `,
        `Instead, ${CoachText.TURN_PLACEHOLDER} should have connected their rooks so that they can both defend each other and team up for attacks. `,
        `${CoachText.TURN_PLACEHOLDER} missed a chance to connect their rooks here. `
    ]

    //Inaccurately disconnected their rooks
    public static readonly DISCONNECTED_ROOKS: Array<string> = 
    [
        `${CoachText.TURN_PLACEHOLDER} erroneously disconnected their rooks here. They can no longer defend each other. `,
        `${CoachText.TURN_PLACEHOLDER} should have kept their rooks connected. `
    ]

    //Inaccurately missed castling kingside.
    public static readonly MISSED_CASTLING_KINGSIDE: Array<string> = 
    [
        `A better option here was for ${CoachText.TURN_PLACEHOLDER} to secure their king with a kingside castle.`,
        `They should have prioritized king safety via a kingside castle. `,
        `Castling kingside here would have improved king safety and activated a rook immediately. `,
        `Delaying castling leaves their king more exposed in the center, where tactics are more dangerous. `,
        `In most positions like this, early kingside castling is the most reliable way to stabilize. `
    ]

    //Inaccurately missed castling queenside.
    public static readonly MISSED_CASTLING_QUEENSIDE: Array<string> = 
    [
        `Better option here was for ${CoachText.TURN_PLACEHOLDER} to perform a queenside castle, both securing their king and getting a rook extremely active. `,
        `Castling queenside was a better option here, for both king safety and piece activity. `,
        `Castling queenside was the more active option here, giving your rook faster access to central play. while providing good king safety. `,
        `This position favored castling queenside, and delaying it often means missing your best chance to seize the initiative in controlling open files with the corresponding rook. `
    ]

    //Inaccurately missed development
    public static readonly MISSED_DEVELOPMENT: Array<string> = 
    [
        `A better option for ${CoachText.TURN_PLACEHOLDER} was to develop a ${CoachText.PIECE_PLACEHOLDER}. `,
        `${CoachText.TURN_PLACEHOLDER} should have focused on developing their ${CoachText.PIECE_PLACEHOLDER} here instead. `,
        `${CoachText.TURN_PLACEHOLDER} missed a chance to develop a ${CoachText.PIECE_PLACEHOLDER}. `
        
    ]

    //Developed a piece but there was a better way to do so.
    public static readonly INCORRECT_DEVELOPMENT: Array<string> = 
    [
        `There was a better way for ${CoachText.TURN_PLACEHOLDER} to have developed their ${CoachText.PIECE_PLACEHOLDER} here. `,
        `${CoachText.TURN_PLACEHOLDER} correctly identified that their ${CoachText.PIECE_PLACEHOLDER} needed to be developed, but there was a better development square. `,
        `${CoachText.TURN_PLACEHOLDER} had a better way to develop their ${CoachText.PIECE_PLACEHOLDER} long-term. `
    ]

    //Player should have placed their rook on an open file.
    public static readonly MISSED_ROOK_OPEN_FILE_SENTENCES: Array<string> =
    [
        `Taking an open file with the rook would have increased its scope tremendously. `,
        `${CoachText.TURN_PLACEHOLDER} should have increased the scope of their rook by moving it to an open file. `,
        `${CoachText.TURN_PLACEHOLDER}'s better option here was to take an open file with a rook. `,
    ]

    //Player missed an opportunity to force doubling of pawns.
    public static readonly MISSED_FORCED_DOUBLED_PAWNS: Array<string>  = 
    [
        `The best move here was to force doubling of pawns. `,
        `They should have forced the opponent to double their pawns. `,
        `They missed an opportunity to force the opponent to damage their structure by doubling pawns. `,
    ]

    //Player blocked their own bishop with a pawn.
    public static readonly BLOCKED_BISHOP_SENTENCES: Array<string> = 
    [
        `They are blocking in their ${CoachText.PIECE_PLACEHOLDER} bishop with their pawn by doing this. `,
        `The ${CoachText.PIECE_PLACEHOLDER} bishop is being blocked by a pawn with this move. `,
        `This move weakens ${CoachText.TURN_PLACEHOLDER}'s development by blocking in the ${CoachText.PIECE_PLACEHOLDER} bishop with a pawn. `
    ]

    //Player allowed the opponent to have a passed pawn.
    public static readonly CREATED_PASSED_PAWN_FOR_OPPONENT_SENTENCES: Array<string> = 
    [
        `This is giving the opponent a passed pawn, which can be difficult to stop from queening at times. `,
        `It's best to avoid giving the opponent a passed pawn wherever possible. `,
        `This creates a passed pawn for the opponent. `,
        `${CoachText.TURN_PLACEHOLDER} will need to watch out for the passed pawn they created for their opponent, as it will have an easier time queening. `
    ]

    //Player isolated their own pawn
    public static readonly ISOLATED_OWN_PAWN_SENTENCES: Array<string> = 
    [
        `This isolates ${CoachText.TURN_PLACEHOLDER}'s pawn, giving it no defence from other ones. `,
        `Now ${CoachText.TURN_PLACEHOLDER} has an isolated pawn. `,
        `Being stuck with an isolated pawn may make it harder to advance long-term. `,
    ]

    //Player weakened their castled king with a b or g pawn push
    public static readonly WEAKENED_KING_WITH_PAWN_MOVE_SENTENCES: Array<string> = 
    [
        `That pawn is there to protect the king, moving it simply reduces king safety. `,
        `${CoachText.TURN_PLACEHOLDER} is weakening their king with that pawn move. `,
        `That pawn move undermines the safety of ${CoachText.TURN_PLACEHOLDER}'s king, as it can potentially allow infiltration. `,
        `That pawn move can weaken the safety of a castled king. `
    ]

    //Missed attacking pawn chain.
    public static readonly MISSED_PAWN_CHAIN_ATTACK_SENTENCES: Array<string> = 
    [
        `A better option was to attack a pawn chain. `,
        `A better bet here was to apply pressure to the opponent's pawn chain. `,
        `A better bet here was to force open the position by attacking a pawn chain. `,
    ]

    //Was a better way to attack a pawn chain
    public static readonly WRONG_PAWN_CHAIN_ATTACK_SENTENCES: Array<string> = 
    [
        `${CoachText.TURN_PLACEHOLDER} correctly identified the need to interfere with the opponent's pawn structure, but had a better option to do so. `,
        `They had a better way to apply pressure to a pawn chain. `,
        `There was a better way to attack a pawn chain here. `
    ]

    //Should have struck in the center with a pawn. 
    public static readonly MISSED_CENTER_STRIKE_SENTENCES: Array<string> = 
    [
        `A better option here was to strike in the center with a pawn. `,
        `${CoachText.PIECE_PLACEHOLDER} should have taken center space with a pawn. `,
        `This misses an opportunity to take center space with a pawn. `,
        `They really should have taken the chance to bust open the center with a double pawn move. `,
        `A better option was to increase center control with a pawn. `
    ]

    //Should have moved a piece to safety in a different way.
    public static readonly BETTER_SAFETY_MOVE_SENTENCES: Array<string> = 
    [
        `There was a better way to move a ${CoachText.PIECE_PLACEHOLDER} to safety. `,
        `They missed a better way to move a ${CoachText.PIECE_PLACEHOLDER} to safety. `,
        `They was a better way to safely secure their ${CoachText.PIECE_PLACEHOLDER}. `
    ]

    //Should have defended a piece with a different piece.
    public static readonly BETTER_DEFEND_MOVE_SENTENCES: Array<string> = 
    [
        `They missed a better option to defend a piece that was under attack. `,
        `There was a better way to defend a hanging piece here. `,
    ]

    //Player should have forced the loss of castling rights. 
    public static readonly MISSED_FORCED_LOSS_OF_CASTLING_RIGHTS_SENTENCES: Array<string> = 
    [
        `A better move in this position was to force the loss of castling rights. `,
        `This misses an opportunity to force the loss of castling rights. `,
        `There was a chance to force the loss of castling rights, and by extension, king safety, but ${CoachText.TURN_PLACEHOLDER} overlooked it. `
    ]

    //Player should have discovered checked the opponent
    public static readonly MISSED_DISCOVERED_CHECK_SENTENCES: Array<string> = 
    [
        `A better option was to launch a discovered check. `,
        `The best option here was to launch a discovered check on the enemy king. `,
        `The better course of action here was to discovered-check the king. `
    ]

    //Player should have double checked the opponent. 
    public static readonly MISSED_DOUBLE_CHECK_SENTENCES: Array<string> = 
    [
        `The best option here was to hit the enemy king with a double check. `,
        `This overlooks a chance to use the most powerful tactic in chess: A double check. `
    ]

    //Player had a better option to discovered check
    public static readonly BETTER_DISCOVERED_CHECK_OPTION_SENTENCES: Array<string>=
    [
        `There was a better way to launch a discovered check on the enemy king. `,
        `They had a better option to launch a discovered attack on the king. `
    ]

    //#endregion

    //#region Good============
    //Player accurately found a mating sequence.
    public static readonly FOUND_MATE_SENTENCES: Array<string> = 
    [
        `${CoachText.TURN_PLACEHOLDER} can now force checkmate with correct play. `,
        `${CoachText.TURN_PLACEHOLDER} will checkmate the opponent if they find the right moves. `
    ];

    //Player is continuing mating sequence.
    public static readonly ON_ROAD_TO_CHECKMATE_SENTENCES: Array<string> = 
    [
        `${CoachText.TURN_PLACEHOLDER} is still on the road to checkmate. `,
    ];

    //Player has positioned a piece to win material through a fork.
    public static readonly FOUND_FORK_SENTENCES: Array<string> = 
    [
        `${CoachText.TURN_PLACEHOLDER} is able to pick up a ${CoachText.PIECE_PLACEHOLDER} with that fork. `,
        `${CoachText.TURN_PLACEHOLDER} can now win a ${CoachText.PIECE_PLACEHOLDER} with that fork. `,
    ]

    //Player has pinned a piece.
    public static readonly FOUND_PIN_SENTENCES: Array<string> = 
    [
        `This is a good move as it pins a ${CoachText.PIECE_PLACEHOLDER} to the ${CoachText.SECONDARY_PIECE_PLACEHOLDER}, restricting its control over further squares. `,
        `The opponent will have to watch the pin on their ${CoachText.PIECE_PLACEHOLDER}. `,
        `${CoachText.TURN_PLACEHOLDER} just pinned the ${CoachText.PIECE_PLACEHOLDER} to the ${CoachText.SECONDARY_PIECE_PLACEHOLDER}, restricting its mobility. `
    ]

    //Player set up a skewer
    public static readonly FOUND_SKEWER_SENTENCES: Array<string> = 
    [
        `Amazing! ${CoachText.TURN_PLACEHOLDER} has set up a skewer, which can win a ${CoachText.PIECE_PLACEHOLDER}! `,
        `${CoachText.TURN_PLACEHOLDER} can win a ${CoachText.PIECE_PLACEHOLDER} through a skewer. `
    ]

    //Player connected their rooks
    public static readonly CONNECTED_ROOKS_SENTENCES: Array<string> = 
    [
        `A great find by ${CoachText.TURN_PLACEHOLDER}, connecting the rooks will allow them to provide mutual defence. `,
        `Connected rooks are a good idea, as they can easily defend each other this way. `,
        `${CoachText.TURN_PLACEHOLDER} has connected their rooks, allowing them to team up more effectively. `
    ]

    //Player accurately castled kingside
    public static readonly CASTLED_KINGSIDE_SENTENCES: Array<string> = 
    [
        `Castling kingside is generally better for king safety as the king is further from the center. `,
        `Castling kingside is a solid defensive choice that quickly hides the king behind a safe pawn shield. `,
        `Securing the king via a kingside castle and activating a rook. `
    ]

    //Player accurately castled queenside
    public static readonly CASTLED_QUEENSIDE_SENTENCES: Array<string> = 
    [
        `Because the king starts closer to open lines, timing and preparation are critical to avoid tactical pressure when choosing a queenside castle. `,
        `Castling queenside is considered a good balance between king safety and piece activity because your rook starts closer to the center files. `,
        `Castling queenside is an ambitious choice that often supports faster piece activity on the center and queenside. `,
    ]

    //players caseul on opposite sides
    public static readonly OPPOSITE_SIDE_CASTLING_SENTENCES: Array<string> = 
    [
        `Players chose to castle on opposite sides, often resulting in a race to see who can pawn storm the crap out of the other first. `,
        `Opposite-side castling often leads to both interesting and highly aggressive games with pawn bombardments on either side. `,
        `When opposite-side castling occurs, small inaccuracies can decide the game quickly since both kings are in direct line of fire. `,
        `Oooh, opposite side castling... It becomes a race to see who can bust down the other's defence first with a pawn storm. `,
    ]

    //player cleared the necessary squares to castle on a side
    public static readonly CLEARED_CASTLING_WAY_SENTENCES: Array<string> = 
    [
        `This development prepares a safe ${CoachText.PIECE_PLACEHOLDER}side castle for ${CoachText.TURN_PLACEHOLDER}'s king. `,
        `Good development here will allow for ${CoachText.PIECE_PLACEHOLDER}side castling as early as next move. `,
        `${CoachText.TURN_PLACEHOLDER} is preparing to potentially castle ${CoachText.PIECE_PLACEHOLDER}side with this move. `
    ]

    //player placed their rook on an open file.
    public static readonly TOOK_OPEN_FILE_WITH_ROOK: Array<string> = 
    [
        `${CoachText.TURN_PLACEHOLDER} placed their rook on an open file. `,
        `${CoachText.TURN_PLACEHOLDER} is controlling the open file with their rook. `,
        `${CoachText.TURN_PLACEHOLDER} took an open file with their rook. `,
        `Placing the rook on an open file will increase ${CoachText.TURN_PLACEHOLDER}'s control over the board. `
    ]

    //Player forced opponent to double pawns.
    public static readonly FORCED_DOUBLING_OF_PAWNS_SENTENCES: Array<string> = 
    [
        `Nice, now the opponent's best move is to double their own pawns, damaging their structure. `,
        `This will make the opponent double their pawns with the best move, reducing pawn mobility. `,
        `With the best move in the opponent's position, pawns will become doubled, hindering mobility and creating easy targets long-term. `,
        `Good, now they have to double pawns in order to maintain the best position possible in their circumstances. `
    ]

    //Player recaptured a piece.
    public static readonly CAPTURE_SENTENCES: Array<string> = 
    [
        `A straightforward capture. `,
        `Good capture. `,
        `Capturing. `,
        `Well done, a solid capture. `
    ]

    //Player created a passed pawn for themselves
    public static readonly CREATED_PASSED_PAWN_SENTENCES: Array<string> = 
    [
        `This creates a passed pawn with a clear path to promotion. `,
        `The opponent will have to watch that passed pawn. `,
        `The opponent will have to be careful of that newly created passed pawn. `,
        `This makes a passed pawn, potentially making it easier to promote to a queen. `
    ]

    //Player sat a piece on the promotion square of a passed pawn preventing it from queening.
    public static readonly SAT_PIECE_ON_PROMOTION_SQUARE_SENTENCES: Array<string> = 
    [
        `Cool idea, that passed pawn cannot promote as long as that ${CoachText.PIECE_PLACEHOLDER} is chilling there. `,
        `That passed pawn won't be promoting with ${CoachText.TURN_PLACEHOLDER}'s ${CoachText.PIECE_PLACEHOLDER} sitting on its promotion square. `
    ]

    //Player accurately attacked a pawn chain
    public static readonly ATTACKED_PAWN_CHAIN_SENTENCES: Array<string> = 
    [
        `This applies pressure to the opponent's pawn chain, undermining their overall structure. `,
        `This move attacks a pawn chain. `,
        `Solid, this is applying pressure to that pawn chain. `,
        `Attacking the pawn chain is a good way to open up the position. `
    ]

    //Player forced the loss of castling rights.
    public static readonly FORCED_LOSS_OF_CASTLING_RIGHTS_SENTENCES: Array<string> = 
    [
        `Nice, now the best move is for the opponent to lose castling rights. `,
        `The best move for the opponent in this position is to completely lose the right to castle. `,
        `Now the opponent has to lose castling rights to maintain the best possible position. `
    ]

    //Player set up a discovered check
    public static readonly DISCOVERED_CHECK_SENTENCES: Array<string> = 
    [
        `That move just hit the king with a discovered check. `,
        `A discovered check was used in order to pressure both the king and other pieces at the same time. `,
        `Discovered checks like that are always scary. `,
        `The opponent's king just got hit with a discovered check tactic. `
    ]

    //Player used a double check
    public static readonly DOUBLE_CHECK_SENTENCES: Array<string> = 
    [
        `The most badass and scary tactic in chess, the double check. This forces the opponent to move the king. `,
        `That double check will force the opponent to move their king. `,
        `That double check puts a ton of pressure on the enemy king. `,
        `Even the laziest king flees wildly in the face of a double check.`
    ]
    //#endregion
    
    //#region Good (development)
    //moved a center pawn allowing bishop development
    public static readonly PREPARES_BISHOP_FOR_DEVELOPMENT_SENTENCES: Array<string> = 
    [
        "This move prepares a bishop for development. ",
        "This move prepares the bishop to become active. ",
        "Moving the pawn allowing the bishop to step into the action. "
    ]

    //moved the pawn allowing a bishop to be fianchettoed
    public static readonly PREPARES_BISHOP_FOR_FIANCHETTO_DEVELOPMENT_SENTENCES: Array<string> = 
    [
        "This prepares the bishop for a fianchetto to control the main diagonal. ",
        "Opens their bishop up for a fianchetto move to exert pressure on the long diagonal. "
    ]

    //moved the bishop out
    public static readonly BISHOP_DEVELOPED_SENTENCES: Array<string> = 
    [
        `${this.TURN_PLACEHOLDER} develops their bishop off its starting square. `,
        `Their bishop comes into play, joining the action. `,
        `${this.TURN_PLACEHOLDER} activates their bishop to control surrounding squares. `,
        `The bishop comes into play to control the diagonals. `
    ]

    //moved the bishop out on the main diag.
    public static readonly BISHOP_FIANCHETTOED_SENTENCES: Array<string> = 
    [
        `${this.TURN_PLACEHOLDER} fianchettoed their bishop in order to snipe enemy pieces from a distance. `,
        `This fianchettos the bishop on the long diagonal, prioritizing long-range effectiveness. `,
        `Fianchettoing their bishop, putting pressure on the main diagonal. `
    ]

    //developed the knight and attacked the center.
    public static readonly KNIGHT_DEVELOPMENT_CENTER_CONTROL_SENTENCES: Array<string> = 
    [
        "This brings the knight into play and increases influence in the center. ",
        "This move develops the knight and pressures key squares in the center. ",
        "The knight is brought into play, eyeing the central squares.",
        "This aims to control central space with the knight. ",
        "The knight is moved to an active square, strengthening control over the center. ",
        "Develops the knight and attacks the center. "
    ]

    //forced an isolated pawn for the opponent. 
    public static readonly ISOLATED_OPPONENT_PAWN_SENTENCES: Array<string> = 
    [
        `Now the opponent has an isolated pawn. `,
        `Now the opponent is stuck with an isolated pawn which has no help from others. `,
        `Pawns excel at defending each other when pushing to the other side, and isolating that pawn will make that much harder for the opponent. `,
        `This forces the opponent to have an isolated pawn, which has no existing adjacent ones to help defend it. `,
        `This creates an isolated pawn for the opponent, breaking the backbone of their structure. `
    ]

    //Defended a hanging piece
    public static readonly DEFENDED_HANGING_PIECE_SENTENCES: Array<string> = 
    [
        `This defends a piece that was previously under attack. `,
        `${CoachText.TURN_PLACEHOLDER} defends their hanging piece. `,
        `They protected a piece that was under attack. `,
        `They are correctly providing protection for a piece that was under attack. `,
        `That piece is no longer hanging, and is now defended. `
    ]

    //Stepped a hanging piece out of trouble
    public static readonly MOVED_HANGING_PIECE_SENTENCES: Array<string> = 
    [
        `The ${CoachText.PIECE_PLACEHOLDER} moves away as ${CoachText.TURN_PLACEHOLDER} avoids material loss. `,
        `They moved their ${CoachText.PIECE_PLACEHOLDER} to safety. `,
        `They stepped their ${CoachText.PIECE_PLACEHOLDER} out of the way before it could be captured. `,
        `This moves the previously hanging ${CoachText.PIECE_PLACEHOLDER} to a safer square. `
    ]

    //Blocked opponent's castling with a piece
    public static readonly BLOCKING_CASTLING_SENTENCES: Array<string> = 
    [
        `This now prevents the opponent from castling ${CoachText.PIECE_PLACEHOLDER}side. `,
        `The opponent's ability to castle ${CoachText.PIECE_PLACEHOLDER}side is now on hold since a piece is targeting the square it must pass through. `,
        `The opponent cannot castle ${CoachText.PIECE_PLACEHOLDER}side as long as that piece is blocking its path. `
    ]

    //Kicked a piece with a pawn
    public static readonly KICKED_PIECE_WITH_PAWN_SENTENCES: Array<string> = 
    [
        `This kicks a ${CoachText.PIECE_PLACEHOLDER} with a pawn, forcing it to move or be captured. `,
        `This threatens a ${CoachText.PIECE_PLACEHOLDER} with a pawn. `,
        `That pawn move attacks a ${CoachText.PIECE_PLACEHOLDER}, pushing it out of its current position. `,
        `Kicking the ${CoachText.PIECE_PLACEHOLDER} with a pawn. `
    ]

    //Took an outpost with a knight
    public static readonly TOOK_OUTPOST_WITH_KNIGHT_SENTENCES: Array<string> = 
    [
        `Their knight took an outpost square, making it unattackable by pawns and difficult to fight with pieces. `,
        `This takes an outpost with a knight, giving it a strong presence inside enemy lines. `,
        `That is a comfy outpost square for the knight`
    ]
    //#endregion 

    //#region Text helper functions
    public static getBaseSentence(moveClassification: MoveClassification): string
    {
        //Get random item from hash map
        const sentences = CoachText.BASE_SENTENCES.get(moveClassification ?? MoveClassification.None);
        
        if (sentences)
        {
            const randIndex = this.getRandomIndex(sentences.length);
            return sentences[randIndex];
        }
        return "";
    }


    //Gets a random index given the length of an array.
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