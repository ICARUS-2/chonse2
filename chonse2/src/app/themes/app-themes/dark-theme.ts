import { GlassPanelTheme, IAppTheme } from "./i-app-theme";

export default class DarkTheme implements IAppTheme
{
    getPrimaryColor(): string 
    {
        return "gray"
    }

    getHoverColor(): string 
    {
        return "darkgray"
    }

    getBackgroundColor(): string 
    {
        return "black";
    }

    getBorderColor(): string 
    {
        return "gray";
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
        return "gray";
    }
    
    getBackgroundImgUrl(): string 
    {
        return "img/backgrounds/dark-bg.webp"
    }

    getGlassPanelTheme(): string 
    {
        return GlassPanelTheme.Dark;   
    }
}