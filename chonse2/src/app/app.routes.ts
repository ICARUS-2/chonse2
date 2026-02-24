import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { Settings } from './settings/settings';
import { LoadGame } from './load-game/load-game';
import { InputPosition } from './input-position/input-position';

export enum RouteConstants {
    ROUTE_SITE = "site",
    ROUTE_USERNAME = "username",
    ROUTE_GAMEID = "gameId",
    ROUTE_INPUTTED_POSITION = "inputtedPosition"
}

export const routes: Routes = [
    {path: "", component: Homepage},
    {path: "settings", component: Settings},
    {path: "input-position", component: InputPosition},
    {path: `game/:${RouteConstants.ROUTE_SITE}/:${RouteConstants.ROUTE_USERNAME}/:${RouteConstants.ROUTE_GAMEID}`, component: LoadGame}
];
