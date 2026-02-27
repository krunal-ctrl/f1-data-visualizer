import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { cacheInterceptor } from './core/interceptors/cache.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { provideAnimations  } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { f1Reducer } from './core/store/f1.reducer';
import { F1Effects } from './core/store/f1.effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { isDevMode } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([cacheInterceptor, errorInterceptor])),
    provideAnimations(),
    provideStore({ f1: f1Reducer }),
    provideEffects(F1Effects),
    provideStoreDevtools({ maxAge: 25, logOnly: !isDevMode() })
  ]
};
