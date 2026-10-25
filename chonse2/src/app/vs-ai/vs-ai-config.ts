import { AngularUCIEngine } from "../../libs/engine-lib/angularUciEngine";


export default class VsAiConfig 
{
    private _elo: number;
    private _humanPlayerIsWhite;
    
    constructor(elo: number, humanPlayerIsWhite: boolean)
    {
        if (elo > AngularUCIEngine.MAX_ELO || elo < AngularUCIEngine.MIN_ELO)
        {
            throw (`ELO was out of range${AngularUCIEngine.MIN_ELO} - ${AngularUCIEngine.MAX_ELO}`)
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