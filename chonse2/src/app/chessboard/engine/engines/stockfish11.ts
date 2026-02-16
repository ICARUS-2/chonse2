import { EngineName } from "../types/enums";
import { UciEngine } from "../uciEngine";
import { BASE_PATH } from "../../../../helpers/globals";

export class Stockfish11 {
  public static async create(): Promise<UciEngine> {
    const enginePath = `${BASE_PATH}/engines/stockfish-11/stockfish-11.js`;

    return UciEngine.create(EngineName.Stockfish11, enginePath);
  }

  public static isSupported() {
    return true;
  }
}
