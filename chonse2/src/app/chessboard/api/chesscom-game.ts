import { GameOverReason, GameScore } from "../../../lib/game-state";
import { PieceColor } from "../../../lib/piece-color";

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
