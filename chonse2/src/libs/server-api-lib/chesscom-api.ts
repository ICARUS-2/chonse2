import { GameScore, GameOverReason } from "../chess-game-lib/types/game-state";

export class ChessComAPI
{
    private static _getBaseEndpointForUser(username: string)
    {
        return `https://api.chess.com/pub/player/${username}/games/archives`
    }

    static async getGamesForUser(username: string): Promise<ChessComGame[]>
    {
        try 
        {
          const baseEndpoint = ChessComAPI._getBaseEndpointForUser(username);

          const archivesResponse = await fetch(baseEndpoint);
          const archivesData: {archives: Array<string>} = await archivesResponse.json() as {archives: Array<string>};

          if (!archivesData.archives)
          {
            return [];
          }

          const mostRecentGamesEndpoint = archivesData.archives[archivesData.archives.length - 1];

          const gameDataResponse = await fetch(mostRecentGamesEndpoint);

          let arr: Array<ChessComGame> = [];
          if (gameDataResponse.status < 400)
          {
            const gameData: {games: Array<object>} = await gameDataResponse.json();
            arr = gameData.games.map( item => new ChessComGame(item) );
          }

          if (arr.length < 50)
          {
            const previousMonthMostRecentGamesEndpoint = archivesData.archives[archivesData.archives.length - 2];
            
            if (previousMonthMostRecentGamesEndpoint)
            {
              const previousMonthResponse = await fetch(previousMonthMostRecentGamesEndpoint);
              const previousMonthGameData: {games: Array<object>} = await previousMonthResponse.json();
              const previousMonthArr: Array<ChessComGame> = previousMonthGameData.games.map( item => new ChessComGame(item) );

              arr = [...previousMonthArr, ...arr]
            }
          }

          return arr.reverse();
        }
        catch(ex)
        {
          console.log(ex);
            //return empty arr.
        }

        return [];
    }


    static async getUserGameById(username: string, gameId: string): Promise<ChessComGame | undefined>
    {
        const games = await this.getGamesForUser(username);

        const filtered = games.filter(g => g.url.includes(gameId));

        if (filtered[0])
        {
            return filtered[0];
        }

        return undefined;
    }
}

export class ChessComGame {
  url: string;
  pgn: string;
  time_control: string;
  end_time: number;
  rated: boolean;
  tcn: string;
  uuid: string;
  initial_setup: string;
  fen?: string;
  time_class: string;
  rules: string;
  white: ChessComPlayer;
  black: ChessComPlayer;
  eco?: string;

  constructor(data: any) {
    this.url = data.url;
    this.pgn = data.pgn;
    this.time_control = data.time_control;
    this.end_time = data.end_time;
    this.rated = data.rated;
    this.tcn = data.tcn;
    this.uuid = data.uuid;
    this.initial_setup = data.initial_setup;
    this.fen = data.fen;
    this.time_class = data.time_class;
    this.rules = data.rules;
    this.white = new ChessComPlayer(data.white);
    this.black = new ChessComPlayer(data.black);
    this.eco = data.eco;
  }

  getScore(): string
  {
    if (this.white.result == "win")
    {
      return GameScore.WHITE_WON;
    }

    if (this.black.result == "win")
    {
      return GameScore.BLACK_WON;
    }

    return GameScore.DRAW;
  }

  getReason(): string
  {
    const score = this.getScore();
    let res = "";

    if (score == GameScore.WHITE_WON)
    {
      res = this.black.result;
    }

    if (score == GameScore.BLACK_WON)
    {
      res = this.white.result;
    }

    //If it was a draw, both will have the same reason.
    if (score == GameScore.DRAW)
    {
      res = this.white.result;
    }

    if (res.includes("checkmate"))
    {
      return GameOverReason.Checkmate;
    }

    if (res.includes("stalemate"))
    {
      return GameOverReason.Stalemate;
    }

    if (res.includes("resign"))
    {
      return GameOverReason.Resignation;
    }

    if (res.includes("abandon"))
    {
      return GameOverReason.Abandon;
    }

    if (res.includes("timeout"))
    {
      return GameOverReason.Timeout;
    }

    if (res.includes("timevsinsufficient"))
    {
      return GameOverReason.TimeVsInsufficient;
    }

    if (res.includes("insufficient"))
    {
      return GameOverReason.InsufficientMaterial;
    }

    if (res.includes("repetition"))
    {
      return GameOverReason.ThreefoldRepetition;
    }

    if (res.includes("50move"))
    {
      return GameOverReason.FiftyMoveNoPawnMovementsOrCaptures;
    }

    return GameOverReason.Unknown;
  }

  formatTimeControl() : string
  {
    try
    {
      //If it has an increment.
      if (this.time_control.includes("+"))
      {
        const [base, increment] = this.time_control.split("+");
        return `${Number(base)/60}|${increment}`
      }

      //If it's a daily game.
      if (this.time_control.includes('/')) 
      {
        const [moves, seconds] = this.time_control.split('/');
        const days = Number(seconds) / 86400;
        return `${moves} move(s) in ${days} day(s)`;
      }

      //If there's no increment.
      return `${Number(this.time_control) / 60}`;
    }
    catch(ex)
    {
      //if error, just return what is already there.
    }

    return this.time_control;
  }

  formatDate() : string
  {
    const endDate = new Date(this.end_time * 1000);
    return endDate.toLocaleString();
  }
}

export class ChessComPlayer {
  rating: number;
  result: string;
  username: string;
  uuid: string;
  '@id': string;

  constructor(data: any) {
    this.rating = data.rating;
    this.result = data.result;
    this.username = data.username;
    this.uuid = data.uuid;
    this['@id'] = data['@id'];
  }
}
