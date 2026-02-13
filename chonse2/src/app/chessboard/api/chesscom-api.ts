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
        try 
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
        catch(ex)
        {
            //return empty arr.
        }

        return [];
    }

    static async getUserGameById(username: string, gameId: string): Promise<ChessComGame | undefined>
    {
        const games = await this.getGamesForUser(username);

        const filtered = games.filter(g => g.url.includes(gameId));

        if (filtered[0])
        {
            return filtered[0];
        }

        return undefined;
    }
}