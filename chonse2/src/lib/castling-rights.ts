export default class CastlingRights
{
    queenSide: boolean = true;
    kingSide: boolean = true;

    removeBothCastlingRights()
    {
        this.queenSide = false;
        this.kingSide = false;
    }
}