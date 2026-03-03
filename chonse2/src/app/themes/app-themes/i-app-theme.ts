export default interface IAppTheme
{
    getPrimaryColor(): string;
    getHoverColor(): string;
    getBackgroundColor(): string;
    getTextColor(): string;

    getChessboardLightColor(): string
    getChessboardDarkColor(): string
}