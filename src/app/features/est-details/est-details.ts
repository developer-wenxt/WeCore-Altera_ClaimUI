import { Component, OnInit, signal } from '@angular/core';
import { GlobalMessageService } from '../../core/services/GlobalMessageService';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { FieldConfig } from '../../core/models/model';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import { getEstDetailColumns, getInputType, isFieldEditable } from '../../core/utils/field-filter.util';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-est-details',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './est-details.html',
  styleUrls: ['./est-details.scss'],
  providers: [UnSubscriber]
})
export class EstDetailsComponent extends UnSubscriber implements OnInit {
  tableColumns = signal<FieldConfig[]>([]);
  gridRows = signal<any[]>([{}]);
  loading = signal(true);
  isFieldEditable = isFieldEditable;
  getInputType = getInputType;
  showMoreDialog = signal(false);
  activeRowIndex = signal<number | null>(null);
  isViewMode: boolean = false;
  activeEstRowIndex: number | null = null;
  estRowMenuItems: MenuItem[] = [];

  trackByIndex(index: number, item: any): number { return index; }
  trackByColName(index: number, col: any): string | number { return col?.COLUMN_NAME || index; }


  lovMap = signal<{ [fieldName: string]: any }>({});
  dropdownOptionsMap = signal<{ [fieldName: string]: any[] }>({});

  polSysId: number | null = null;   // ADD
  endIdx: number = 0;               

  

  clmapSysId: number | null = null;
  clmSysId: number | null = null;
  crUid: string = 'ADMIN';

  prodCode: string = '';
  polNo: string = '';
  classDesc: string = '';

  constructor(private menuService: MenuService,
    private router: Router,
    private route: ActivatedRoute,
    private msgService: GlobalMessageService
  ) {
    super();
  }

  ngOnInit(): void {
    
    this.clmapSysId = Number(this.route.snapshot.queryParamMap.get('clmapSysId')) || null;
    this.clmSysId = Number(this.route.snapshot.queryParamMap.get('sysId')) || null;
    this.polSysId = Number(this.route.snapshot.queryParamMap.get('polSysId')) || null;
    this.endIdx = Number(this.route.snapshot.queryParamMap.get('endIdx')) || 0;
    this.crUid = this.route.snapshot.queryParamMap.get('crUid') || 'ADMIN';
    const mode = this.route.snapshot.queryParamMap.get('mode');
    this.isViewMode = mode === 'view';
    const headerData = sessionStorage.getItem('claimHeaderData');   // ADD
    if (headerData) {                                                // ADD
      const parsed = JSON.parse(headerData);                         // ADD
      this.prodCode = parsed.CLM_PROD_CODE || '';                     // ADD
      this.polNo = parsed.CLM_POL_NO || '';                           // ADD
    }                                                                 // ADD
    this.classDesc = sessionStorage.getItem('claimClassDesc') || '';

    this.estRowMenuItems = this.isViewMode
  ? [
      { label: 'More Fields', icon: 'pi pi-external-link', command: () => { if (this.activeEstRowIndex !== null) this.openMoreDialog(this.activeEstRowIndex); } },
      { label: 'Settlement Details', icon: 'pi pi-wallet', command: () => this.onSettlementDetailsClick() }
    ]
  : [
      { label: 'Save', icon: 'pi pi-save', command: () => { if (this.activeEstRowIndex !== null) this.saveRow(this.activeEstRowIndex); } },
      { label: 'More Fields', icon: 'pi pi-external-link', command: () => { if (this.activeEstRowIndex !== null) this.openMoreDialog(this.activeEstRowIndex); } },
      { label: 'Settlement Details', icon: 'pi pi-wallet', command: () => this.onSettlementDetailsClick() }
    ];

    this.menuService.getLovFields('PGIT8000', 'PGIT_CLM_EST')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lovList) => {
          const map: { [key: string]: any } = {};
          lovList.forEach(l => map[l.PLD_FIELD_NAME] = l);

          // Force CE_CUST_CODE as a dropdown even if the LOV API doesn't return it
          if (!map['CE_CUST_CODE']) {
            map['CE_CUST_CODE'] = {
              PLD_PROG_CODE: 'PGIT8000',
              PLD_BLOCK_NAME: 'PGIT_CLM_EST',
              PLD_FIELD_NAME: 'CE_CUST_CODE'
            };
          }

          this.lovMap.set(map);

          Object.values(map).forEach((l: any) => {
            this.menuService.getDropdownValues(l.PLD_PROG_CODE, l.PLD_BLOCK_NAME, l.PLD_FIELD_NAME)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (values) => {
                  const current = this.dropdownOptionsMap();
                  this.dropdownOptionsMap.set({ ...current, [l.PLD_FIELD_NAME]: values });
                },
                error: (err) => console.error(`Error loading dropdown values for ${l.PLD_FIELD_NAME}`, err)
              });
          });
        },
        error: (err) => console.error('Error loading LOV fields', err)
      });

    this.menuService.getEstDetailFields()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields) => {
          const filtered = getEstDetailColumns(fields);
          this.tableColumns.set(filtered);
          
          if (this.clmapSysId) {
            this.menuService.getEstDetailsByClmap(this.clmapSysId)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (res) => {
                  if (res && res.length > 0) {
                    res.forEach((row: any) => {
                      if (row.CE_DT) row.CE_DT = new Date(row.CE_DT);
                    });
                    this.gridRows.set(res);
                  } else {
                    this.gridRows.set([{ CE_DT: new Date() }]);
                  }
                  this.loading.set(false);
                },
                error: (err) => {
                  console.error('Error fetching estimation details', err);
                  this.gridRows.set([{ CE_DT: new Date() }]);
                  this.loading.set(false);
                }
              });
          } else {
            this.loading.set(false);
            this.gridRows.set([{ CE_DT: new Date() }]);
          }

        },
        error: (err) => {
          console.error('Error loading estimation detail fields:', err);
          this.loading.set(false);
        }
      });
  }


  addRow(): void {
    if (this.isViewMode) return;
    this.gridRows.update(rows => [
      ...rows, 
      { 
        CE_CLMAP_SYS_ID: this.clmapSysId, 
        CE_CLM_SYS_ID: this.clmSysId, 
        CE_DT: new Date(),
        CE_CR_UID: this.crUid,
        CE_CURR_CODE: 'USD'
      }
    ]);
  }


  get visibleColumns() {
    return this.tableColumns().slice(0, 6);
  }

  get extraColumns() {
    return this.tableColumns().slice(6);
  }

  get showMoreDialogValue(): boolean {
    return this.showMoreDialog();
  }
  set showMoreDialogValue(value: boolean) {
    this.showMoreDialog.set(value);
  }

  openMoreDialog(index: number): void {
    this.activeRowIndex.set(index);
    this.showMoreDialog.set(true);
  }

  saveRow(index: number): void {
    if (this.isViewMode) return; 
    const row = { ...this.gridRows()[index] };

    const missing = this.tableColumns()
      .filter(col => col.MANDATORY === 1)
      .filter(col => this.getInputType(col.SOURCE_DESIGN_TYPE, col.DATA_TYPE) !== 'checkbox')
      .filter(col => {
        const v = row[col.COLUMN_NAME];
        return v === null || v === undefined || v === '';
      });

    if (missing.length > 0) {
      this.msgService.show('error', 'Validation Error', 'Please fill mandatory fields: ' + missing.map(f => f.FIELD_PROMPT).join(', '));
      return;
    }

    // Validate that required IDs are available
    if (!this.clmapSysId || !this.clmSysId) {
      this.msgService.show('error', 'Missing Data', 'Claim or Risk Detail ID is missing. Please navigate from the Claim Registration page.');
      return;
    }

    // ADD — need policy sys id / end idx to call FC/LC api
    if (!this.polSysId) {
      this.msgService.show('error', 'Missing Data', 'Policy details are missing. Please select a risk row with a policy.');
      return;
    }

    this.tableColumns().forEach(col => {
      if (this.getInputType(col.SOURCE_DESIGN_TYPE, col.DATA_TYPE) === 'checkbox') {
        row[col.COLUMN_NAME] = row[col.COLUMN_NAME] ? '1' : '0';
      }
      // Convert date fields to ISO string for API
      if (this.getInputType(col.SOURCE_DESIGN_TYPE, col.DATA_TYPE) === 'date' && row[col.COLUMN_NAME] instanceof Date) {
        row[col.COLUMN_NAME] = row[col.COLUMN_NAME].toISOString();
      }
    });

    // ADD — fetch FC/LC values before saving, then merge into row and proceed
    const amtFc = parseFloat(row.CE_AMT_FC) || 0;
    const currCode = row.CE_CURR_CODE || 'USD';
//     CE_COMP_CODE   --  001
// CE_DIVN_CODE   ---   104
// CE_DEPT_CODE   ---  10
 

    this.menuService.getFCandLCValues(
      this.polSysId,
      this.endIdx ?? 0,
      0,
      currCode,
      'B',
      amtFc
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fcLc: any) => {
          row.CE_AMT_LC = fcLc?.out_M_AMT_LC_1;
          row.CE_CURR_RATE = fcLc?.out_M_CURR_RATE_1;
          row.CE_COMP_CODE = '001';
          row.CE_DIVN_CODE=104;
          row.CE_DEPT_CODE=10;
          row.CE_PROD_CODE =2001;

          const request = row.CE_SYS_ID
            ? this.menuService.updateEstDetail(row)
            : this.menuService.saveEstimation(row, this.clmapSysId!, this.clmSysId!, this.crUid);

          request.pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: any) => {
              // Update the row with returned data (e.g. CE_SYS_ID) so subsequent saves are updates
              const savedData = res?.data?.data || res?.data || res;
              if (savedData?.CE_SYS_ID) {
                this.gridRows.update(rows => {
                  const copy = [...rows];
                  copy[index] = { ...copy[index], CE_SYS_ID: savedData.CE_SYS_ID };
                  return copy;
                });

                // ADD — trigger settlement creation using the just-saved CE_SYS_ID
                const csDt = new Date().toISOString().slice(0, 10); // system date, YYYY-MM-DD
                this.menuService.getSettlementCreation(
                  savedData.CE_SYS_ID,
                  this.clmSysId!,
                  csDt,
                  this.crUid
                )
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: () => console.log('Settlement creation triggered successfully'),
                    error: (err) => console.error('Error triggering settlement creation', err)
                  });
              }
              this.msgService.show('success', 'Success', 'Estimation row saved successfully');
            },
            error: (err) => {
              console.error('Error saving estimation row', err);
              this.msgService.show('error', 'Error', 'Failed to save estimation row. Please try again.');
            }
          });
        },
        error: (err) => {
          console.error('Error fetching FC/LC values', err);
          this.msgService.show('error', 'Error', 'Failed to fetch currency conversion values. Please try again.');
        }
      });
  }

  isLovField(columnName: string): boolean {
    return !!this.lovMap()[columnName];
  }

  getDropdownOptions(columnName: string): any[] {
    const raw = this.dropdownOptionsMap()[columnName] || [];
    return raw.map((row: any) => {
      const keys = Object.keys(row);
      const code = row[keys[0]];
      const desc = row[keys[1]];
      return {
        label: desc ? `${code} - ${desc}` : `${code}`,
        value: code
      };
    });
  }


  getRefNo(index: number): string {
    return 'REFER/' + String(index).padStart(4, '0');
  }

  openEstRowMenu(event: Event, menu: any, index: number): void {
    this.activeEstRowIndex = index;
    menu.toggle(event);
  }

  onSettlementDetailsClick(): void {
    this.router.navigate(['/settlement-details'], {
      queryParams: {
        sysId: this.clmSysId,
        clmapSysId: this.clmapSysId,
        crUid: this.crUid,
        polSysId: this.polSysId,
        endIdx: this.endIdx,
          mode: this.isViewMode ? 'view' : null
      }
    });
  }

  goBack(): void {
  this.router.navigate(['/claim-registration'], {
    queryParams: { mode: this.isViewMode ? 'view' : 'edit', sysId: this.clmSysId }   // CHANGED
  });
}
}