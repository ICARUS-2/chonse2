export default class LocalStorageHelper
{
    static readonly CLICK_TO_MOVE = "Chonse2_ClickToMove";

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
}