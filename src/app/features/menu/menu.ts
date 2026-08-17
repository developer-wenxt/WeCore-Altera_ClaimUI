import { Component, OnInit, signal, ViewEncapsulation, ViewChild } from '@angular/core';
import { takeUntil, retry, take, shareReplay, finalize } from 'rxjs/operators';
import { timer } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { SessionService } from '../../core/services/session.service';
import { GlobalMessageService } from '../../core/services/GlobalMessageService';
import { Menu } from 'primeng/menu';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import { MenuItem, FieldConfig, ClaimMenuItem } from '../../core/models/model';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import { ClaimListComponent } from '../claim-list/claim-list';
import { ClaimNotificationListComponent } from '../claim-notification-list/claim-notification-list';

const SSO_ENABLED = false;   // flip to true once the other system starts passing ?token=

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [...SHARED_IMPORTS, ClaimListComponent, ClaimNotificationListComponent],
  templateUrl: './menu.html',
  styleUrls: ['./menu.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [UnSubscriber]
})
export class MenuComponent extends UnSubscriber implements OnInit {
  menuItems = signal<MenuItem[]>([]);
  loading = signal(true);
  error = signal(false);

  isloading = false;        // ADDED — SSO decode spinner
  ssoError: string | null = null;   // ADDED

  selectedItem: MenuItem | null = null;
  selectedCategory = signal<string>('');

  menuListClaim = signal<ClaimMenuItem[]>([]);
  searchTerm = '';

  actionMenuItems: PrimeMenuItem[] = [];
  expandedItemId = signal<string | null>(null);

  activeView = signal<'products' | 'empty' | 'claim-list' | 'claim-notification-list'>('products');
  activeClassCode = '';
  activeInstCode = '';
  expandedCategoryCode = signal<string | null>(null);

  @ViewChild('actionMenu') actionMenu!: Menu;

  constructor(
    private menuService: MenuService,
    private router: Router,
    private activatedRoute: ActivatedRoute,       // ADDED
    private sessionService: SessionService,       // ADDED
    private globalMessage: GlobalMessageService    // ADDED
  ) {
    super();
  }

  ngOnInit(): void {
    if (SSO_ENABLED) {
      this.handleSsoToken();
    } else {
      this.loadMenuData();
    }
  }

  // ADDED — full SSO handling, only runs when SSO_ENABLED = true
  private handleSsoToken(): void {
    this.activatedRoute.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        if (params['token']) {
          const originalToken = decodeURIComponent(params['token']).replace(/ /g, '+');
          const wecorePath = params['path'];
          this.sessionService.setToken(originalToken);
          this.sessionService.setWecorePath(wecorePath);

          this.isloading = true;
          this.menuService.decodeToken(originalToken)
            .pipe(
              retry({ count: 2, delay: (err, retryCount) => timer(1000 * retryCount) }),
              take(1),
              shareReplay(1),
              takeUntil(this.destroy$),
              finalize(() => { this.isloading = false; })
            )
            .subscribe({
              next: (data: any) => {
                this.sessionService.setUserDetails(data || {});
                if (this.sessionService.getUserDetails()) {
                  this.loadMenuData();
                }
              },
             error: (error) => {
  this.isloading = false;
  const msg = error?.error?.message || error?.message || 'Failed to decode token';
  this.ssoError = msg;
  this.globalMessage.show('error', 'Error', msg);
},
            });
        } else {
          if (this.sessionService.getToken()) {
            this.loadMenuData();
          } else {
  const msg = 'missing token';
  this.ssoError = msg;
  this.globalMessage.show('error', 'Error', msg);
}
        }
      });
  }

  private loadMenuData(): void {
    this.menuService.getMenuList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const sorted = [...res].sort((a, b) =>
            Number(a.CLASS_CODE) - Number(b.CLASS_CODE)
          );
          this.menuItems.set(sorted);
          if (sorted.length > 0) {
            this.selectedCategory.set(sorted[0].CLASS_CODE);
          }
          this.loading.set(false);
        },
        error: () => {
          this.error.set(true);
          this.loading.set(false);
        }
      });

    this.menuService.getMenuListClaim()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.menuListClaim.set(res);
          console.log('menuListClaim loaded:', res);
        },
        error: (err) => console.error('Error loading menuListClaim', err)
      });
  }

  get categories() {
    const items = this.menuItems();
    const map = new Map<string, { code: string; desc: string; count: number }>();
    for (const item of items) {
      if (!map.has(item.CLASS_CODE)) {
        map.set(item.CLASS_CODE, { code: item.CLASS_CODE, desc: item.CLASS_DESC, count: 0 });
      }
      map.get(item.CLASS_CODE)!.count++;
    }
    return Array.from(map.values());
  }

  get filteredItems() {
    let items = this.menuItems().filter(i => i.CLASS_CODE === this.selectedCategory());
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      items = items.filter(i => i.CLM_INTM_MENU_NAME.toLowerCase().includes(term));
    }
    return items;
  }

  selectCategory(code: string): void {
    this.selectedCategory.set(code);
    this.searchTerm = '';
    this.activeView.set('products');
  }

  onCategoryHover(cat: { code: string; desc: string; count: number }, event: MouseEvent): void {
    this.activeView.set('empty');

    this.actionMenuItems = [
      {
        label: 'Claim Notification',
        icon: 'pi pi-bell',
        command: () => this.switchView('claim-notification-list')
      },
      {
        label: 'Claim Registration',
        icon: 'pi pi-file-edit',
        command: () => {
          this.activeClassCode = cat.code;
          this.switchView('claim-list');
        }
      }
    ];

    this.actionMenu.toggle(event);
  }

  switchView(view: 'claim-list' | 'claim-notification-list'): void {
    this.activeView.set(view);
  }

  backToProducts(): void {
    this.activeView.set('products');
  }

  onCategoryClick(cat: { code: string; desc: string; count: number }): void {
    this.selectedCategory.set(cat.code);
    this.searchTerm = '';
    this.activeView.set('products');

    this.expandedCategoryCode.set(this.expandedCategoryCode() === cat.code ? null : cat.code);
  }

  onRegistrationClick(cat: { code: string; desc: string; count: number }): void {
    this.activeClassCode = cat.code;

    const match = this.menuItems().find(i => i.CLASS_CODE === cat.code);
    this.activeInstCode = match ? match.CLM_INTM_INST_CODE : '';

    const claimMatch = this.menuListClaim().find(i => i.CLASS_CODE === cat.code);

    sessionStorage.setItem('claimClassCode', cat.code);
    sessionStorage.setItem('claimClassDesc', cat.desc || '');
    sessionStorage.setItem('claimIntmDsCode', claimMatch ? claimMatch.CLM_DS_CODE : '');

    this.switchView('claim-list');
  }

  onProductSelect(item: MenuItem): void {
    this.selectedItem = item;
  }

  onNotificationClick(cat: { code: string; desc: string; count: number }): void {
    const match = this.menuItems().find(i => i.CLASS_CODE === cat.code);
    this.selectedItem = match ? match : null;

    if (!this.selectedItem) {
      console.error('No matching menu item found for this category');
      return;
    }

    sessionStorage.setItem('claimMenuId', String(this.selectedItem.MENU_ID));
    sessionStorage.setItem('claimClassCode', this.selectedItem.CLASS_CODE || '');
    sessionStorage.setItem('claimClassDesc', this.selectedItem.CLASS_DESC || '');

    this.switchView('claim-notification-list');
  }

  getMenuIcon(menuName: string): string {
    const iconMap: Record<string, string> = {
      'Aviation': 'pi pi-send',
      'Bond': 'pi pi-shield',
      'Engineering': 'pi pi-wrench',
      'Fire': 'pi pi-bolt',
      'General Accident': 'pi pi-exclamation-triangle',
      'Liability': 'pi pi-verified',
      'Marine Cargo': 'pi pi-box',
      'Marine Hull': 'pi pi-compass',
      'Motor': 'pi pi-car',
      'Oil & Gas': 'pi pi-database',
      'Package': 'pi pi-th-large'
    };
    return iconMap[menuName] || 'pi pi-briefcase';
  }

  getCategoryIcon(classDesc: string): string {
    const iconMap: Record<string, string> = {
      'Aviation': 'pi pi-send',
      'Bonds': 'pi pi-shield',
      'Engineering': 'pi pi-wrench',
      'Fire': 'pi pi-bolt',
      'General Accident': 'pi pi-exclamation-triangle',
      'Liability': 'pi pi-verified',
      'Marine': 'pi pi-compass',
      'Motor': 'pi pi-car',
      'Package': 'pi pi-th-large'
    };
    return iconMap[classDesc] || 'pi pi-briefcase';
  }
}