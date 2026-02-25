import { UciEngine } from "../chessboard/engine/uciEngine";

export default class VsAiConfig 
{
    private _elo: number;
    private _humanPlayerIsWhite;
    
    constructor(elo: number, humanPlayerIsWhite: boolean)
    {
        if (elo > UciEngine.MAX_ELO || elo < UciEngine.MIN_ELO)
        {
            throw (`ELO was out of range${UciEngine.MIN_ELO} - ${UciEngine.MAX_ELO}`)
        }

        this._elo = elo;
        this._humanPlayerIsWhite = humanPlayerIsWhite;
    }

    getElo()
    {
        return this._elo;
    }

    getIsHumanPlayerWhite()
    {
        return this._humanPlayerIsWhite;
    }
}