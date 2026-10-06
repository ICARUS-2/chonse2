import { computed, Service, signal } from "@angular/core";
import LocalStorageHelper from "../local-storage-helper";
import { EngineName } from "./types/enums";
import { UciEngine } from "./uciEngine";

@Service()
export class EngineService
{
    private readonly _engine = signal<UciEngine | null>(null);
    private _enginePromise: Promise<UciEngine> | null = null;

    public readonly name = computed(() => this._engine()?.name ?? null);
    public readonly isReady = computed(() => this._engine()?.isReady() ?? false);
    public readonly isCloudHybrid = computed(() => this._engine()?.isCloudHybridMode() ?? false);

    public async getEngine(): Promise<UciEngine>
    {
        const existing = this._engine();
        if (existing !== null) return existing;

        if (this._enginePromise !== null) return this._enginePromise;

        const engineType = LocalStorageHelper.getString(
            LocalStorageHelper.SELECTED_ENGINE,
            EngineName.Stockfish18Lite
        ) as EngineName;

        const cloudHybridMode = LocalStorageHelper.getBoolean(
            LocalStorageHelper.CLOUD_HYBRID_MODE,
            true
        );

        this._enginePromise = UciEngine.getEngine(engineType)
            .then(engine =>
            {
                engine.setCloudHybridMode(cloudHybridMode);
                this._engine.set(engine); // set last, so computeds see a fully configured engine
                return engine;
            })
            .catch(error =>
            {
                this._enginePromise = null;
                throw error;
            });

        return this._enginePromise;
    }

    public setCloudHybrid(enabled: boolean): void
    {
        this._engine()?.setCloudHybridMode(enabled);
        LocalStorageHelper.setBoolean(LocalStorageHelper.CLOUD_HYBRID_MODE, enabled); // adjust to your helper's API
    }

    public terminateEngine(): void 
    {
        this._engine()?.shutdown();
        this._engine.set(null);
    }
}