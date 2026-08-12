import { Routes } from '@angular/router';

// Feature components are lazy-loaded so they land in their own chunks instead of
// the initial bundle — see the `initial` budget in angular.json.
export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/menu/menu').then(m => m.MenuComponent)
  },
  {
    path: 'menu',
    loadComponent: () => import('./features/menu/menu').then(m => m.MenuComponent)
  },
  {
    path: 'claim-notification/:menuId',
    loadComponent: () => import('./features/claim-notification/claim-notification').then(m => m.ClaimNotificationComponent)
  },
  {
    path: 'claim-registration',
    loadComponent: () => import('./features/claim-registration/claim-registration').then(m => m.ClaimRegistrationComponent)
  },
  {
    path: 'risk-details',
    loadComponent: () => import('./features/risk-details/risk-details').then(m => m.RiskDetailsComponent)
  },
  {
    path: 'est-details',
    loadComponent: () => import('./features/est-details/est-details').then(m => m.EstDetailsComponent)
  },
  {
    path: 'settlement-details',
    loadComponent: () => import('./features/settlement-details/settlement-details').then(m => m.SettlementDetailsComponent)
  },
  {
    path: 'claim-list/:classCode',
    loadComponent: () => import('./features/claim-list/claim-list').then(m => m.ClaimListComponent)
  },
  {
    path: 'claim-notification-list',
    loadComponent: () => import('./features/claim-notification-list/claim-notification-list').then(m => m.ClaimNotificationListComponent)
  }
];
