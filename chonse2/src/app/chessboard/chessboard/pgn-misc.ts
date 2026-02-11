export enum PgnFields
{
    //necessary
    Event = "Event",
    Site = "Site",
    Date = "Date",
    Round = "Round",
    White = "White",
    Black = "Black",
    Result = "Result",

    //optional
    WhiteElo = "WhiteElo",
    BlackElo = "BlackElo",
    ECO = "ECO",
    Termination = "Termination",
    TimeControl = "TimeControl"
}

export class PgnHeaders 
{
    //necessary
    event: string = "-";
    site: string = "-";
    date: string = "-";
    round: string = "-";
    white: string = "White";
    black: string = "Black";
    result: string = "";

    //optional
    whiteElo: string = "";
    blackElo: string = "";
    eco: string = "";
    termination: string = "";
    timeControl: string = "";

    //other
    otherFields: Map<string, string> = new Map<string, string>();
}


export interface SanMove {
    piece: string;              // "P", "N", "B", "R", "Q", "K"
    toCoordinate: string;       // "e4"
    fromFile: string | null;    // "a"–"h"
    fromRank: string | null;    // "1"–"8"
    isCapture: boolean;
    promotion: string | null;   // "Q", "R", "B", "N"
}