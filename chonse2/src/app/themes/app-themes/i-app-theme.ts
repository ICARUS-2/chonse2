export default interface IAppTheme
{
    getPrimaryColor(): string;
    getHoverColor(): string;
    getBackgroundColor(): string;
    getTextColor(): string;
    getBorderColor(): string;

    getChessboardLightColor(): string
    getChessboardDarkColor(): string
}