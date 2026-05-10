import { Routes } from '@angular/router';
import { AnalysisPage } from './analysis-page/analysis-page';
import { Settings } from './settings/settings';
import { LoadGame } from './load-game/load-game';
import { InputPosition } from './input-position/input-position';
import { VsAi } from './vs-ai/vs-ai';
import { PgnLink } from './pgn-link/pgn-link';
import { LoadPgn } from './load-pgn/load-pgn';
import { Homepage } from './homepage/homepage';

export enum RouteConstants {
    ROUTE_SITE = "site",
    ROUTE_USERNAME = "username",
    ROUTE_GAMEID = "gameId",

    ROUTE_PGN = "pgn",
    
    ROUTE_INPUTTED_POSITION = "inputtedPosition",

    ROUTE_VSAI_STATES = "vsAiStates",
    ROUTE_VSAI_MOVES = "vsAiMoves",
    ROUTE_VSAI_GAMESTATES = "vsAiGameStates",
    ROUTE_VSAI_PGNHEADERS = "vsAiPgnHeaders"
}

export const routes: Routes = [
    //pages
    {path: "", component: Homepage},
    {path: "analysis", component: AnalysisPage},
    {path: "settings", component: Settings},
    {path: "editor", component: InputPosition},
    {path: `vs-ai`, component: VsAi},
    {path: "pgn-link", component: PgnLink},

    //redirects
    {path: `game/:${RouteConstants.ROUTE_SITE}/:${RouteConstants.ROUTE_USERNAME}/:${RouteConstants.ROUTE_GAMEID}`, component: LoadGame},
    {path: `pgn/:${RouteConstants.ROUTE_PGN}`, component: LoadPgn}
];
