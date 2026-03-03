import { Injectable } from "@angular/core";
import IAppTheme from "./app-themes/i-app-theme";
import { Themes } from "./themes";
import LocalStorageHelper from "../chessboard/chessboard/local-storage-helper";
import WhiteBlueTheme from "./app-themes/white-blue-theme";
import BlackRedTheme from "./app-themes/black-red-theme";

@Injectable({ providedIn: 'root' })
export default class ThemeService 
{
    public static readonly DEFAULT_THEME = Themes.WhiteAndBlue;

    private _themeInstance: IAppTheme

    constructor()
    {
        const themeValue = LocalStorageHelper.getString(LocalStorageHelper.SELECTED_THEME, ThemeService.DEFAULT_THEME);

        this._themeInstance = this._createThemeInstance(themeValue);
    }

    private _createThemeInstance(val: string): IAppTheme
    {
        switch(val)
        {
            case Themes.WhiteAndBlue:
                return new WhiteBlueTheme();
            case Themes.BlackAndRed:
                return new BlackRedTheme();
        }

        return new WhiteBlueTheme();
    }

    getThemeInstance()
    {
        return this._themeInstance;
    }

    setTheme(val: string)
    {
        this._themeInstance = this._createThemeInstance(val);
    }
}