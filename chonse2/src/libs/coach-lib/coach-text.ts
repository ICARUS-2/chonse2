import { PieceType } from "../chonse2-lib/piece-type";
import { MoveClassification } from "../engine-lib/types/enums";

export default class CoachText 
{
    //#region Static text data
    static readonly TURN_PLACEHOLDER = "{turn}";
    static readonly PIECE_PLACEHOLDER = "{piece}";
    static readonly SECONDARY_PIECE_PLACEHOLDER = "{piece2}";

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
    public static readonly MISSED_PIN_SENTENCES = 
    [
        `${CoachText.TURN_PLACEHOLDER} has missed an opportunity to pin a ${CoachText.PIECE_PLACEHOLDER} to the ${CoachText.SECONDARY_PIECE_PLACEHOLDER}. `,
        `The best move for ${CoachText.TURN_PLACEHOLDER} was to cut the mobility of the opponent's ${CoachText.PIECE_PLACEHOLDER} by pinning it to the ${CoachText.SECONDARY_PIECE_PLACEHOLDER}. `
    ]

    //Ignored a relative pin
    public static readonly IGNORED_PIN_SENTENCES = 
    [
        `${CoachText.TURN_PLACEHOLDER} completely ignored the pin of their ${CoachText.PIECE_PLACEHOLDER}, and now their ${CoachText.SECONDARY_PIECE_PLACEHOLDER} is lost. `,
        `${CoachText.TURN_PLACEHOLDER} didn't notice their ${CoachText.PIECE_PLACEHOLDER} was pinned, exposing the ${CoachText.SECONDARY_PIECE_PLACEHOLDER} behind it. `
    ]

    //missed a skewer
    public static readonly MISSED_SKEWER_SENTENCES = 
    [
        `${CoachText.TURN_PLACEHOLDER} lost a chance to win a ${CoachText.PIECE_PLACEHOLDER} through a skewer. `,
        `${CoachText.TURN_PLACEHOLDER} had a chance to acquire a ${CoachText.PIECE_PLACEHOLDER} via a skewer, but overlooked it. `
    ]

    //Allowed their piece to get skewered
    public static readonly ALLOWED_SKEWER_SENTENCES = 
    [
        `${CoachText.TURN_PLACEHOLDER} just allowed their opponent to capture their ${CoachText.PIECE_PLACEHOLDER} with a skewer. `,
        `This allows ${CoachText.TURN_PLACEHOLDER}'s opponent to grab a ${CoachText.PIECE_PLACEHOLDER} through a skewer. `,
    ]

    //Did not connect their rooks
    public static readonly MISSED_ROOK_CONNECTION_SENTENCES =
    [
        `${CoachText.TURN_PLACEHOLDER}'s best move in this position was to connect their rooks in order for them to provide mutual defence. `,
        `Instead, ${CoachText.TURN_PLACEHOLDER} should have connected their rooks so that they can both defend each other and team up for attacks. `,
        `${CoachText.TURN_PLACEHOLDER} missed a chance to connect their rooks here. `
    ]

    //Inaccurately disconnected their rooks
    public static readonly DISCONNECTED_ROOKS = 
    [
        `${CoachText.TURN_PLACEHOLDER} erroneously disconnected their rooks here. They can no longer defend each other. `,
        `${CoachText.TURN_PLACEHOLDER} should have kept their rooks connected. `
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
    //#endregion 

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


    //#region Helper functions
    //Gets a random index given the length of an array.
    private static getRandomIndex(length: number)
    {
        return Math.floor(Math.random() * length);
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
    //#endregion
}