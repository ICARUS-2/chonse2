export default class LocalStorageHelper
{
    //Settings
    static readonly CLICK_TO_MOVE = "Chonse2_ClickToMove";
    static readonly PIECE_ANIMATIONS = "Chonse2_PieceAnimations";
    static readonly CHESS_PIECES = "Chonse2_ChessPieces";
    static readonly SAVED_USERNAMES = "Chonse2_SavedUsernames";
    static readonly SAVED_LICHESS_USERNAMES = "Chonse2_SavedLichessUsernames";
    static readonly SELECTED_ENGINE = "Chonse2_SelectedEngine";
    static readonly ENGINE_DEPTH = "Chonse2_EngineDepth";
    static readonly CLOUD_HYBRID_MODE = "Chonse2_CloudHybridMode";
    static readonly ENGINE_THREAD_COUNT = "Chonse2_ThreadCount";
    static readonly SELECTED_THEME = "Chonse2_SelectedTheme";

    //homepage
    static readonly LAST_PGN = "Chonse2_LastPgn"

    //database
    static readonly DATABASE = "Chonse2_Database";

    //lang
    static readonly LANGUAGE = "Chonse2_Language";

    //bool
    static getBoolean(key: string, defaultVal = false): boolean
    {
        const returnVal = window.localStorage.getItem(key);
        
        if (!returnVal)
        {
            LocalStorageHelper.setBoolean(key, defaultVal);
            return defaultVal;
        }

        return returnVal === "true";
    }

    static setBoolean(key: string, value: boolean)
    {
        window.localStorage.setItem(key, value.toString());
    }
    
    //str arr
    static getStringArray(key: string, defaultVal = []): Array<string> 
    {
        const returnVal = window.localStorage.getItem(key);

        if (!returnVal)
        {
            LocalStorageHelper.setStringArray(key, defaultVal);
            return defaultVal;
        }

        return JSON.parse(returnVal);
    }

    static setStringArray(key: string, value: Array<string>): void
    {
        window.localStorage.setItem(key, JSON.stringify(value));
    }

    //str
    static getString(key: string, defaultVal = ""): string 
    {
        const returnVal = window.localStorage.getItem(key);

        if (!returnVal)
        {
            LocalStorageHelper.setString(key, defaultVal);
            return defaultVal;
        }

        return returnVal;
    }

    static setString(key: string, value: string): void
    {
        window.localStorage.setItem(key, value);
    }

    //number
    static getNumber(key: string, defaultVal = 0): number 
    {
        const returnVal = window.localStorage.getItem(key);

        if (!returnVal)
        {
            LocalStorageHelper.setString(key, defaultVal.toString());
            return defaultVal;
        }

        return Number(returnVal);
    }

    static setNumber(key: string, value: number): void
    {
        window.localStorage.setItem(key, value.toString());
    }
}