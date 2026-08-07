import { GameOverReason, GameScore } from "../chess-game-lib/types/game-state";
import { PositionEval, LineEval, EvalSource } from "../engine-lib/types/eval";


export class LichessAPI
{
    private static _getBaseEndpointForUser(username: string): string
    {
        return `https://lichess.org/api/games/user/${username}?until=${Date.now()}&max=50&pgnInJson=true&sort=dateDesc&clocks=true`;
    }

    static async getGamesForUser(username: string): Promise<LichessGame[]>
    {
        const baseEndpoint = LichessAPI._getBaseEndpointForUser(username);

        try 
        {
            const res = await fetch(baseEndpoint, {method: "GET", headers: {accept: "application/x-ndjson"}});

            const rawData = await res.text();
            const rawGames = rawData
                .split("\n")
                .filter((game) => game.length > 0)
                .map((game) => JSON.parse(game));

            
            const games = rawGames.map( g => new LichessGame(g) );

            return games;
        }
        catch(ex)
        {
            //return empty arr
        }

        return [];
    }
    
    static async getUserGameById(username: string, id: string): Promise<LichessGame | undefined>
    {
        const games = await LichessAPI.getGamesForUser(username);

        const game = games.filter(g => g.id == id)[0];

        return game;
    }

    static async getCloudEval(fen: string): Promise<PositionEval | undefined>
    {
        try 
        {
            const url = `https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=${3}`;

            const res: Response = await fetch(url, 
            {
                headers: 
                {
                    "Accept": "application/json"
                }
            });

            const data = await res.json();

            const posEval: PositionEval = {
                bestMove: data.pvs[0].moves.split(" ")[0],
                lines: data.pvs.map( ( l:any, index: number ) => 
                { 
                    const e: LineEval = {
                        pv: l.moves.split(" "),
                        depth: data.depth,
                        multiPv: index + 1,
                        cp: l.cp,
                        mate: l.mate
                    }

                    return e;
                },),
                source: EvalSource.Cloud,
                isPartial: false
            };

            if (posEval.lines.length < 2)
            {
                console.info("Cloud eval for " + fen + " successful, but insufficient lines found. Returning undefined");
                return undefined;
            }

            console.info("Cloud eval successful for position " + fen)
            return posEval;
        }
        catch(ex)
        {
            //console.log(ex);
        }

        return undefined;
    }
}

class LichessPlayer 
{
    name: string = "";
    rating: number = -1;

  constructor( username: string, rating: number )
  {
    this.name = username;
    this.rating = rating;
  }
}

interface LichessClock {
  initial: number;
  increment: number;
  totalTime: number;
}

export class LichessGame {
  id: string = "";
  createdAt: number = -1;
  lastMoveAt: number = -1;
  status: string = "";
  players!: {
        white: LichessPlayer;
        black: LichessPlayer;
    };
  winner?: "white" | "black";
  moves: string = "";
  pgn: string = "";
  clock: LichessClock = {initial: -1, increment: -1, totalTime: -1};
  url?: string;
  perf: string = "";
  variant: string = ""
  
  constructor(data: any)
  {
    this.id = data.id;
    this.createdAt = data.createdAt;
    this.status = data.status;
    this.players = { white: new LichessPlayer(data.players.white.user.name, data.players.white.rating), black: new LichessPlayer(data.players.black.user.name, data.players.black.rating)}
    this.winner = data.winner;
    this.pgn = data.pgn;
    this.clock = {initial: data.clock.initial, increment: data.clock.increment, totalTime: data.clock.totalTime};
    this.url = data.url;
    this.perf = data.perf;
    this.moves = data.moves;
    this.variant = data.variant;
}

  getScore(): string
  {
    if (this.winner == "white")
    {
        return GameScore.WHITE_WON;
    }

    if (this.winner == "black")
    {
        return GameScore.BLACK_WON;
    }

    return GameScore.DRAW;
  }

  getReason()
  {
    if (this.status.includes("stalemate"))
    {
        return GameOverReason.Stalemate;
    }

    if (this.status.includes("mate"))
    {
        return GameOverReason.Checkmate;
    }

    if (this.status.includes("aborted"))
    {
        return GameOverReason.Aborted;
    }

    if (this.status.includes("resign"))
    {
        return GameOverReason.Resignation;
    }

    if (this.status.includes("timeout"))
    {
        return GameOverReason.Abandon;
    }

    if (this.status.includes("outoftime"))
    {
        return GameOverReason.Timeout;
    }

    if (this.status.includes("cheat"))
    {
        return GameOverReason.Cheating;
    }

    if (this.status.includes("insufficientMaterial"))
    {
        return GameOverReason.InsufficientMaterial;
    }

    return this.status;
  }

  formatTimeControl(): string
  {
    let str: string = "";

    str += (this.clock.initial / 60).toString();

    if (this.clock.increment > 0)
    {
        str += "+" + this.clock.increment;
    }

    return str;
  }

    formatDate() : string
    {
        const endDate = new Date(this.createdAt);
        return endDate.toLocaleDateString();
    }
}