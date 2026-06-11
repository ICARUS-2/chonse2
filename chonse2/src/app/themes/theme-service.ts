import { Injectable, signal } from "@angular/core";
import { IAppTheme } from "./app-themes/i-app-theme";
import { Themes } from "./themes";
import LocalStorageHelper from "../chessboard/chessboard/local-storage-helper";
import WhiteBlueTheme from "./app-themes/white-blue-theme";
import BlackRedTheme from "./app-themes/black-red-theme";
import GalacticTheme from "./app-themes/galactic-theme";

@Injectable({ providedIn: 'root' })
export default class ThemeService 
{
    public static readonly DEFAULT_THEME = Themes.WhiteAndBlue;

    private _themeInstance = signal<IAppTheme>(this._createThemeInstance(LocalStorageHelper.getString( LocalStorageHelper.SELECTED_THEME, ThemeService.DEFAULT_THEME )));

    private theme = this._themeInstance.asReadonly();

    constructor()
    {

    }

    private _createThemeInstance(val: string): IAppTheme
    {
        switch(val)
        {
            case Themes.WhiteAndBlue:
                return new WhiteBlueTheme();
            case Themes.BlackAndRed: 
                return new BlackRedTheme();
            case Themes.Galactic:
                return new GalacticTheme();
        }

        return new WhiteBlueTheme();
    }

    getThemeInstance()
    {
        return this.theme();
    }

    setTheme(val: string)
    {
        LocalStorageHelper.setString(LocalStorageHelper.SELECTED_THEME, val);

        this._themeInstance.set(this._createThemeInstance(val));
    }
}