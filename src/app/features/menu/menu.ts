import { Component, OnInit, signal, ViewEncapsulation, ViewChild } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { Menu } from 'primeng/menu';
import { MenuItem as PrimeMenuItem } from 'primeng/api';
import { MenuItem, FieldConfig } from '../../core/models/model';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import { Router } from '@angular/router';
import { ClaimListComponent } from '../claim-list/claim-list';
import { ClaimNotificationListComponent } from '../claim-notification-list/claim-notification-list';

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

  selectedItem: MenuItem | null = null;
  selectedCategory = signal<string>('');
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
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
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
    this.activeView.set('products');   // reset to grid when switching category
  }

  // CHANGED — now triggered by hovering a sidebar category, not a product card
  onCategoryHover(cat: { code: string; desc: string; count: number }, event: MouseEvent): void {
    this.activeView.set('empty');   // clear right side immediately


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

    this.switchView('claim-notification-list');
  }

  /** Returns a PrimeNG icon class based on the product menu name (A-Z sorted) */
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

  /** Returns a PrimeNG icon class for sidebar categories based on CLASS_DESC */
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