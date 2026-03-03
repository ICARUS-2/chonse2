import IAppTheme from "./i-app-theme";

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
        return "black";
    }
    
}