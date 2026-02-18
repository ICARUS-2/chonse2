import { MoveClassification } from "../engine/types/enums";

export default class MoveClassificationList 
{
    moves: Map<MoveClassification, { arr: Array<number>, ptr: number }> = new Map<MoveClassification, { arr: Array<number>, ptr: number }>();

    getFromString(str: string): Array<number>
    {
        const s = str as MoveClassification;
        return this.moves.get(s)?.arr ?? [];
    }
}