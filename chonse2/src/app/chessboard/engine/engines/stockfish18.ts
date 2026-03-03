import { EngineName } from "../types/enums";
import { UciEngine } from "../uciEngine";
import { isMultiThreadSupported, isWasmSupported } from "../helpers/shared";
import { BASE_PATH } from "../../../../globals/globals";

export class Stockfish18 {
  public static async create(lite?: boolean): Promise<UciEngine> {
    if (!Stockfish18.isSupported()) {
      throw new Error("Stockfish 18 is not supported");
    }

    const multiThreadIsSupported = isMultiThreadSupported();
    if (!multiThreadIsSupported) console.log("Single thread mode");

    let enginePath = "";
    //const engineName = lite ? EngineName.Stockfish18Lite : EngineName.Stockfish18;
    const engineName = EngineName.Stockfish18Lite;
    if (lite)
    {
      enginePath = `${BASE_PATH}/engines/stockfish-18/stockfish-18-lite${multiThreadIsSupported ? "" : "-single"}.js`;
    }
    else 
    {
      enginePath = `https://cdn.jsdelivr.net/npm/@icarus2/stockfish-18-single@1.0.0/stockfish-18-single.js`;
    }

    return UciEngine.create(engineName, enginePath);
  }

  public static isSupported() {
    return isWasmSupported();
  }
}
