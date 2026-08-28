import { Routes } from '@angular/router';
import { MenuComponent } from './features/menu/menu';
import { ClaimNotificationComponent } from './features/claim-notification/claim-notification';
import { ClaimRegistrationComponent } from './features/claim-registration/claim-registration';
import { EstDetailsComponent } from './features/est-details/est-details';
import { SettlementDetailsComponent } from './features/settlement-details/settlement-details';
import { ClaimListComponent } from './features/claim-list/claim-list';
import { ClaimNotificationListComponent } from './features/claim-notification-list/claim-notification-list';
import { PolicyAccountingEntryComponent } from './features/policy-accounting-entry/policy-accounting-entry';   // ADD

export const routes: Routes = [
  { path: '', component: MenuComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'claim-notification/:menuId', component: ClaimNotificationComponent },
  { path: 'claim-registration', component: ClaimRegistrationComponent },
  { path: 'est-details', component: EstDetailsComponent },
  { path: 'settlement-details', component: SettlementDetailsComponent },
  { path: 'claim-list/:classCode', component: ClaimListComponent },
  { path: 'claim-notification-list', component: ClaimNotificationListComponent },
  { path: 'policy-accounting-entry', component: PolicyAccountingEntryComponent }   // ADD
];