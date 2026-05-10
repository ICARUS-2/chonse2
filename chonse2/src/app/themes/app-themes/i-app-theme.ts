export interface IAppTheme
{
    getPrimaryColor(): string;
    getHoverColor(): string;
    getBackgroundColor(): string;
    getTextColor(): string;
    getBorderColor(): string;

    getChessboardLightColor(): string
    getChessboardDarkColor(): string

    getBackgroundImgUrl(): string
    getGlassPanelTheme(): string
}

export enum GlassPanelTheme 
{
    Light = "glass-subpanel-light",
    Dark = "glass-subpanel-dark",
}