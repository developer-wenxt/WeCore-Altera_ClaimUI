import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';   // ADD
import { authInterceptor } from './core/interceptor/authinterceptor';
import { globalErrorInterceptor } from './core/interceptor/global-error.interceptor';
import { loadingInterceptor } from './core/interceptor/loading.interceptor';
import { MessageService } from 'primeng/api';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

// ADD — custom preset extending Aura with your blue table header
const MyPreset = definePreset(Aura, {
  components: {
    datatable: {
      headerCell: { 
        background: '#2563eb',
        color: '#ffffff',
        hoverBackground: '#1e40af',
        hoverColor: '#ffffff'
      },
      header: {
        background: '#2563eb',
        color: '#ffffff'
      }
    },
    button: {                        
      root: {
        primary: {
          background: '#2563eb',
          hoverBackground: '#1e40af',
          activeBackground: '#1e40af',
          borderColor: '#2563eb',
          hoverBorderColor: '#1e40af',
          color: '#ffffff'
        }
      }
    }

  }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor, globalErrorInterceptor])),
    MessageService,
    providePrimeNG({
      theme: {
        preset: MyPreset,      
        options: {
          darkModeSelector: false
        }
      }
    }),
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes)
  ]
};