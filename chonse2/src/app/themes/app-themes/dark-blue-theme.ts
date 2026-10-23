import { GlassPanelTheme, IAppTheme } from "./i-app-theme";

export default class DarkBlueTheme implements IAppTheme
{
    getPrimaryColor(): string 
    {
        return "blue"
    }

    getHoverColor(): string 
    {
        return "darkblue"
    }

    getBackgroundColor(): string 
    {
        return "black";
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
        return "skyblue";
    }

    getChessboardDarkColor(): string 
    {
        return "blue";
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