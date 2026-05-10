import {GlassPanelTheme, IAppTheme} from "./i-app-theme";

export default class BlackRedTheme implements IAppTheme
{
    getPrimaryColor(): string 
    {
        return "rgb(220,53,69)";
    }

    getHoverColor(): string 
    {
        return "rgb(187,45,59)"    
    }

    getBackgroundColor(): string 
    {
        return "black";
    }

    getBorderColor(): string
    {
        return "red";
    }

    getTextColor(): string 
    {
        return "white";
    }

    getChessboardLightColor(): string 
    {
        return "rgb(220,53,69)";
    }

    getChessboardDarkColor(): string 
    {
        return "rgb(75,75,75)";
    }
    
    getBackgroundImgUrl(): string 
    {
        return "img/backgrounds/dragon-bg.webp"
    }

    getGlassPanelTheme(): string 
    {
        return GlassPanelTheme.Dark;    
    }
}