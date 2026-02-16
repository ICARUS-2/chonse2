import { EngineName } from "../types/enums";
import { UciEngine } from "../uciEngine";
import { isMultiThreadSupported, isWasmSupported } from "../helpers/shared";
import { BASE_PATH } from "../../../../helpers/globals";

export class Stockfish17_1 {
  public static async create(): Promise<UciEngine> {
    if (!Stockfish17_1.isSupported()) {
      throw new Error("Stockfish 17.1 is not supported");
    }

    const multiThreadIsSupported = isMultiThreadSupported();
    if (!multiThreadIsSupported) console.log("Single thread mode");

    const enginePath = `${BASE_PATH}/engines/stockfish-17.1/stockfish-17.1${multiThreadIsSupported ? "" : "-single"}.js`;

    const engineName = EngineName.Stockfish17_1;

    return UciEngine.create(engineName, enginePath);
  }

  public static isSupported() {
    return isWasmSupported();
  }
}
