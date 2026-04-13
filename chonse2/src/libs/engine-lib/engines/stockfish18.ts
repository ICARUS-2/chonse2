import { EngineName } from "../types/enums";
import { UciEngine } from "../uciEngine";
import { isWasmSupported } from "../helpers/shared";
import { BASE_PATH } from "../../../globals/globals";


export class Stockfish18 {
  public static async create(lite?: boolean): Promise<UciEngine> {
    if (!Stockfish18.isSupported()) {
      throw new Error("Stockfish 18 is not supported");
    }

    const enginePath = `${BASE_PATH}/engines/stockfish-18/stockfish-18${
      lite ? "-lite" : ""
    }-single${lite ? "" : "-6563532"}.js`;

    const engineName = lite
      ? EngineName.Stockfish18Lite
      : EngineName.Stockfish18;

    return UciEngine.create(engineName, enginePath);
  }

  public static isSupported() {
    return isWasmSupported();
  }
}