import { EngineName } from "../types/enums";
import { AngularUCIEngine } from "../angularUciEngine";
import { BASE_PATH } from "../../../globals/globals";

export class Stockfish11 {
  public static async create(): Promise<AngularUCIEngine> {
    const enginePath = `${BASE_PATH}/engines/stockfish-11/stockfish-11.js`;

    return AngularUCIEngine.create(EngineName.Stockfish11, enginePath);
  }

  public static isSupported() {
    return true;
  }
}
