import Chonse2 from "../../../lib/chonse2";
import { Arrow } from "./arrow";

export default interface BoardState
{
    mainStateStack: Array<Chonse2>;    
    mainStackPointer: number;

    deviationStack: Array<Chonse2>;
    deviationStackPointer: number;

    squareHighlightStatuses: Array<Array<boolean>>;
    arrows: Array<Arrow>;
    isFlipped: boolean;
}