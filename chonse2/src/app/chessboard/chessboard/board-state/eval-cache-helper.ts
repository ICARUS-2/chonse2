export default class EvalCacheHelper
{
    public static FEN_KEY_SPLIT = 3;

    //Used to get the piece state, turn, castling and en passant square from the FEN, removing the turn counts.
    //Cache can be queried by key in order to eliminate redundant evaluation from the engine.
    public static getEvalCacheKeyFromFen(fen: string)
    {
        //Split the FEN using spaces.
        const fenSplit: string[] = fen.split(" ");

        //Start building the key.
        let key: string = "";

        //Append position, turn, castling and en passant square.
        for(let i = 0; i <= this.FEN_KEY_SPLIT; i++)
        {
            const part = fenSplit[i];

            key += part;
        }

        return key;
    }

}