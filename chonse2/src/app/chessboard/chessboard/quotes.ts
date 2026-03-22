export type Quote = {
  text: string;
  author: string;
};

export class Quotes
{
    public static getQuote()
    {
        const index = Math.floor(Math.random() * Quotes.quotes.length);

        return Quotes.quotes[index];
    }

    private static quotes: Quote[] = [
    {
        text: "When you see a good move, look for a better one.",
        author: "Emanuel Lasker"
    },
    {
        text: "Nothing excites jaded Grandmasters more than a theoretical novelty.",
        author: "Dominic Lawson"
    },
    {
        text: "The Pin is mightier than the sword.",
        author: "Fred Reinfeld"
    },
    {
        text: "We cannot resist the fascination of sacrifice, since a passion for sacrifices is part of a chess player's nature.",
        author: "Rudolf Spielmann"
    },
    {
        text: "All I want to do, ever, is just play chess.",
        author: "Bobby Fischer"
    },
    {
        text: "A win by an unsound combination, however showy, fills me with artistic horror.",
        author: "Wilhelm Steinitz"
    },
    {
        text: "The chessboard is the world, the pieces are the phenomena of the Universe, the rules of the game are what we call the laws of Nature and the player on the other side is hidden from us.",
        author: "Thomas Huxley"
    },
    {
        text: "Adequate compensation for a sacrifice is having a sound combination leading to a winning position; adequate compensation for a blunder is having your opponent snatch defeat from the jaws of victory.",
        author: "Bruce A. Moon"
    },
    {
        text: "Strategy requires thought, tactics require observation.",
        author: "Max Euwe"
    },
    {
        text: "I don't believe in psychology. I believe in good moves.",
        author: "Bobby Fischer"
    },
    {
        text: "Life is a kind of chess, with struggle, competition, good and ill events.",
        author: "Benjamin Franklin"
    },
    {
        text: "Even the laziest king flees wildly in the face of a double check!",
        author: "Aron Nimzowitsch"
    },
    {
        text: "Combinations have always been the most intriguing aspect of chess. The masters look for them, the public applauds them, the critics praise them. It is because combinations are possible that chess is more than a lifeless mathematical exercise. They are the poetry of the game; they are to chess what melody is to music. They represent the triumph of mind over matter.",
        author: "Reuben Fine"
    },
    {
        text: "Chess is a fairy tale of 1001 blunders.",
        author: "Savielly Tartakower"
    },
    {
        text: "Chess is no whit inferior to the violin, and we have a large number of professional violinists.",
        author: "Mikhail Botvinnik"
    },
    {
        text: "Only the player with the initiative has the right to attack.",
        author: "Wilhelm Steinitz"
    },
    {
        text: "The winner of the game is the player who makes the next-to-last mistake.",
        author: "Savielly Tartakower"
    },
    {
        text: "Your body has to be in top condition. Your chess deteriorates as your body does. You can't separate body from mind.",
        author: "Bobby Fischer"
    },
    {
        text: "Of chess it has been said that life is not long enough for it, but that is the fault of life, not chess.",
        author: "William Ewart Napier"
    },
    {
        text: "I have added these principles to the law: get the knights into action before both bishops are developed.",
        author: "Emanuel Lasker"
    },
    {
        text: "Life is like a game of chess, changing with each move.",
        author: "Chinese proverb"
    },
    {
        text: "You cannot play at chess if you are kind-hearted.",
        author: "French proverb"
    },
    {
        text: "It's just you and your opponent at the board and you’re trying to prove something.",
        author: "Bobby Fischer"
    },
    {
        text: "It is the aim of the modern school, not to treat every position according to one general law, but according to the principle inherent in the position.",
        author: "Richard Réti"
    },
    {
        text: "The pawns are the soul of the game.",
        author: "François-André Danican Philidor"
    },
    {
        text: "In order to improve your game, you must study the endgame before everything else, for whereas the endings can be studied and mastered by themselves, the middlegame and the opening must be studied in relation to the endgame.",
        author: "José Raúl Capablanca"
    },
    {
        text: "Without error there can be no brilliancy.",
        author: "Emanuel Lasker"
    },
    {
        text: "Chess is like war on a board.",
        author: "Bobby Fischer"
    },
    {
        text: "Chess is played with the mind and not with the hands!",
        author: "Renaud and Kahn"
    },
    {
        text: "Many have become chess masters, no one has become the master of chess.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "The most important feature of the chess position is the activity of the pieces. This is absolutely fundamental in all phases of the game: Opening, Middlegame and especially Endgame. The primary constraint on a piece's activity is the pawn structure.",
        author: "Michael Stean"
    },
    {
        text: "You have to have the fighting spirit. You have to force moves and take chances.",
        author: "Bobby Fischer"
    },
    {
        text: "Could we look into the head of a chess player, we should see there a whole world of feelings, images, ideas, emotion and passion.",
        author: "Alfred Binet"
    },
    {
        text: "Openings teach you openings. Endgames teach you chess!",
        author: "Stephan Gerzadowicz"
    },
    {
        text: "Play the opening like a book, the middlegame like a magician, and the endgame like a machine.",
        author: "Rudolf Spielmann"
    },
    {
        text: "That's what chess is all about. One day you give your opponent a lesson, the next day he gives you one.",
        author: "Bobby Fischer"
    },
    {
        text: "Some part of a mistake is always correct.",
        author: "Savielly Tartakower"
    },
    {
        text: "Methodical thinking is of more use in chess than inspiration.",
        author: "Cecil Purdy"
    },
    {
        text: "Who is your opponent tonight, tonight I am playing against the black pieces.",
        author: "Akiba Rubinstein"
    },
    {
        text: "Excellence at chess is one mark of a scheming mind.",
        author: "Sir Arthur Conan Doyle"
    },
    {
        text: "A bad day of chess is better than any good day at work.",
        author: "Anonymous"
    },
    {
        text: "Chess is the art of analysis.",
        author: "Mikhail Botvinnik"
    },
    {
        text: "The mistakes are there, waiting to be made.",
        author: "Savielly Tartakower"
    },
    {
        text: "After Black's reply to 1.e4 with 1...e5, leaves him always trying to get into the game.",
        author: "Howard Staunton"
    },
    {
        text: "A player surprised is half beaten.",
        author: "Proverb"
    },
    {
        text: "A passed pawn increases in strength as the number of pieces on the board diminishes.",
        author: "José Raúl Capablanca"
    },
    {
        text: "The essence of chess is thinking about what chess is.",
        author: "David Bronstein"
    },
    {
        text: "I am the best player in the world and I am here to prove it.",
        author: "Bobby Fischer"
    },
    {
        text: "Chess is a forcing house where the fruits of character can ripen more fully than in life.",
        author: "Edward Morgan Foster"
    },
    {
        text: "Half the variations which are calculated in a tournament game turn out to be completely superfluous. Unfortunately, no one knows in advance which half.",
        author: "Jan Timman"
    },
    {
        text: "Good positions don't win games, good moves do.",
        author: "Gerald Abrahams"
    },
    {
        text: "If I win a tournament, I win it by myself. I do the playing. Nobody helps me.",
        author: "Bobby Fischer"
    },
    {
        text: "What would chess be without silly mistakes?",
        author: "Kurt Richter"
    },
    {
        text: "Before the endgame, the Gods have placed the middle game.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "Chess was Capablanca's mother tongue.",
        author: "Richard Réti"
    },
    {
        text: "Alekhine is a poet who creates a work of art out of something that would hardly inspire another man to send home a picture post card.",
        author: "Max Euwe"
    },
    {
        text: "During a chess competition a chess master should be a combination of a beast of prey and a monk.",
        author: "Alexander Alekhine"
    },
    {
        text: "No one ever won a game by resigning.",
        author: "Savielly Tartakower"
    },
    {
        text: "The defensive power of a pinned piece is only imaginary.",
        author: "Aron Nimzowitsch"
    },
    {
        text: "When the chess game is over, the pawn and the king go back to the same box.",
        author: "Irish saying"
    },
    {
        text: "A strong memory, concentration, imagination, and a strong will is required to become a great chess player.",
        author: "Bobby Fischer"
    },
    {
        text: "Every chess master was once a beginner.",
        author: "Irving Chernev"
    },
    {
        text: "One doesn't have to play well, it’s enough to play better than your opponent.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "Chess is above all, a fight!",
        author: "Emanuel Lasker"
    },
    {
        text: "Discovered check is the dive bomber of the chessboard.",
        author: "Reuben Fine"
    },
    {
        text: "I know people who have all the will in the world, but still can't play good chess.",
        author: "Bobby Fischer"
    },
    {
        text: "A chess game is a dialogue, a conversation between a player and his opponent. Each move by the opponent may contain threats or be a blunder, but a player cannot defend against threats or take advantage of blunders if he does not first ask himself: What is my opponent planning after each move?",
        author: "Bruce A. Moon"
    },
    {
        text: "The hardest game to win is a won game.",
        author: "Emanuel Lasker"
    },
    {
        text: "The most powerful weapon in chess is to have the next move.",
        author: "David Bronstein"
    },
    {
        text: "He who fears an isolated queen's pawn should give up chess.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "Different people feel differently about resigning.",
        author: "Bobby Fischer"
    },
    {
        text: "Chess is not like life... it has rules!",
        author: "Mark Pasternak"
    },
    {
        text: "It's always better to sacrifice your opponent’s men.",
        author: "Savielly Tartakower"
    },
    {
        text: "To avoid losing a piece, many a person has lost the game.",
        author: "Savielly Tartakower"
    },
    {
        text: "All that matters on the chessboard is good moves.",
        author: "Bobby Fischer"
    },
    {
        text: "Help your pieces so they can help you.",
        author: "Paul Morphy"
    },
    {
        text: "In a gambit you give up a pawn for the sake of getting a lost game.",
        author: "Samuel Standidge Boden"
    },
    {
        text: "It is not enough to be a good player... you must also play well.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "A sacrifice is best refuted by accepting it.",
        author: "Wilhelm Steinitz"
    },
    {
        text: "Tactics flow from a superior position.",
        author: "Bobby Fischer"
    },
    {
        text: "Later, I began to succeed in decisive games. Perhaps because I realized a very simple truth: not only was I worried, but also my opponent.",
        author: "Mikhail Tal"
    },
    {
        text: "Chess is life.",
        author: "Bobby Fischer"
    },
    {
        text: "Chess is a beautiful mistress.",
        author: "Bent Larsen"
    },
    {
        text: "Some sacrifices are sound; the rest are mine.",
        author: "Mikhail Tal"
    },
    {
        text: "Best by test: 1. e4.",
        author: "Bobby Fischer"
    },
    {
        text: "A bad plan is better than none at all.",
        author: "Frank Marshall"
    },
    {
        text: "Chess books should be used as we use glasses: to assist the sight, although some players make use of them as if they thought they conferred sight.",
        author: "José Raúl Capablanca"
    },
    {
        text: "There are two types of sacrifices: correct ones and mine.",
        author: "Mikhail Tal"
    },
    {
        text: "Morphy was probably the greatest genius of them all.",
        author: "Bobby Fischer"
    },
    {
        text: "My opponents make good moves too. Sometimes I don't take these things into consideration.",
        author: "Bobby Fischer"
    },
    {
        text: "The combination player thinks forward; he starts from the given position, and tries the forceful moves in his mind.",
        author: "Emanuel Lasker"
    },
    {
        text: "A chess game is divided into three stages: the first, when you hope you have the advantage, the second when you believe you have an advantage, and the third... when you know you're going to lose!",
        author: "Savielly Tartakower"
    },
    {
        text: "Chess demands total concentration.",
        author: "Bobby Fischer"
    },
    {
        text: "Chess, like love, like music, has the power to make people happy.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "All my games are real.",
        author: "Bobby Fischer"
    },
    {
        text: "Chess is everything: art, science and sport.",
        author: "Anatoly Karpov"
    },
    {
        text: "Chess is the art which expresses the science of logic.",
        author: "Mikhail Botvinnik"
    },
    {
        text: "Not all artists are chess players, but all chess players are artists.",
        author: "Marcel Duchamp"
    },
    {
        text: "Chess is imagination.",
        author: "David Bronstein"
    },
    {
        text: "Chess is thirty to forty percent psychology. You don't have this when you play a computer. I can’t confuse it.",
        author: "Judit Polgar"
    },
    {
        text: "On the chessboard, lies and hypocrisy do not survive long.",
        author: "Emanuel Lasker"
    },
    {
        text: "Chess is war over the board. The object is to crush the opponents mind.",
        author: "Bobby Fischer"
    },
    {
        text: "The passed pawn is a criminal, who should be kept under lock and key. Mild measures, such as police surveillance, are not sufficient.",
        author: "Aron Nimzowitsch"
    },
    {
        text: "Chess holds its master in its own bonds, shackling the mind and brain so that the inner freedom of the very strongest must suffer.",
        author: "Albert Einstein"
    },
    {
        text: "Human affairs are like a chess game: only those who do not take it seriously can be called good players.",
        author: "Hung Tzu Ch'eng"
    },
    {
        text: "The blunders are all there on the board, waiting to be made.",
        author: "Savielly Tartakower"
    },
    {
        text: "Via the squares on the chessboard, the Indians explain the movement of time and the age, the higher influences which control the world and the ties which link chess with the human soul.",
        author: "Al-Masudi"
    },
    {
        text: "It is no time to be playing chess when the house is on fire.",
        author: "Italian proverb"
    },
    {
        text: "You sit at the board and suddenly your heart leaps. Your hand trembles to pick up the piece and move it. But what chess teaches you is that you must sit there calmly and think about whether it's really a good idea and whether there are other better ideas.",
        author: "Stanley Kubrick"
    },
    {
        text: "Daring ideas are like chess men moved forward. They may be beaten, but they may start a winning game.",
        author: "Johann Wolfgang von Goethe"
    },
    {
        text: "Of all my Russian books, The Defense contains and diffuses the greatest 'warmth’ which may seem odd seeing how supremely abstract chess is supposed to be.",
        author: "Vladimir Nabokov"
    },
    {
        text: "For surely of all the drugs in the world, chess must be the most permanently pleasurable.",
        author: "Assiac"
    },
    {
        text: "A thorough understanding of the typical mating continuations makes the most complicated sacrificial combinations leading up to them not only not difficult, but almost a matter of course.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "Chess problems demand from the composer the same virtues that characterize all worthwhile art: originality, invention, conciseness, harmony, complexity, and splendid insincerity.",
        author: "Vladimir Nabokov"
    },
    {
        text: "Personally, I rather look forward to a computer program winning the World Chess Championship. Humanity needs a lesson in humility.",
        author: "Richard Dawkins"
    },
    {
        text: "The boy (then a 12 year old boy named Anatoly Karpov) doesn't have a clue about chess, and there’s no future at all for him in this profession.",
        author: "Mikhail Botvinnik"
    },
    {
        text: "As one by one I mowed them down, my superiority soon became apparent.",
        author: "José Raúl Capablanca"
    },
    {
        text: "Though most people love to look at the games of the great attacking masters, some of the most successful players in history have been the quiet positional players. They slowly grind you down by taking away your space, tying up your pieces, and leaving you with virtually nothing to do!",
        author: "Yasser Seirawan"
    },
    {
        text: "There must have been a time when men were demigods, or they could not have invented chess.",
        author: "Gustav Schenk"
    },
    {
        text: "Chess is really ninety nine percent calculation.",
        author: "Andrew Soltis"
    },
    {
        text: "Chess is the gymnasium of the mind.",
        author: "Blaise Pascal"
    },
    {
        text: "The game of chess is not merely an idle amusement; several very valuable qualities of the mind are to be acquired and strengthened by it, so as to become habits ready on all occasions; for life is a kind of chess.",
        author: "Benjamin Franklin"
    },
    {
        text: "Winning isn't everything... but losing is nothing.",
        author: "Mednis"
    },
    {
        text: "Look at Garry Kasparov. After he loses, invariably he wins the next game. He just kills the next guy. That's something that we have to learn to be able to do.",
        author: "Maurice Ashley"
    },
    {
        text: "There just isn't enough televised chess.",
        author: "David Letterman"
    },
    {
        text: "Avoid the crowd. Do your own thinking independently. Be the chess player, not the chess piece.",
        author: "Ralph Charell"
    },
    {
        text: "Chess is a terrible game. If you have no center, your opponent has a freer position. If you do have a center, then you really have something to worry about!",
        author: "Siegbert Tarrasch"
    },
    {
        text: "Any material change in a position must come about by mate, a capture, or a pawn promotion.",
        author: "Cecil Purdy"
    },
    {
        text: "We don't really know how the game was invented, though there are suspicions. As soon as we discover the culprits, we’ll let you know.",
        author: "Bruce Pandolfini"
    },
    {
        text: "The battle for the ultimate truth will never be won. And that's why chess is so fascinating.",
        author: "Hans Kmoch"
    },
    {
        text: "I am still a victim of chess. It has all the beauty of art and much more. It cannot be commercialized. Chess is much purer than art in its social position.",
        author: "Marcel Duchamp"
    },
    {
        text: "Blessed be the memory of him who gave the world this immortal game.",
        author: "A. G. Gardiner"
    },
    {
        text: "In the perfect chess combination as in a first-rate short story, the whole plot and counter-plot should lead up to a striking finale, the interest not being allayed until the very last moment.",
        author: "Yates and Winter"
    },
    {
        text: "Castle early and often.",
        author: "Rob Sillars"
    },
    {
        text: "I believe that chess possesses a magic that is also a help in advanced age. A rheumatic knee is forgotten during a game of chess and other events can seem quite unimportant in comparison with a catastrophe on the chessboard.",
        author: "Vlastimil Hort"
    },
    {
        text: "Chess is a more highly symbolic game, but the aggressions are therefore even more frankly represented in the play. It probably began as a war game; that is, the representation of a miniature battle between the forces of two kingdoms.",
        author: "Karl Meninger"
    },
    {
        text: "No chess Grandmaster is normal; they only differ in the extent of their madness.",
        author: "Viktor Korchnoi"
    },
    {
        text: "Chess is 99 percent tactics.",
        author: "Richard Teichmann"
    },
    {
        text: "I'd rather have a pawn than a finger.",
        author: "Reuben Fine"
    },
    {
        text: "Chess mastery essentially consists of analyzing.",
        author: "Mikhail Botvinnik"
    },
    {
        text: "If your opponent cannot do anything active, then don't rush the position; instead you should let him sit there, suffer, and beg you for a draw.",
        author: "Jeremy Silman"
    },
    {
        text: "The chess pieces are the block alphabet which shapes thoughts; and these thoughts, although making a visual design on the chessboard, express their beauty abstractly, like a poem.",
        author: "Marcel Duchamp"
    },
    {
        text: "Examine moves that smite! A good eye for smites is far more important than a knowledge of strategical principles.",
        author: "Cecil Purdy"
    },
    {
        text: "Chess is like life.",
        author: "Boris Spassky"
    },
    {
        text: "Chess teaches you to control the initial excitement you feel when you see something that looks good and it trains you to think objectively when you're in trouble.",
        author: "Stanley Kubrick"
    },
    {
        text: "Let the perfectionist play postal.",
        author: "Yasser Seirawan"
    },
    {
        text: "If chess is a science, it's a most inexact one. If chess is an art, it is too exacting to be seen as one. If chess is a sport, it’s too esoteric. If chess is a game, it’s too demanding to be just a game. If chess is a mistress, she’s a demanding one. If chess is a passion, it’s a rewarding one. If chess is life, it’s a sad one.",
        author: "Anonymous"
    },
    {
        text: "Chess is a foolish expedient for making idle people believe they are doing something very clever when they are only wasting their time.",
        author: "George Bernard Shaw"
    },
    {
        text: "You must take your opponent into a deep dark forest where 2+2=5, and the path leading out is only wide enough for one.",
        author: "Mikhail Tal"
    },
    {
        text: "I feel as if I were a piece in a game of chess, when my opponent says of it: That piece cannot be moved.",
        author: "Søren Kierkegaard"
    },
    {
        text: "When your house is on fire, you can't be bothered with the neighbors. Or, as we say in chess, if your king is under attack you don't worry about losing a pawn on the queen’s side.",
        author: "Garry Kasparov"
    },
    {
        text: "Man is a frivolous, a specious creature, and like a chess player, cares more for the process of attaining his goal than for the goal itself.",
        author: "Fyodor Dostoyevsky"
    },
    {
        text: "When asked, -How is that you pick better moves than your opponents?, I responded: I'm very glad you asked me that, because, as it happens, there is a very simple answer. I think up my own moves, and I make my opponent think up his.",
        author: "Alexander Alekhine"
    },
    {
        text: "Mistrust is the most necessary characteristic of the chess player.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "What is the object of playing a gambit opening...? To acquire a reputation of being a dashing player at the cost of losing a game.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "Pawns; they are the soul of this game, they alone form the attack and defense.",
        author: "François-André Danican Philidor"
    },
    {
        text: "In chess, at least, the brave inherit the earth.",
        author: "Edmar Mednis"
    },
    {
        text: "There are two classes of men; those who are content to yield to circumstances and who play whist; those who aim to control circumstances, and who play chess.",
        author: "Mortimer Collins"
    },
    {
        text: "The tactician must know what to do whenever something needs doing; the strategist must know what to do when nothing needs doing.",
        author: "Savielly Tartakower"
    },
    {
        text: "All chess players should have a hobby.",
        author: "Savielly Tartakower"
    },
    {
        text: "I played chess with him and would have beaten him sometimes only he always took back his last move, and ran the game out differently.",
        author: "Mark Twain"
    },
    {
        text: "In chess, just as in life, today's bliss may be tomorrow’s poison.",
        author: "Assiac"
    },
    {
        text: "You may learn much more from a game you lose than from a game you win. You will have to lose hundreds of games before becoming a good player.",
        author: "José Raúl Capablanca"
    },
    {
        text: "The way he plays chess demonstrates a man's whole nature.",
        author: "Stanley Ellin"
    },
    {
        text: "You can only get good at chess if you love the game.",
        author: "Bobby Fischer"
    },
    {
        text: "A man that will take back a move at chess will pick a pocket.",
        author: "Richard Fenton"
    },
    {
        text: "Whoever sees no other aim in the game than that of giving checkmate to one's opponent will never become a good chess player.",
        author: "Max Euwe"
    },
    {
        text: "In blitz, the knight is stronger than the bishop.",
        author: "Vlastimil Hort"
    },
    {
        text: "Chess is a fighting game which is purely intellectual and includes chance.",
        author: "Richard Réti"
    },
    {
        text: "Chess is a sea in which a gnat may drink and an elephant may bathe.",
        author: "Hindu proverb"
    },
    {
        text: "Pawn endings are to chess what putting is to golf.",
        author: "Cecil Purdy"
    },
    {
        text: "Chess opens and enriches your mind.",
        author: "Saudin Robovic"
    },
    {
        text: "The isolated pawn casts gloom over the entire chessboard.",
        author: "Aron Nimzowitsch"
    },
    {
        text: "For me, chess is life and every game is like a life. Every chess player gets to live many lives in one lifetime.",
        author: "Eduard Gufeld"
    },
    {
        text: "Chess is a terrific way for kids to build self image and self esteem.",
        author: "Saudin Robovic"
    },
    {
        text: "If a ruler does not understand chess, how can he rule over a kingdom?",
        author: "King Khusros II"
    },
    {
        text: "Chess is a cold bath for the mind.",
        author: "Sir John Simon"
    },
    {
        text: "Becoming successful at chess allows you to discover your own personality. That's what I want for the kids I teach.",
        author: "Saudin Robovic"
    },
    {
        text: "Chess is so inspiring that I do not believe a good player is capable of having an evil thought during the game.",
        author: "Wilhelm Steinitz"
    },
    {
        text: "You are for me the queen on d8 and I am the pawn on d7!!",
        author: "GM Eduard Gufeld"
    },
    {
        text: "By playing at chess then, we may learn: First: Foresight. Second: Circumspection. Third: Caution. And lastly, we learn by chess the habit of not being discouraged by present bad appearances in the state of our affairs, the habit of hoping for a favorable chance, and that of persevering in the secrets of resources.",
        author: "Benjamin Franklin"
    },
    {
        text: "I prefer to lose a really good game than to win a bad one.",
        author: "David Levy"
    },
    {
        text: "Capture of the adverse king is the ultimate but not the first object of the game.",
        author: "Wilhelm Steinitz"
    },
    {
        text: "When I have white, I win because I am White; When I have black, I win because I am Bogolyubov.",
        author: "Efim Bogolyubov"
    },
    {
        text: "Every pawn is a potential queen.",
        author: "James Mason"
    },
    {
        text: "Chess is in its essence a game, in its form an art, and in its execution a science.",
        author: "Baron von der Lasa"
    },
    {
        text: "No price is too great for the scalp of the enemy king.",
        author: "Koblentz"
    },
    {
        text: "In life, as in chess, ones own pawns block ones way. A mans very wealth, ease, leisure, children, books, which should help him to win, more often checkmate him.",
        author: "Charles Buxton"
    },
    {
        text: "Chess is a part of culture and if a culture is declining then chess too will decline.",
        author: "Mikhail Botvinnik"
    },
    {
        text: "A good sacrifice is one that is not necessarily sound but leaves your opponent dazed and confused.",
        author: "Rudolf Spielmann"
    },
    {
        text: "Chess, like any creative activity, can exist only through the combined efforts of those who have creative talent, and those who have the ability to organize their creative work.",
        author: "Mikhail Botvinnik"
    },
    {
        text: "One bad move nullifies forty good ones.",
        author: "I. A. Horowitz"
    },
    {
        text: "Place the contents of the chess box in a hat, shake them up vigorously, pour them on the board from a height of two feet, and you get the style of Steinitz.",
        author: "H. E. Bird"
    },
    {
        text: "I have never in my life played the French Defence, which is the dullest of all openings.",
        author: "Wilhelm Steinitz"
    },
    {
        text: "Pawns are born free, yet they are everywhere in chains.",
        author: "Rick Kennedy"
    },
    {
        text: "It is not a move, even the best move that you must seek, but a realizable plan.",
        author: "Eugene Znosko-Borovsky"
    },
    {
        text: "Those who say they understand chess, understand nothing.",
        author: "Robert Hübner"
    },
    {
        text: "Good offense and good defense both begin with good development.",
        author: "Bruce A. Moon"
    },
    {
        text: "Botvinnik tried to take the mystery out of chess, always relating it to situations in ordinary life. He used to call chess a typical inexact problem similar to those which people are always having to solve in everyday life.",
        author: "Garry Kasparov"
    },
    {
        text: "A good player is always lucky.",
        author: "José Raúl Capablanca"
    },
    {
        text: "The sign of a great master is his ability to win a won game quickly and painlessly.",
        author: "Irving Chernev"
    },
    {
        text: "One of these modest little moves may be more embarrassing to your opponent than the biggest threat.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "Live, lose, and learn, by observing your opponent how to win.",
        author: "Amber Steenbock"
    },
    {
        text: "The older I grow, the more I value pawns.",
        author: "Paul Keres"
    },
    {
        text: "Everything is in a state of flux, and this includes the world of chess.",
        author: "Mikhail Botvinnik"
    },
    {
        text: "The beauty of a move lies not in its appearance but in the thought behind it.",
        author: "Aron Nimzowitsch"
    },
    {
        text: "My God, Bobby Fischer plays so simply.",
        author: "Alexei Suetin"
    },
    {
        text: "You need not play well - just help your opponent to play badly.",
        author: "Genrikh Chepukaitis"
    },
    {
        text: "It is difficult to play against Einstein's theory --on his first loss to Fischer.",
        author: "Mikhail Tal"
    },
    {
        text: "The only thing chess players have in common is chess.",
        author: "Lodewijk Prins"
    },
    {
        text: "Bobby just drops the pieces and they fall on the right squares.",
        author: "Miguel Najdorf"
    },
    {
        text: "We must make sure that chess will not be like a dead language, very interesting, but for a very small group.",
        author: "Sytze Faber"
    },
    {
        text: "The passion for playing chess is one of the most unaccountable in the world.",
        author: "H. G. Wells"
    },
    {
        text: "Chess is so interesting in itself, as not to need the view of gain to induce engaging in it; and thence it is never played for money.",
        author: "Benjamin Franklin"
    },
    {
        text: "The enormous mental resilience, without which no chess player can exist, was so much taken up by chess that he could never free his mind of this game.",
        author: "Albert Einstein"
    },
    {
        text: "Nowadays, when you're not a Grandmaster at 14, you can forget about it.",
        author: "Viswanathan Anand"
    },
    {
        text: "Do you realize Fischer almost never has any bad pieces? He exchanges them, and the bad pieces remain with his opponents.",
        author: "Yuri Balashov"
    },
    {
        text: "It is always better to sacrifice your opponent's men.",
        author: "Savielly Tartakower"
    },
    {
        text: "In chess, as it is played by masters, chance is practically eliminated.",
        author: "Emanuel Lasker"
    },
    {
        text: "You know you're going to lose. Even when I was ahead I knew I was going to lose --on playing against Fischer.",
        author: "Andrew Soltis"
    },
    {
        text: "I won't play with you anymore. You have insulted my friend! --when an opponent cursed himself for a blunder.",
        author: "Miguel Najdorf"
    },
    {
        text: "You know, comrade Pachman, I don't enjoy being a Minister, I would rather play chess like you.",
        author: "Che Guevara"
    },
    {
        text: "It began to feel as though you were playing against chess itself --on playing against Bobby Fischer.",
        author: "Walter Shipman"
    },
    {
        text: "When you play Bobby, it is not a question if you win or lose. It is a question if you survive.",
        author: "Boris Spassky"
    },
    {
        text: "When you absolutely don't know what to do anymore, it is time to panic.",
        author: "John van der Wiel"
    },
    {
        text: "We like to think.",
        author: "Garry Kasparov"
    },
    {
        text: "Dazzling combinations are for the many, shifting wood is for the few.",
        author: "Georg Kieninger"
    },
    {
        text: "In complicated positions, Bobby Fischer hardly had to be afraid of anybody.",
        author: "Paul Keres"
    },
    {
        text: "It was clear to me that the vulnerable point of the American Grandmaster (Bobby Fischer) was in double-edged, hanging, irrational positions, where he often failed to find a win even in a won position.",
        author: "Efim Geller"
    },
    {
        text: "I love all positions. Give me a difficult positional game, I will play it. But totally won positions, I cannot stand them.",
        author: "Hein Donner"
    },
    {
        text: "In Fischer's hands, a slight theoretical advantage is as good a being a queen ahead.",
        author: "Isaac Kashdan"
    },
    {
        text: "Bobby Fischer's current state of mind is indeed a tragedy. One of the worlds greatest chess players - the pride and sorrow of American chess.",
        author: "Frank Brady"
    },
    {
        text: "Fischer is an American chess tragedy on par with Morphy and Pillsbury.",
        author: "Mig Greengard"
    },
    {
        text: "Nonsense was the last thing Fischer was interested in, as far as chess was concerned.",
        author: "Elie Agur"
    },
    {
        text: "Fischer is the strongest player in the world. In fact, the strongest player who ever lived.",
        author: "Larry Evans"
    },
    {
        text: "If you aren't afraid of Spassky, then I have removed the element of money.",
        author: "Jim Slater"
    },
    {
        text: "I guess a certain amount of temperament is expected of chess geniuses.",
        author: "Ron Gross"
    },
    {
        text: "Fischer sacrificed virtually everything most of us weakies (to use his term) value, respect, and cherish, for the sake of an artful, often beautiful board game, for the ambivalent privilege of being its greatest master.",
        author: "Paul Kollar"
    },
    {
        text: "Fischer chess play was always razor-sharp, rational and brilliant. One of the best ever.",
        author: "Dave Regis"
    },
    {
        text: "Fischer wanted to give the Russians a taste of their own medicine.",
        author: "Larry Evans"
    },
    {
        text: "With or without the title, Bobby Fischer was unquestionably the greatest player of his time.",
        author: "Burt Hochberg"
    },
    {
        text: "Fischer is completely natural. He plays no roles. He's like a child. Very, very simple.",
        author: "Zita Rajcsanyi"
    },
    {
        text: "Spassky will not be psyched out by Fischer.",
        author: "Mike Goodall"
    },
    {
        text: "Already at 15 years of age he was a Grandmaster, a record at that time, and his battle to reach the top was the background for all the major chess events of the 1960.",
        author: "Tim Harding"
    },
    {
        text: "Fischer, who may or may not be mad as a hatter, has every right to be horrified.",
        author: "Jeremy Silman"
    },
    {
        text: "When I asked Fischer why he had not played a certain move in our game, he replied: ‘Well, you laughed when I wrote it down!'",
        author: "Mikhail Tal"
    },
    {
        text: "I look one move ahead... the best!",
        author: "Siegbert Tarrasch"
    },
    {
        text: "Fischer prefers to enter chess history alone.",
        author: "Miguel Najdorf"
    },
    {
        text: "Bobby is the most misunderstood, misquoted celebrity walking the face of this earth.",
        author: "Yasser Seirawan"
    },
    {
        text: "When you don't know what to play, wait for an idea to come into your opponent’s mind. You may be sure that idea will be wrong.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "There is no remorse like the remorse of chess.",
        author: "H. G. Wells"
    },
    {
        text: "By this measure (on the gap between Fischer & his contemporaries), I consider him the greatest world champion.",
        author: "Garry Kasparov"
    },
    {
        text: "By the beauty of his games, the clarity of his play, and the brilliance of his ideas, Fischer made himself an artist of the same stature as Brahms, Rembrandt, and Shakespeare.",
        author: "David Levy"
    },
    {
        text: "Many chess players were surprised when after the game, Fischer quietly explained: 'I had already analyzed this possibility’ in a position which I thought was not possible to foresee from the opening.",
        author: "Mikhail Tal"
    },
    {
        text: "Suddenly it was obvious to me in my analysis I had missed what Fischer had found with the greatest of ease at the board.",
        author: "Mikhail Botvinnik"
    },
    {
        text: "The king is a fighting piece. Use it!",
        author: "Wilhelm Steinitz"
    },
    {
        text: "Bobby Fischer is the greatest chess genius of all time!",
        author: "Alexander Kotov"
    },
    {
        text: "The laws of chess do not permit a free choice: you have to move whether you like it or not.",
        author: "Emanuel Lasker"
    },
    {
        text: "First-class players lose to second-class players because second-class players sometimes play a first-class game.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "Bobby is the finest chess player this country ever produced. His memory for the moves, his brilliance in dreaming up combinations, and his fierce determination to win are uncanny.",
        author: "John Collins"
    },
    {
        text: "After a bad opening, there is hope for the middle game. After a bad middle game, there is hope for the endgame. But once you are in the endgame, the moment of truth has arrived.",
        author: "Edmar Mednis"
    },
    {
        text: "Weak points or holes in the opponent's position must be occupied by pieces not pawns.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "There is only one thing Fischer does in chess without pleasure: to lose!",
        author: "Boris Spassky"
    },
    {
        text: "Bobby Fischer is the greatest chess player who has ever lived.",
        author: "Ken Smith"
    },
    {
        text: "Up to this point White has been following well-known analysis. But now he makes a fatal error: he begins to use his own head.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "Fischer was a master of clarity and a king of artful positioning. His opponents would see where he was going but were powerless to stop him.",
        author: "Bruce Pandolfini"
    },
    {
        text: "No other master has such a terrific will to win. At the board he radiates danger, and even the strongest opponents tend to freeze, like rabbits when they smell a panther. Even his weaknesses are dangerous.",
        author: "Anonymous German Expert"
    },
    {
        text: "White lost because he failed to remember the right continuation and had to think up the moves himself.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "Not only will I predict his triumph over Botvinnik, but I'll go further and say that he’ll probably be the greatest chess player that ever lived.",
        author: "John Collins"
    },
    {
        text: "I consider Fischer to be one of the greatest opening experts ever.",
        author: "Keith Hayward"
    },
    {
        text: "I like to say that Bobby Fischer was the greatest player ever. But what made Fischer a genius was his ability to blend an American freshness and pragmatism with Russian ideas about strategy.",
        author: "Bruce Pandolfini"
    },
    {
        text: "At this time Fischer is simply a level above all the best chess players in the world.",
        author: "John Jacobs"
    },
    {
        text: "I have always a slight feeling of pity for the man who has no knowledge of chess.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "There's never before been a chess player with such a thorough knowledge of the intricacies of the game and such an absolutely indomitable will to win. I think Bobby is the greatest player that ever lived.",
        author: "Lisa Lane"
    },
    {
        text: "He who takes the queen's knight’s pawn will sleep in the streets.",
        author: "Anonymous"
    },
    {
        text: "I had a toothache during the first game. In the second game I had a headache. In the third game it was an attack of rheumatism. In the fourth game, I wasn't feeling well. And in the fifth game? Well, must one have to win every game?",
        author: "Siegbert Tarrasch"
    },
    {
        text: "The stomach is an essential part of the chess master.",
        author: "Bent Larsen"
    },
    {
        text: "I'm not a materialistic person, in that, I don’t suffer the lack or loss of money. The absence of worldly goods I don’t look back on. For chess is a way I can be as materialistic as I want without having to sell my soul",
        author: "Jamie Walter Adams"
    },
    {
        text: "These are not pieces, they are men! For any man to walk into the line of fire will be one less man in your army to fight for you. Value every troop and use him wisely, throw him not to the dogs as he is there to serve his king.",
        author: "Jamie Walter Adams"
    },
    {
        text: "Chess isn't a game of speed, it is a game of speech through actions.",
        author: "Matt Selman"
    },
    {
        text: "Life like chess is about knowing to do the right move at the right time.",
        author: "Kaleb Rivera"
    },
    {
        text: "Come on Harry!",
        author: "Simon Williams"
    },
    {
        text: "Some people think that if their opponent plays a beautiful game, it's okay to lose. I don’t. You have to be merciless.",
        author: "Magnus Carlsen"
    },
    {
        text: "It's one of those types of positions where he has pieces on squares.",
        author: "John ~ZugAddict~ Chernoff"
    },
    {
        text: "On the bright side, I no longer have any more pieces to lose.",
        author: "John ~ZugAddict~ Chernoff"
    },
    {
        text: "Tactics... tactics are your friends. But they are weird friends who do strange things.",
        author: "John ~ZugAddict~ Chernoff"
    },
    {
        text: "You can't take the pawn because then the other will queen. Like wonder twin powers",
        author: "John ~ZugAddict~ Chernoff"
    },
    {
        text: "Most of the gods throw dice but Fate plays chess, and you don't find out until too late that he's been using two queens all along.",
        author: "Terry Pratchett"
    },
    {
        text: "Atomic is just like regular chess, except you're exploding, everything's exploding, and you're in bullet hell.",
        author: "Unihedron 0"
    },
    {
        text: "lichess is better, but it's free.",
        author: "Thibault Duplessis"
    },
    {
        text: "When you trade, the key concern is not always the value of the pieces being exchanged, but what's left on the board.",
        author: "Dan Heisman"
    },
    {
        text: "I detest the endgame. A well-played game should be practically decided in the middlegame.",
        author: "David Janowski"
    },
    {
        text: "Many men, many styles; what is chess style but the intangible expression of the will to win.",
        author: "Aron Nimzowitsch"
    },
    {
        text: "Never play for the win, never play for the draw, just play chess!",
        author: "Alexander Khalifman"
    },
    {
        text: "In chess, knowledge is a very transient thing. It changes so fast that even a single mouse-slip sometimes changes the evaluation.",
        author: "Viswanathan Anand"
    },
    {
        text: "Having good strategies in playing chess is often a good indication of being focused in life.",
        author: "Martin Dansky"
    },
    {
        text: "Chess is an infinitely complex game, which one can play in infinitely numerous and varied ways.",
        author: "Vladimir Kramnik"
    },
    {
        text: "Chess: It's like alcohol. It’s a drug. I have to control it, or it could overwhelm me.",
        author: "Charles Krauthammer"
    },
    {
        text: "Drawing general conclusions about your main weaknesses can provide a great stimulus to further growth.",
        author: "Alexander Kotov"
    },
    {
        text: "The good thing in chess is that very often the best moves are the most beautiful ones. The beauty of logic.",
        author: "Boris Gelfand"
    },
    {
        text: "Any experienced player knows how a change in the character of the play influences your psychological mood.",
        author: "Garry Kasparov"
    },
    {
        text: "Be a harsh critic of your own wins.",
        author: "Vasilios Kotronias"
    },
    {
        text: "Good players develop a tactical instinct, a sense of what is possible or likely and what is not worth calculating.",
        author: "Samuel Reshevsky"
    },
    {
        text: "Lack of patience is probably the most common reason for losing a game, or drawing games that should have been won.",
        author: "Bent Larsen"
    },
    {
        text: "The scheme of a game is played on positional lines; the decision of it, as a rule, is effected by combinations.",
        author: "Richard Réti"
    },
    {
        text: "The single most important thing in life is to believe in yourself regardless of what everyone else says.",
        author: "Hikaru Nakamura"
    },
    {
        text: "Attackers may sometimes regret bad moves, but it is much worse to forever regret an opportunity you allowed to pass you by.",
        author: "Garry Kasparov"
    },
    {
        text: "My favorite victory is when it is not even clear where my opponent made a mistake.",
        author: "Peter Leko"
    },
    {
        text: "Win with grace, lose with dignity.",
        author: "Susan Polgar"
    },
    {
        text: "Pawns are such fascinating pieces, too... so small, almost insignificant, and yet--they can depose kings.",
        author: "Lavie Tidhar"
    },
    {
        text: "The move is there, but you must see it.",
        author: "Savielly Tartakower"
    },
    {
        text: "The kings are an apt metaphor for human beings: utterly constrained by the rules of the game, defenseless against bombardment from all sides, able only to temporarily dodge disaster by moving one step in any direction.",
        author: "Jennifer duBois"
    },
    {
        text: "If chess is an art, Alekhine. If chess is a science, Capablanca. If chess is a struggle, Lasker.",
        author: "Savielly Tartakower"
    },
    {
        text: "Chess is a good mistress, but a bad master.",
        author: "Gerald Abrahams"
    },
    {
        text: "I often play a move I know how to refute.",
        author: "Bent Larsen"
    },
    {
        text: "First restrain, next blockade, lastly destroy.",
        author: "Aron Nimzowitsch"
    },
    {
        text: "If you don't know what to do, find your worst piece and look for a better square.",
        author: "Gerard Schwarz"
    },
    {
        text: "Players who balk at playing one-minute chess are failing to see the whole picture. They shouldn't be worrying that they will make more mistakes – they should be rubbing their hands in glee at the thought of all the mistakes their opponents will make.",
        author: "Hikaru Nakamura"
    },
    {
        text: "A Chess game is divided into three stages: the first, when you hope you have the advantage, the second when you believe that you have an advantage, and the third... when you know you're going to lose!",
        author: "Savielly Tartakower"
    },
    {
        text: "A queen's sacrifice, even when fairly obvious, always rejoices the heart of the chess-lover.",
        author: "Savielly Tartakower"
    },
    {
        text: "A chess game, after all, is a fight in which all possible factors must be made use of, and in which a knowledge of the opponent's good and bad qualities is of the greatest importance.",
        author: "Emanuel Lasker"
    },
    {
        text: "A chess player never has a heart attack in a good position.",
        author: "Bent Larsen"
    },
    {
        text: "A computer beat me in chess, but it was no match when it came to kickboxing.",
        author: "Emo Phillips"
    },
    {
        text: "A considerable role in the forming of my style was played by an early attraction to study composition.",
        author: "Vasily Smyslov"
    },
    {
        text: "A defeatist spirit must inevitably lead to disaster.",
        author: "Eugene Znosko-Borovsky"
    },
    {
        text: "A draw can be obtained not only by repeating moves, but also by one weak move.",
        author: "Savielly Tartakower"
    },
    {
        text: "A draw may be the beautiful and logical result of fine attacks and parries; and the public ought to appreciate such games, in contrast, of course, to the fear-and-laziness draws.",
        author: "Bent Larsen"
    },
    {
        text: "A gambit never becomes sheer routine as long as you fear you may lose the king and pawn ending!",
        author: "Bent Larsen"
    },
    {
        text: "A great chess player always has a very good memory.",
        author: "Leonid Shamkovich"
    },
    {
        text: "A knight ending is really a pawn ending.",
        author: "Mikhail Botvinnik"
    },
    {
        text: "A male scorpion is stabbed to death after mating. In chess, the powerful queen often does the same to the king without giving him the satisfaction of a lover.",
        author: "Gregor Piatigorsky"
    },
    {
        text: "A pawn, when separated from his fellows, will seldom or never make a fortune.",
        author: "François-André Danican Philidor"
    },
    {
        text: "A plan is made for a few moves only, not for the whole game.",
        author: "Reuben Fine"
    },
    {
        text: "A player can sometimes afford the luxury of an inaccurate move, or even a definite error, in the opening or middlegame without necessarily obtaining a lost position. In the endgame... an error can be decisive, and we are rarely presented with a second chance.",
        author: "Paul Keres"
    },
    {
        text: "A real sacrifice involves a radical change in the character of a game which cannot be effected without foresight, fantasy, and the willingness to risk.",
        author: "Leonid Shamkovich"
    },
    {
        text: "A sport, a struggle for results and a fight for prizes. I think that the discussion about 'chess is science or chess is art' is already inappropriate. The purpose of modern chess is to reach a result.",
        author: "Alexander Morozevich"
    },
    {
        text: "A strong player requires only a few minutes of thought to get to the heart of the conflict. You see a solution immediately, and half an hour later merely convince yourself that your intuition has not deceived you.",
        author: "David Bronstein"
    },
    {
        text: "A win gives one a feeling of self-affirmation, and success - a feeling of self-expression, but only a sensible harmonization between these urges can bring really great achievements in chess.",
        author: "Oleg Romanishin"
    },
    {
        text: "Above all else, before playing in competitions a player must have regard to his health, for if he is suffering from ill-health he cannot hope for success. In this connection the best of all tonics is 15 to 20 days in the fresh air, in the country.",
        author: "Mikhail Botvinnik"
    },
    {
        text: "According to such great attacking players as Bronstein and Tal, most combinations are inspired by the player's memories of earlier games.",
        author: "Pal Benko"
    },
    {
        text: "After I won the title, I was confronted with the real world. People do not behave naturally anymore – hypocrisy is everywhere.",
        author: "Boris Spassky"
    },
    {
        text: "After a great deal of discussion in Soviet literature about the correct definition of a combination, it was decided that from the point of view of a methodical approach it was best to settle on this definition - A combination is a forced variation with a sacrifice.",
        author: "Alexander Kotov"
    },
    {
        text: "Agreeing to draws in the middlegame, equal or otherwise, deprives you of the opportunity to practice playing endgames, and the endgame is probably where you need the most practice.",
        author: "Pal Benko"
    },
    {
        text: "All chess masters have on occasion played a magnificent game and then lost it by a stupid mistake, perhaps in time pressure and it may perhaps seem unjust that all their beautiful ideas get no other recognition than a zero on the tournament table.",
        author: "Bent Larsen"
    },
    {
        text: "All chess players know what a combination is. Whether one makes it oneself, or is its victim, or reads of it, it stands out from the rest of the game and stirs one's admiration.",
        author: "Eugene Znosko-Borovsky"
    },
    {
        text: "All conceptions in the game of chess have a geometrical basis.",
        author: "Eugene Znosko-Borovsky"
    },
    {
        text: "All lines of play which lead to the imprisonment of the bishop are on principle to be condemned. (on the closed Ruy Lopez)",
        author: "Siegbert Tarrasch"
    },
    {
        text: "All that matters on the chessboard is good moves.",
        author: "Bobby Fischer"
    },
    {
        text: "All that now seems to stand between Nigel and the prospect of the world crown is the unfortunate fact that fate brought him into this world only two years after Kasparov.",
        author: "Garry Kasparov (on Nigel Short, 1987)"
    },
    {
        text: "Along with my retirement from chess analytical work seems to have gone too.",
        author: "Mikhail Botvinnik"
    },
    {
        text: "Although the knight is generally considered to be on a par with the bishop in strength, the latter piece is somewhat stronger in the majority of cases in which they are opposed to each other.",
        author: "José Raúl Capablanca"
    },
    {
        text: "Amberley excelled at chess - a mark, Watson, of a scheming mind.",
        author: "Sir Arthur Conan Doyle"
    },
    {
        text: "Americans really don't know much about chess. But I think when I beat Spassky, that Americans will take a greater interest in chess. Americans like winners.",
        author: "Bobby Fischer"
    },
    {
        text: "Among top grandmasters the Dutch is a rare defense, which is good reason to play it! It has not been studied very deeply by many opponents, and theory, based on a small number of 'reliable' games, must be rather unreliable.",
        author: "Bent Larsen"
    },
    {
        text: "An amusing fact: as far as I can recall, when playing the Ruy Lopez I have not yet once in my life had to face the Marshall Attack!",
        author: "Anatoly Karpov"
    },
    {
        text: "An innovation need not be especially ingenious, but it must be well worked out.",
        author: "Paul Keres"
    },
    {
        text: "An isolated pawn spreads gloom all over the chessboard.",
        author: "Savielly Tartakower"
    },
    {
        text: "Analysis is a glittering opportunity for training: it is just here that capacity for work, perseverance and stamina are cultivated, and these qualities are, in truth, as necessary to a chess player as a marathon runner.",
        author: "Lev Polugaevsky"
    },
    {
        text: "Analysis, if it is really carried out with a complete concentration of his powers, forms and completes a chess player.",
        author: "Lev Polugaevsky"
    },
    {
        text: "Anyone who wishes to learn how to play chess well must make himself or herself thoroughly conversant with the play in positions where the players have castled on opposite sides.",
        author: "Alexander Kotov"
    },
    {
        text: "Apart from direct mistakes, there is nothing more ruinous than routine play, the aim of which is mechanical development.",
        author: "Alexei Suetin"
    },
    {
        text: "As Rousseau could not compose without his cat beside him, so I cannot play chess without my king's bishop. In its absence the game to me is lifeless and void. The vitalizing factor is missing, and I can devise no plan of attack.",
        author: "Siegbert Tarrasch"
    },
    {
        text: "As a chess player one has to be able to control one's feelings, one has to be as cold as a machine.",
        author: "Levon Aronian"
    },
    {
        text: "As a rule, pawn endings have a forced character, and they can be worked out conclusively.",
        author: "Mark Dvoretsky"
    },
    {
        text: "As a rule, so-called 'positional' sacrifices are considered more difficult, and therefore more praise-worthy than those which are based exclusively on an exact calculation of tactical possibilities.",
        author: "Alexander Alekhine"
    },
    {
        text: "As a rule, the more mistakes there are in a game, the more memorable it remains, because you have suffered and worried over each mistake at the board.",
        author: "Viktor Korchnoi"
    },
    {
        text: "As long as my opponent has not yet castled, on each move I seek a pretext for an offensive. Even when I realize that the king is not in danger.",
        author: "Mikhail Tal"
    },
    {
        text: "As often as not, his strategy consists of stifling Black's activity and then winning in an endgame thanks to his superior pawn structure.",
        author: "Neil McDonald"
    },
    {
        text: "Attack! Always Attack!",
        author: "Adolf Anderssen"
    },
    {
        text: "Avoidance of mistakes is the beginning, as it is the end, of mastery in chess.",
        author: "Eugene Znosko-Borovsky"
    },
    {
        text: "Barcza is the most versatile player in the opening. He sometimes plays g2-g3 on the first, sometimes on the second, sometimes on the third, and sometimes only on the fourth move.",
        author: "Harry Golombek"
    },
    {
        text: "Before Geller we did not understand the King's Indian Defence.",
        author: "Mikhail Botvinnik"
    },
    {
        text: "Begone! Ignorant and impudent knight, not even in chess can a King be taken.",
        author: "King Louis VI"
    },
    {
        text: "Black's d5-square is too weak.",
        author: "Ulf Andersson (on the Dragon variation)"
    },
    {
        text: "Blitz chess kills your ideas.",
        author: "Bobby Fischer"
    },
    {
        text: "Bobby Fischer started off each game with a great advantage: after the opening he had used less time than his opponent and thus had more time available later on. The major reason why he never had serious time pressure was that his rapid opening play simply left sufficient time for the middlegame.",
        author: "Edmar Mednis"
    },
    {
        text: "Books on the openings abound; nor are works on the end game wanting; but those on the middle game can be counted on the fingers of one hand.",
        author: "Harry Golombek"
    },
    {
        text: "Boris Vasilievich was the only top-class player of his generation who played gambits regularly and without fear... over a period of 30 years he did not lose a single game with the King's Gambit.",
        author: "Garry Kasparov (on Boris Spassky)"
    },
    {
        text: "Botvinnik tried to take the mystery out of Chess, always relating it to situations in ordinary life. He used to call chess a typical inexact problem similar to those which people are always having to solve in everyday life.",
        author: "Garry Kasparov"
    },
    {
        text: "But alas! Like many another consummation devoutly to be wished, the actual performance was a disappointing one. (on the long awaited Lasker-Capablanca match in 1921)",
        author: "Fred Reinfeld"
    },
    {
        text: "But how difficult it can be to gain the desired full point against an opponent of inferior strength, when this is demanded by the tournament position!",
        author: "Anatoly Karpov"
    },
    {
        text: "But whatever you might say and whatever I might say, a machine which can play chess with people is one of the most marvellous wonders of our 20th century!",
        author: "David Bronstein"
    },
    {
        text: "But you see when I play a game of Bobby, there is no style. Bobby played perfectly. And perfection has no style.",
        author: "Miguel Najdorf"
    },
    {
        text: "By all means examine the games of the great chess players, but don't swallow them whole. Their games are valuable not for their separate moves, but for their vision of chess, their way of thinking.",
        author: "Anatoly Karpov"
    },
    {
        text: "By positional play a master tries to prove and exploit true values, whereas by combinations he seeks to refute false values... a combination produces an unexpected re-assessment of values.",
        author: "Emanuel Lasker"
    },
    {
        text: "By some ardent enthusiasts Chess has been elevated into a science or an art. It is neither; but its principal characteristic seems to be what human nature mostly delights in—a fight.",
        author: "Emanuel Lasker"
    },
    {
        text: "By strictly observing Botvinnik's rule regarding the thorough analysis of one's own games, with the years I have come to realize that this provides the foundation for the continuous development of chess mastery.",
        author: "Garry Kasparov"
    },
    {
        text: "By the mid-1990s the number of people with some experience of using computers was many orders of magnitude greater than in the 1960s. In the Kasparov defeat they recognized that here was a great triumph for programmers, but not one that may compete with the human intelligence that helps us to lead our lives.",
        author: "Igor Aleksander"
    },
    {
        text: "By the time a player becomes a Grandmaster, almost all of his training time is dedicated to work on this first phase. The opening is the only phase that holds out the potential for true creativity and doing something entirely new.",
        author: "Garry Kasparov"
    },
    {
        text: "By what right does White, in an absolutely even position, such as after move one, when both sides have advanced 1. e4, sacrifice a pawn, whose recapture is quite uncertain, and open up his kingside to attack? And then follow up this policy by leaving the check of the black queen open? None whatever!",
        author: "Emanuel Lasker"
    },
    {
        text: "Can you imagine the relief it gives a mother when her child amuses herself quietly for hours on end?",
        author: "Klara Polgar"
    },
    {
        text: "Capablanca did not apply himself to opening theory (in which he never therefore achieved much), but delved deeply into the study of end-games and other simple positions which respond to technique rather than to imagination.",
        author: "Max Euwe"
    },
    {
        text: "Chess can help a child develop logical thinking, decision making, reasoning, and pattern recognition skills, which in turn can help math and verbal skills.",
        author: "Susan Polgar"
    },
    {
        text: "Chess can learn a lot from poker. First, chess media and sponsors should emphasize its glamorous aspects: worldwide traveling, parties and escape from real world responsibilities.",
        author: "Jennifer Shahade"
    },
    {
        text: "Chess can never reach its height by following in the path of science... let us, therefore, make a effort and with the help of our imagination turn the struggle of technique into a battle of ideas.",
        author: "José Raúl Capablanca"
    },
    {
        text: "Chess continues to advance over time, so the players of the future will inevitably surpass me in the quality of their play, assuming the rules and regulations allow them to play serious chess. But it will likely be a long time before anyone spends 20 consecutive years as number one, as I did.",
        author: "Garry Kasparov"
    },
    {
        text: "Chess is a bond of brotherhood amongst all lovers of the noble game, as perfect as free masonry. It is a leveller of rank - title, wealth, nationality, politics, religion - all are forgotten across the board.",
        author: "Frederick Milnes Edge"
    },
    {
        text: "Chess is a contest between two men which lends itself particularly to the conflicts surrounding aggression.",
        author: "Reuben Fine"
    },
    {
        text: "Chess is a contributor to net human unhappiness, since the pleasure of victory is greatly exceeded by the pain of defeat.",
        author: "Bill Hartston"
    },
    {
        text: "Chess is a cure for headaches.",
        author: "John Maynard Keynes"
    },
    {
        text: "Chess is a game sufficiently rich in meaning that it is easily capable of containing elements of both tragedy and comedy.",
        author: "Luke McShane"
    },
    {
        text: "Chess is a game which reflects most honor on human wit.",
        author: "Voltaire"
    },
    {
        text: "Chess is a great game. No matter how good one is, there is always somebody better. No matter how bad one is, there is always somebody worse.",
        author: "I. A. Horowitz"
    },
    {
        text: "Chess is a matter of delicate judgement, knowing when to punch and how to duck.",
        author: "Bobby Fischer"
    },
    {
        text: "Chess is a matter of vanity.",
        author: "Alexander Alekhine"
    },
    {
        text: "Chess is a meritocracy.",
        author: "Lawrence Day"
    },
    {
        text: "Chess is a miniature version of life. To be successful, you need to be disciplined, assess resources, consider responsible choices and adjust when circumstances change.",
        author: "Susan Polgar"
    },
    {
        text: "Chess is a natural cerebral high.",
        author: "Walter Browne"
    },
    {
        text: "Chess is a sport. A violent sport.",
        author: "Marcel Duchamp"
    },
    {
        text: "Chess is a test of wills.",
        author: "Paul Keres"
    },
    {
        text: "Chess is a unique cognitive nexus, a place where art and science come together in the human mind and are refined and improved by experience.",
        author: "Garry Kasparov"
    },
    {
        text: "Chess is beautiful enough to waste your life for.",
        author: "Hans Ree"
    },
    {
        text: "Chess is eminently and emphatically the philosopher's game.",
        author: "Paul Morphy"
    },
    {
        text: "Chess is far too complex to be definitively solved with any technology we can conceive of today.",
        author: "Garry Kasparov"
    },
    {
        text: "Chess is infinite, and one has to make only one ill-considered move, and one's opponent's wildest dreams will become reality.",
        author: "David Bronstein"
    },
    {
        text: "Chess is like a language, the top players are very fluent at it. Talent can be developed scientifically but you have to find first what you are good at.",
        author: "Viswanathan Anand"
    },
    {
        text: "Chess is like body-building. If you train every day, you stay in top shape. It is the same with your brain – chess is a matter of daily training.",
        author: "Vladimir Kramnik"
    },
    {
        text: "Chess is my life.",
        author: "Viktor Korchnoi"
    },
    {
        text: "Chess is my profession. I am my own boss; I am free. I like literature and music, classical especially. I am in fact quite normal.",
        author: "Bent Larsen"
    },
    {
        text: "Chess is not for the faint-hearted; it absorbs a person entirely. To get to the bottom of this game, he has to give himself up into slavery.",
        author: "Wilhelm Steinitz"
    },
    {
        text: "Chess is not for the timid.",
        author: "Irving Chernev"
    },
    {
        text: "Chess is not relaxing; it's stressful even if you win.",
        author: "Jennifer Shahade"
    },
    {
        text: "Chess is one long regret.",
        author: "Stephen Leacock"
    },
    {
        text: "Chess is only a recreation and not an occupation.",
        author: "Vladimir Lenin"
    },
    {
        text: "Chess is something more than a game. It is an intellectual diversion which has certain artistic qualities and many scientific elements.",
        author: "José Raúl Capablanca"
    },
    {
        text: "Chess is the touchstone of intellect.",
        author: "Johann Wolfgang von Goethe"
    },
    {
        text: "Chess is thriving. There are ever less round robin tournaments and ever more World Champions.",
        author: "Robert Hübner"
    },
    {
        text: "Chess masters as well as chess computers deserve less reverence than the public accords them.",
        author: "Eliot Hearst"
    },
    {
        text: "Chess programs are our enemies, they destroy the romance of chess. They take away the beauty of the game. Everything can be calculated.",
        author: "Levon Aronian"
    },
    {
        text: "Chess strategy as such today is still in its diapers, despite Tarrasch's statement 'We live today in a beautiful time of progress in all fields'.",
        author: "Aron Nimzowitsch"
    },
    {
        text: "Chess strength in general and chess strength in a specific match are by no means one and the same thing.",
        author: "Garry Kasparov"
    },
    {
        text: "Chess will always be in the doldrums as a spectator sport while a draw is given equal mathematical value as a decisive result.",
        author: "Michael Basman"
    },
    {
        text: "Chess, like love, is infectious at any age.",
        author: "Salo Flohr"
    },
    {
        text: "Chess-play is a good and witty exercise of the mind for some kind of men, but if it proceed from overmuch study, in such a case it may do more harm than good.",
        author: "Robert Burton"
    },
    {
        text: "Combinations with a queen sacrifice are among the most striking and memorable...",
        author: "Anatoly Karpov"
    },
    {
        text: "Concentrate on material gains. Whatever your opponent gives you take, unless you see a good reason not to.",
        author: "Bobby Fischer"
    },
    {
        text: "Condemned by theory, the Allgaier, certainly one of the most romantic of gambits, is generally successful in practice.",
        author: "Tony Santasiere"
    },
    {
        text: "Confidence is very important – even pretending to be confident. If you make a mistake but do not let your opponent see what you are thinking then he may overlook the mistake.",
        author: "Viswanathan Anand"
    },
    {
        text: "Contrary to many young colleagues I do believe that it makes sense to study the classics.",
        author: "Magnus Carlsen"
    },
    {
        text: "Deschapelles became a first-rate player in three days, at the age of something like thirty.",
        author: "Frederick Milnes Edge"
    },
    {
        text: "Despite the development of chess theory, there is much that remains secret and unexplored in chess.",
        author: "Vasily Smyslov"
    },
    {
        text: "Do not bring your queen out too early.",
        author: "Francisco Bernardina Calogno"
    },
    {
        text: "Do not permit yourself to fall in love with the end-game play to the exclusion of entire games.",
        author: "Emanuel Lasker"
    },
    {
        text: "Do not pick a move from a list of computer lines - use your own brains. This is important, especially for young players.",
        author: "Laszlo Hazai"
    },
    {
        text: "Don't be afraid of losing, be afraid of playing a game and not learning something.",
        author: "Dan Heisman"
    },
    {
        text: "Don't worry about your rating, work on your playing strength and your rating will follow.",
        author: "Dan Heisman"
    },
    {
        text: "Don't worry kids, you'll find work. After all, my machine will need strong chess player-programmers. You will be the first.",
        author: "Mikhail Botvinnik (to Karpov, 1965)"
    },
    {
        text: "Drawn games are sometimes more scintillating than any conclusive contest.",
        author: "Savielly Tartakower"
    },
    {
        text: "During a chess tournament a master must envisage himself as a cross between an ascetic monk and a beast of prey.",
        author: "Alexander Alekhine"
    },
    {
        text: "During the late Victorian period the majority of chess magazines printed increasing numbers of humorous stories, poems and anecdotes about the agonies and idiocies of women chess players.",
        author: "British Chess Magazine"
    },
    {
        text: "Emotional instability can be one of the factors giving rise to a failure by chess players in important duels.",
        author: "Mark Dvoretsky"
    },
    {
        text: "Endings of one rook and pawns are about the most common sort of endings arising on the chess board. Yet though they do occur so often, few have mastered them thoroughly.",
        author: "José Raúl Capablanca"
    },
    {
        text: "You could be just luminous. You wanna be luminous?",
        author: "Loona"
    }
  ];
}