export default class CastlingRights
{
    queenSide: boolean = true;
    kingSide: boolean = true;

    removeCastlingRights()
    {
        this.queenSide = false;
        this.kingSide = false;
    }
}