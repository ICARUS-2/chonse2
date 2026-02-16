import { EngineName } from "../types/enums";
import { UciEngine } from "../uciEngine";
import { isMultiThreadSupported, isWasmSupported } from "../helpers/shared";
import { BASE_PATH } from "../../../../helpers/globals";

export class Stockfish18Lite {
  public static async create(lite?: boolean): Promise<UciEngine> {
    if (!Stockfish18Lite.isSupported()) {
      throw new Error("Stockfish 18 is not supported");
    }

    const multiThreadIsSupported = isMultiThreadSupported();
    if (!multiThreadIsSupported) console.log("Single thread mode");

    const enginePath = `${BASE_PATH}/engines/stockfish-18/stockfish-18-lite${multiThreadIsSupported ? "" : "-single"}.js`;

    const engineName = EngineName.Stockfish18Lite;

    return UciEngine.create(engineName, enginePath);
  }

  public static isSupported() {
    return isWasmSupported();
  }
}
