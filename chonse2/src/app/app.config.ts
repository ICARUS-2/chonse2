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
import { NotificationService } from './ui/notifications/notification-service';
import { LegacyToastrNotificationService } from './ui/notifications/legacy-toastr-notification-service';

export const appConfig: ApplicationConfig = {
  providers: [
    //Error handling
    provideBrowserGlobalErrorListeners(),

    //Change detection
    provideZonelessChangeDetection(),
    
    //Navigation
    provideRouter(routes),

    //Charts (eval graph)
    provideCharts(withDefaultRegisterables()),
    
    //Notifications
    { provide: NotificationService, useClass: LegacyToastrNotificationService },
    provideToastr({progressBar: true, closeButton: true, positionClass: "toast-bottom-left", timeOut: 2000}),

    //For translation
    provideHttpClient(),
    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: 'i18n/',
        suffix: '.json'
      }),
      fallbackLang: Languages.English,
      lang: LocalStorageHelper.getString(LocalStorageHelper.LANGUAGE, DEFAULT_LANG)
    })
  ]
};
