import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { BASE_PATH } from "../../../globals/globals";

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
        const compressionResult = GameLinkHelper.compressStringForUrl(pgn.trim());

        return `${ORIG}${BASE_PATH}/pgn/${compressionResult}`;
    }

    static generateFenLink(fen: string)
    {
        const ORIG: string = window.location.origin;
        const compressionResult = GameLinkHelper.compressStringForUrl(fen.trim());
        return `${ORIG}${BASE_PATH}/fen/${compressionResult}`;
    }

    static compressStringForUrl(str: string) : string
    {
        return compressToEncodedURIComponent(str);    
    }

    static decompressStringForUrl(lzstr: string) : string 
    {
        return decompressFromEncodedURIComponent(lzstr);
    }
}