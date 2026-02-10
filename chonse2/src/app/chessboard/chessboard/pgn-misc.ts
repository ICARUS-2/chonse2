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
    Termination = "Termination"
}

interface SanMove 
{
    piece: string,
    toCoordinate: string,
    fromFile: string,
    fromRank: string,
    isCapture: false,
    promotion: null 
}

export class PgnHeaders 
{
    event: string = "-";
    site: string = "-";
    date: string = "-";
    round: string = "-";
    white: string = "White";
    black: string = "Black";
    result: string = "";

    whiteElo: string = "";
    blackElo: string = "";
    eco: string = "";
    termination: string = ""

    otherFields: Map<string, string> = new Map<string, string>();
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
            isCapture: false,
            promotion: null
        };

        return move;
    }
}