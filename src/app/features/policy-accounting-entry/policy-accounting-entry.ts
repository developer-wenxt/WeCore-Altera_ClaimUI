import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { SHARED_IMPORTS } from '../../core/shared/shared';

@Component({
  selector: 'app-policy-accounting-entry',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './policy-accounting-entry.html',
  styleUrls: ['./policy-accounting-entry.scss'],
  providers: [UnSubscriber]
})
export class PolicyAccountingEntryComponent extends UnSubscriber implements OnInit {
  loading = signal(true);
  masterRows = signal<any[]>([]);
  detailRows = signal<any[]>([]);
  selectedPolNo: string = '';
  clmSysId: number | null = null;

  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    super();
  }

  ngOnInit(): void {
    this.clmSysId = Number(this.route.snapshot.queryParamMap.get('clmSysId')) || null;

    if (!this.clmSysId) {
      this.loading.set(false);
      return;
    }

    this.menuService.getPolicyAccountingEntries(this.clmSysId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rows) => {
          this.masterRows.set(rows || []);
          if (rows?.length) {
            this.viewDetails(rows[0]);
          }
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading accounting entries', err);
          this.loading.set(false);
        }
      });
  }

  viewDetails(row: any): void {
    this.selectedPolNo = row.AD_POL_NO || '';
    this.detailRows.set(row.details || []);
  }

  goBack(): void {
    this.router.navigate(['/claim-registration'], {
      queryParams: { mode: 'edit', sysId: this.clmSysId }
    });
  }

}