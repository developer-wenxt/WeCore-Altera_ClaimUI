import { Routes } from '@angular/router';
import { MenuComponent } from './features/menu/menu';
import { ClaimNotificationComponent } from './features/claim-notification/claim-notification';
import { ClaimRegistrationComponent } from './features/claim-registration/claim-registration';
import { RiskDetailsComponent } from './features/risk-details/risk-details';
import { EstDetailsComponent } from './features/est-details/est-details';
import { SettlementDetailsComponent } from './features/settlement-details/settlement-details';
import { ClaimListComponent } from './features/claim-list/claim-list';
import { ClaimNotificationListComponent } from './features/claim-notification-list/claim-notification-list';



export const routes: Routes = [
  { path: '', component: MenuComponent },
  { path: 'menu', component: MenuComponent },
  { path: 'claim-notification/:menuId', component: ClaimNotificationComponent },
  { path: 'claim-registration', component: ClaimRegistrationComponent },
  { path: 'risk-details', component: RiskDetailsComponent },
  { path: 'est-details', component: EstDetailsComponent },
  { path: 'settlement-details', component: SettlementDetailsComponent },
  { path: 'claim-list/:classCode', component: ClaimListComponent },
  { path: 'claim-notification-list', component: ClaimNotificationListComponent }
];