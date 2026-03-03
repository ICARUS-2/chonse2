import IAppTheme from "./i-app-theme";

export default class WhiteBlueTheme implements IAppTheme
{
    getPrimaryColor(): string 
    {
        return "rgb(13,110,253)"
    }

    getHoverColor(): string 
    {
        return "rgb(11,94,215)"
    }

    getBackgroundColor(): string 
    {
        return "white";
    }

    getBorderColor(): string 
    {
        return "blue";
    }

    getTextColor(): string 
    {
        return "white";
    }

    getChessboardLightColor(): string 
    {
        return "white";
    }

    getChessboardDarkColor(): string 
    {
        return "rgb(85,150,242)";
    }
    
}