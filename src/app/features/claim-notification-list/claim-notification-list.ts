import { Component, OnInit, signal, Output, EventEmitter,Input } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import { MenuItem } from '../../core/models/model';

@Component({
  selector: 'app-claim-notification-list',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './claim-notification-list.html',
  styleUrls: ['./claim-notification-list.scss'],
  providers: [UnSubscriber]
})
export class ClaimNotificationListComponent extends UnSubscriber implements OnInit {
    @Input() menuItem: MenuItem | null = null;
  @Output() back = new EventEmitter<void>();  

  allRecords = signal<any[]>([]);
  loading = signal(true);
  searchTerm = '';

   activeClassCode: string = '';

  constructor(
    private menuService: MenuService,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
     this.activeClassCode = this.menuItem?.CLASS_CODE || sessionStorage.getItem('claimClassCode') || '';
    this.menuService.getClaimIntimationList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
  const updatedRes = res.map((item: any) => {
   const parts = item.CI_POL_NO?.split('-') || [];

    return {
      ...item,
      CLASS_CODE: parts[3] || '',
      PRODUCT_CODE: parts[4] || ''
    };
  });

  this.allRecords.set(updatedRes);
  this.loading.set(false);
},
        error: (err) => {
          console.error('Error loading claim intimation list:', err);
          this.loading.set(false);
        }
      });
  }

  get filteredRecords() {
    let result = this.allRecords();
    if (this.activeClassCode) {
      result = result.filter(c => c.CLASS_CODE === this.activeClassCode);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        c.CI_ASSR_NAME?.toLowerCase().includes(term) ||
        c.CI_POL_NO?.toLowerCase().includes(term) ||
        c.CI_INTM_NO?.toLowerCase().includes(term)
      );
    }
    return result;
  }

onViewRecord(record: any): void {
  this.router.navigate(
    ['/claim-notification', record.CI_INTM_NO],
    { queryParams: { mode: 'view', intmNo: record.CI_INTM_NO } }
  );
}

 onAddNotification(): void {
  const menuId = this.menuItem?.MENU_ID || sessionStorage.getItem('claimMenuId');

  if (!menuId) {
    console.error('MENU_ID missing from menuItem');
    return;
  }

  const classCode = this.menuItem?.CLASS_CODE || sessionStorage.getItem('claimClassCode') || '';
  sessionStorage.setItem('claimClassCode', classCode);
    sessionStorage.setItem('claimDsCode', this.menuItem?.CLM_INTM_DS_CODE || sessionStorage.getItem('claimDsCode') || '');  // ADDED

  this.router.navigate(['/claim-notification', menuId]);
}

onEditRecord(record: any): void {
  sessionStorage.setItem('claimClassCode', this.menuItem?.CLASS_CODE || record.CLASS_CODE || '');
    sessionStorage.setItem('claimDsCode', this.menuItem?.CLM_INTM_DS_CODE || sessionStorage.getItem('claimDsCode') || '');  // ADDED

  this.router.navigate(['/claim-notification', record.CI_INTM_NO], {
    queryParams: { mode: 'edit', intmNo: record.CI_INTM_NO }
  });
}

 goBack(): void {
  this.router.navigate(['/']);
}
}