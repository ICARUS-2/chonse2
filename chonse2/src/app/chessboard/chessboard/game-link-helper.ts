import { BASE_PATH } from "../../../globals/globals";
import { compressPgn } from "./pgn-misc";

export default class GameLinkHelper
{
    static readonly CHESSCOM_SOURCE = "chesscom";
    static readonly LICHESS_SOURCE = "lichess"

    static generateChessSiteGameUrl(site: string, gameId: string, username: string): string
    {
        const ORIG: string = window.location.origin;

        return `${ORIG}${BASE_PATH}/game/${site}/${username}/${gameId}`
    }

    static generatePgnGameLink(pgn: string)
    {
        const ORIG: string = window.location.origin;
        const compressionResult = compressPgn(pgn.trim());

        return `${ORIG}${BASE_PATH}/pgn/${compressionResult}`;
    }
}