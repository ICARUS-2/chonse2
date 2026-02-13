import { ChessComGame } from "./chesscom-game";
export default class ChessComAPI
{
    public static BASE_API = ""

    private static _getBaseEndpointForUser(username: string)
    {
        return `https://api.chess.com/pub/player/${username}/games/archives`
    }

    static async getGamesForUser(username: string): Promise<ChessComGame[]>
    {
        const baseEndpoint = ChessComAPI._getBaseEndpointForUser(username);

        const archivesResponse = await fetch(baseEndpoint);
        const archivesData: {archives: Array<string>} = await archivesResponse.json() as {archives: Array<string>};
        const mostRecentGamesEndpoint = archivesData.archives[archivesData.archives.length - 1];

        const gameDataResponse = await fetch(mostRecentGamesEndpoint);
        const gameData: {games: Array<object>} = await gameDataResponse.json();

        const arr: Array<ChessComGame> = gameData.games.map( item => new ChessComGame(item) );

        return arr.reverse();
    }
}