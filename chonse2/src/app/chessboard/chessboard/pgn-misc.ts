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


interface SanMove 
{
    piece: string,
    toCoordinate: string,
    fromFile: string,
    fromRank: string,
    promotion: null 
}

export class PgnHelper
{
    static parseAlgebra(str: string) : SanMove
    {
        const move: SanMove = 
        {
            piece: "",
            toCoordinate: "",
            fromFile: "",
            fromRank: "",
            promotion: null
        };

        return move;
    }
}