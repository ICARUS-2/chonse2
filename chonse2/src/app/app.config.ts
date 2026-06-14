import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideToastr } from 'ngx-toastr';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { provideTranslateService } from "@ngx-translate/core";
import { provideHttpClient } from "@angular/common/http";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";
import { DEFAULT_LANG, Languages } from '../globals/globals';
import LocalStorageHelper from '../libs/local-storage-helper';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideToastr({progressBar: true, closeButton: true, positionClass: "toast-bottom-left", timeOut: 2000}),
    provideCharts(withDefaultRegisterables()),
    
    provideHttpClient(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json'
      }),
      fallbackLang: Languages.English,
      lang: LocalStorageHelper.getString(LocalStorageHelper.LANGUAGE, DEFAULT_LANG)
    })
  ]
};
