import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { Settings } from './settings/settings';
import { LoadGame } from './load-game/load-game';

export enum RouteConstants {
    ROUTE_SITE = "site",
    ROUTE_USERNAME = "username",
    ROUTE_GAMEID = "gameId",
}

export const routes: Routes = [
    {path: "", component: Homepage},
    {path: "settings", component: Settings},
    {path: `game/:${RouteConstants.ROUTE_SITE}/:${RouteConstants.ROUTE_USERNAME}/:${RouteConstants.ROUTE_GAMEID}`, component: LoadGame}
];
