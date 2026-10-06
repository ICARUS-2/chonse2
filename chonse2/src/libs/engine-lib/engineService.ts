import { Service } from "@angular/core";
import { UciEngine } from "./uciEngine";
import { EngineName } from "./types/enums";
import LocalStorageHelper from "../local-storage-helper";

@Service()
export class EngineService
{
    private _engine: UciEngine | null = null;
    private _enginePromise: Promise<UciEngine> | null = null;

    public async getEngine(): Promise<UciEngine>
    {
        //Already initialized
        if (this._engine !== null)
        {
            return this._engine;
        }

        //Already being initialized
        if (this._enginePromise !== null)
        {
            return this._enginePromise;
        }

        const engineType: EngineName =
            LocalStorageHelper.getString(
                LocalStorageHelper.SELECTED_ENGINE,
                EngineName.Stockfish18Lite
            ) as EngineName;

        const cloudHybridMode =
            LocalStorageHelper.getBoolean(
                LocalStorageHelper.CLOUD_HYBRID_MODE,
                true
            );

        this._enginePromise = UciEngine.getEngine(engineType)
            .then(engine =>
            {
                engine.isCloudHybridMode = cloudHybridMode;

                this._engine = engine;

                return engine;
            })
            .catch(error =>
            {
                // Important: allow a future retry after failure
                this._enginePromise = null;
                throw error;
            });

        return this._enginePromise;
    }

    public getName(): EngineName | null
    {
        if (this._engine)
        {
            return this._engine.name;
        }

        return null;
    }

    public isReady(): boolean 
    {
        if (this._engine)
        {
            return this._engine.getIsReady();
        }

        return false;
    }

    public isCloudHybrid(): boolean 
    {
        if (this._engine)
        {
            return this._engine.isCloudHybridMode;
        }

        return false;
    }
}