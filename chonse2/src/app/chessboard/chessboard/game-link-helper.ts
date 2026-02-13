import { BASE_PATH } from "../../../helpers/globals";

export default class GameLinkHelper
{
    static readonly CHESSCOM_SOURCE = "chesscom";

    static generateGameUrl(site: string, gameId: string, username: string): string
    {
        const ORIG: string = window.location.origin;

        //return `${ORIG}${BASE_PATH}/?gameId=${gameId}&username=${username}&site=${site}`;
        return `${ORIG}${BASE_PATH}/game/${site}/${username}/${gameId}`
    }
}