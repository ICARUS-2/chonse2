/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { AppInjector } from './app/app-injector';

bootstrapApplication(App, appConfig)
  .then(appRef => {
    AppInjector.injector = appRef.injector;
  })
  .catch((err) => console.error(err));
