import { GlassPanelTheme, IAppTheme } from "./i-app-theme";

export default class FrutigerAeroTheme implements IAppTheme
{
    getPrimaryColor(): string 
    {
        return "blue"
    }

    getHoverColor(): string 
    {
        return "rgb(0,0,200)"
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
    
    getBackgroundImgUrl(): string 
    {
        return "img/backgrounds/frutiger-aero-bg.webp"
    }

    getGlassPanelTheme(): string 
    {
        return GlassPanelTheme.Dark;   
    }
}