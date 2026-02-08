import Chonse2 from "../../../lib/chonse2";
import Arrow from "./arrow";

export default interface BoardState
{
    chessGame: Chonse2;
    squareHighlightStatuses: Array<Array<boolean>>;
    arrows: Array<Arrow>;
}