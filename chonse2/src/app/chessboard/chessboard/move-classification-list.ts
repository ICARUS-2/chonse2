import { MoveClassification } from "../engine/types/enums";

export default class MoveClassificationList 
{
    moves: Map<MoveClassification, Array<number>> = new Map<MoveClassification, Array<number>>();

    getFromString(str: string): Array<number>
    {
        const s = str as MoveClassification;
        return this.moves.get(s) ?? [];
    }
}