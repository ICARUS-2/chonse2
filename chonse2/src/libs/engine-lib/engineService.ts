import { computed, Service, signal } from "@angular/core";
import LocalStorageHelper from "../local-storage-helper";
import { EngineName } from "./types/enums";
import { UciEngine } from "./uciEngine";
import { EvaluateGameParams, EvaluatePositionWithUpdateParams, GameEval, PositionEval } from "./types/eval";

@Service()
export class EngineService
{
    //The stored engine instance
    private readonly _engine = signal<UciEngine | null>(null);
    private _enginePromise: Promise<UciEngine> | null = null;

    //Engine data for lookup.
    public readonly name = computed(() => this._engine()?.name() ?? EngineName.None);
    
    //Exposed ready state.
    public readonly isReady = computed(() => this._engine()?.isReady() ?? false);
    
    //Should use lichess cloud eval.
    public readonly isCloudHybrid = computed(() => this._engine()?.isCloudHybridMode() ?? false);
    
    //Lock used to ensure that two games won't be analyzed at once.
    private readonly _isEvaluatingGame = signal(false);
    public readonly isEvaluatingGame = this._isEvaluatingGame.asReadonly();

    //Ensures any internal callers will always get the engine instance (singleton).
    private async _getEngine(): Promise<UciEngine>
    {
        //If the engine was already instantiated just return the thing.
        const existing = this._engine();
        if (existing !== null) 
        {
            return existing;
        }

        //If the engine is in the middle of being instantiated, return the promise which will resolve upon successful instantiation.
        if (this._enginePromise !== null)
        {
            return this._enginePromise;
        } 

        //If we got this far: Engine has not been instantiated, nor has it started to be.

        //Engine and cloud hybrid status stored in local.
        const engineType = LocalStorageHelper.getString(LocalStorageHelper.SELECTED_ENGINE, UciEngine.DEFAULT_ENGINE) as EngineName;
        const cloudHybridMode = LocalStorageHelper.getBoolean(LocalStorageHelper.CLOUD_HYBRID_MODE, true);

        //Get engine from internal factory.
        this._enginePromise = UciEngine.getEngine(engineType)
            .then(engine =>
            {
                //Ensure cloud hybrid set.
                engine.setCloudHybridMode(cloudHybridMode);

                //Set last, so computeds see a fully configured engine
                this._engine.set(engine); 

                //Finally, instance returned.
                return engine;
            })
            .catch(error =>
            {
                //If something fucked up, clear the promise as well.
                this._enginePromise = null;
                throw error;
            });

        //Return promise that will eventually be resolved with instantiated engine.
        return this._enginePromise;
    }

    public setCloudHybrid(enabled: boolean): void
    {
        this._engine()?.setCloudHybridMode(enabled);
        LocalStorageHelper.setBoolean(LocalStorageHelper.CLOUD_HYBRID_MODE, enabled);
    }

    //#region Exposing functions without exposing instance.
    public async evaluateGame(params: EvaluateGameParams): Promise<GameEval> 
    {
        if (this.isEvaluatingGame())
        {
            throw {"message": "Cannot evaluate multiple games at the same time"}
        }

        const engine = await this._getEngine();

        this._isEvaluatingGame.set(true);
        const res = await engine.evaluateGame(params);
        this._isEvaluatingGame.set(false);

        return res;
    }

    public async evaluatePositionWithUpdate(params: EvaluatePositionWithUpdateParams): Promise<PositionEval> 
    {
        const engine = await this._getEngine();

        return engine.evaluatePositionWithUpdate(params);
    }

    public async getEngineNextMove(fen: string, elo: number, depth?: number): Promise<string | undefined> 
    {
        const engine = await this._getEngine();

        return engine.getEngineNextMove(fen, elo, depth);
    }

    public async getNumberOfLines()
    {
        const engine = await this._getEngine();

        return engine.multiPv;
    }

    public terminateEngine(): void 
    {
        this._engine()?.shutdown();
        this._engine.set(null);
        this._enginePromise = null;
    }
}