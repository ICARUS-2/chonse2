import { EngineName } from "../types/enums";
import { UciEngine } from "../uciEngine";
import { isWasmSupported } from "../helpers/shared";
import { BASE_PATH } from "../../../globals/globals";


export class Stockfish19 {
  public static async create(lite?: boolean): Promise<UciEngine> {
    if (!Stockfish19.isSupported()) {
      throw new Error("Stockfish 19 is not supported");
    }

    const enginePath = `${BASE_PATH}/engines/stockfish-19/stockfish-19${
      lite ? "-lite" : ""
    }-single.js`;

    const engineName = lite
      ? EngineName.Stockfish19Lite
      : EngineName.Stockfish19;

    return UciEngine.create(engineName, enginePath);
  }

  public static isSupported() {
    return isWasmSupported();
  }
}