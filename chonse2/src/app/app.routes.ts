import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { Settings } from './settings/settings';
import { LoadGame } from './load-game/load-game';
import { InputPosition } from './input-position/input-position';
import { VsAi } from './vs-ai/vs-ai';

export enum RouteConstants {
    ROUTE_SITE = "site",
    ROUTE_USERNAME = "username",
    ROUTE_GAMEID = "gameId",
    
    ROUTE_INPUTTED_POSITION = "inputtedPosition",

    ROUTE_VSAI_STATES = "vsAiStates",
    ROUTE_VSAI_MOVES = "vsAiMoves",
    ROUTE_VSAI_GAMESTATES = "vsAiGameStates"
}

export const routes: Routes = [
    {path: "", component: Homepage},
    {path: "settings", component: Settings},
    {path: "input-position", component: InputPosition},
    {path: `game/:${RouteConstants.ROUTE_SITE}/:${RouteConstants.ROUTE_USERNAME}/:${RouteConstants.ROUTE_GAMEID}`, component: LoadGame},
    {path: `vs-ai`, component: VsAi}
];
