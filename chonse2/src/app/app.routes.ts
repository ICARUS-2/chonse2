import { Routes } from '@angular/router';
import { Homepage } from './homepage/homepage';
import { Settings } from './settings/settings';

export const routes: Routes = [
    {path: "", component: Homepage},
    {path: "settings", component: Settings}
];
