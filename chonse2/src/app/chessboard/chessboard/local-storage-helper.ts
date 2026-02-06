export default class LocalStorageHelper
{
    static readonly CLICK_TO_MOVE = "Chonse2_ClickToMove";

    static getValue(key: string): string | null
    {
        return window.localStorage.getItem(key);
    }

    static setValue(key: string, value: string)
    {
        window.localStorage.setItem(key, value);
    }
}