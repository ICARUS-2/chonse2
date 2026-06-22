import { GlassPanelTheme, IAppTheme } from "./i-app-theme";

export default class GalacticTheme implements IAppTheme
{
    getPrimaryColor(): string 
    {
        return "fuchsia";
    }

    getHoverColor(): string 
    {
        return "rgb(153, 0, 255)";
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
        return "rgb(128, 0, 255)";
    }
    
    getBackgroundImgUrl(): string 
    {
        return "img/backgrounds/galactic-bg.webp"
    }

    getGlassPanelTheme(): string 
    {
        return GlassPanelTheme.Dark;   
    }
}