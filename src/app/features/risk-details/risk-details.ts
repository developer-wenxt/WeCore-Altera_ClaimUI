import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { FieldConfig } from '../../core/models/model';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import { getTableColumnFields, isFieldEditable } from '../../core/utils/field-filter.util';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-risk-details',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './risk-details.html',
  styleUrls: ['./risk-details.scss'],
  providers: [UnSubscriber]
})
export class RiskDetailsComponent extends UnSubscriber implements OnInit {
  tableColumns = signal<FieldConfig[]>([]);   // renamed for clarity — these are COLUMN DEFINITIONS
  gridRows = signal<any[]>([{}]);              // actual data rows (start with 1 blank row)
  loading = signal(true);
  isFieldEditable = isFieldEditable;
  rowMenuItems: MenuItem[] = [];
  activeRowIndex: number | null = null;
  clmSysId: number | null = null;


  constructor(private menuService: MenuService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {

    this.clmSysId = Number(this.route.snapshot.queryParamMap.get('sysId')) ||
      Number(sessionStorage.getItem('claimSysId')) || null;
    this.menuService.getRiskDetailFields()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields) => {
          const filtered = getTableColumnFields(fields);
          this.tableColumns.set(filtered);
          this.loading.set(false);
          this.loadRiskRows();
        },
        error: (err) => {
          console.error('Error loading risk detail fields:', err);
          this.loading.set(false);
        }
      });

    this.rowMenuItems = [
      { label: 'Est Details', icon: 'pi pi-file', command: () => this.onEstDetailsClick() },
      { label: 'Settlement Details', icon: 'pi pi-wallet', command: () => this.onSettlementDetailsClick() }
    ];
  }

  private loadRiskRows(): void {
    if (!this.clmSysId) {
      this.loading.set(false);
      return;
    }

    this.menuService.getRiskDetailsByClaim(this.clmSysId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const dataObj = res?.data?.data || {};
          const sortedKeys = Object.keys(dataObj).sort((a, b) => Number(a) - Number(b));

          const rows: any[] = [];
          sortedKeys.forEach(key => {
            dataObj[key].forEach((entry: any) => rows.push(entry));
          });

          this.gridRows.set(rows.length ? rows : [{}]);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading risk detail rows:', err);
          this.loading.set(false);
        }
      });
  }



  addRow(): void {
    this.gridRows.update(rows => [...rows, {}]);
  }


  openRowMenu(event: Event, menu: any, index: number): void {
    this.activeRowIndex = index;
    menu.toggle(event);
  }

  goBack(): void {
    this.router.navigate(['/claim-registration'], {
      queryParams: { mode: 'edit', sysId: this.clmSysId }
    });
  }



  onEstDetailsClick(): void {
    const rows = this.gridRows();
    const index = this.activeRowIndex;
    const clmapSysId = index !== null ? rows[index]?.CLMAP_SYS_ID : null;

    this.router.navigate(['/est-details'], {
      queryParams: { clmapSysId, sysId: this.clmSysId }
    });
  }


  saveRow(index: number): void {
    const row = this.gridRows()[index];
    this.menuService.updateRiskDetail(row)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Row saved successfully'),
        error: (err) => console.error('Error saving risk detail row', err)
      });
  }

  onSettlementDetailsClick(): void {
    this.router.navigate(['/settlement-details'], {
      queryParams: { sysId: this.clmSysId }
    });
  }
}