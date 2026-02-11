export default class LocalStorageHelper
{
    static readonly CLICK_TO_MOVE = "Chonse2_ClickToMove";
    static readonly SAVED_USERNAMES = "Chonse2_SavedUsernames";

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
}