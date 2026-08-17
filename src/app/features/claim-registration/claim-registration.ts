import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, takeUntil } from 'rxjs/operators';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { FieldConfig } from '../../core/models/model';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import { getInputType, getVisibleFieldsSorted, isFieldEditable, isFieldEditableIntimation, getTableColumnFields } from '../../core/utils/field-filter.util';
import { MenuItem } from 'primeng/api';

import { Router } from '@angular/router';
import { DatePicker } from "primeng/datepicker";

@Component({
  selector: 'app-claim-registration',
  standalone: true,
  imports: [...SHARED_IMPORTS, DatePicker],
  templateUrl: './claim-registration.html',
  styleUrls: ['./claim-registration.scss'],
  providers: [UnSubscriber]
})
export class ClaimRegistrationComponent extends UnSubscriber implements OnInit {
  fields = signal<FieldConfig[]>([]);
  loading = signal(true);
  getInputType = getInputType;
  isFieldEditable = isFieldEditable;
  estColumns = signal<FieldConfig[]>([]);
  estRows = signal<any[]>([{}]);
  showEstDialog = signal(false);

  riskTableColumns = signal<FieldConfig[]>([]);
  riskGridRows = signal<any[]>([{}]);
  riskLoading = signal(false);
  rowMenuItems: MenuItem[] = [];
  activeRowIndex: number | null = null;

  formData: any = {};
  isReadOnly = false;
  isEdit = false;
  sysId: number | null = null;

  dateError: string = '';

  private readonly forceTextFields = [''];
  private readonly headerFields = ['CLM_PROD_CODE', 'CLM_NO'];

  lovMap = signal<{ [fieldName: string]: any }>({});
  dropdownOptionsMap = signal<{ [fieldName: string]: any[] }>({});

  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    private router: Router

  ) {
    super();
  }

  ngOnInit(): void {
    const storedInstCode = sessionStorage.getItem('claimInstCode');

    this.isReadOnly = this.route.snapshot.queryParamMap.get('mode') === 'view';
    this.isEdit = this.route.snapshot.queryParamMap.get('mode') === 'edit';
    this.sysId = Number(this.route.snapshot.queryParamMap.get('sysId')) || null;

    this.menuService.getRiskDetailFields()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields) => {
          const filtered = getTableColumnFields(fields);
          this.riskTableColumns.set(filtered);
          this.riskLoading.set(false);
          this.loadRiskRows();
        },
        error: (err) => {
          console.error('Error loading risk detail fields:', err);
          this.riskLoading.set(false);
        }
      });

    this.rowMenuItems = [
      { label: 'Est Details', icon: 'pi pi-file', command: () => this.onEstDetailsClick() },
      { label: 'Settlement Details', icon: 'pi pi-wallet', command: () => this.onSettlementDetailsClick() }
    ];

    if ((this.isEdit || this.isReadOnly) && this.sysId) {
      this.menuService.getClaimRegById(this.sysId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (record) => {
            sessionStorage.setItem('claimHeaderData', JSON.stringify({
              CLM_NO: record.CLM_NO,
              CLM_LOSS_DT: record.CLM_LOSS_DT ? new Date(record.CLM_LOSS_DT) : '',
              CLM_POL_NO: record.CLM_POL_NO,
              CLM_PROD_CODE: record.CLM_PROD_CODE,
              CLM_RECOVERY_YN: record.CLM_RECOVERY_YN,
              CLM_SETL_TYPE_CODE: record.CLM_SETL_TYPE_CODE ?? '',
              CLM_DOC_SUBMISSION_DT: record.CLM_DOC_SUBMISSION_DT ? record.CLM_DOC_SUBMISSION_DT.slice(0, 10) : '',
              CLM_SALVAGE_YN: record.CLM_SALVAGE_YN === '1'
            }));
            const instCode = storedInstCode || record.CLM_INST_CODE;   // CHANGED: fallback to record's own inst code

            if (instCode) {
              this.menuService.getClaimRegFields(instCode)
                .pipe(takeUntil(this.destroy$))
                .subscribe({
                  next: (fields) => {
                    // ADD THIS — same fix as your ADD flow, needed here too
                    const dataLossField = fields.find(f => f.COLUMN_NAME === 'CLM_LOSS_DT');
                    if (dataLossField) {
                      dataLossField.DATA_TYPE = 'D';
                    }

                    const visibleFields = getVisibleFieldsSorted(fields);
                    this.fields.set(visibleFields);
                    this.formData = this.mapRecordToFormData(record, visibleFields);
                    this.loading.set(false);
                    this.loadLovAndDropdowns(fields);
                  },
                  error: (err) => {
                    console.error('Error loading claim registration fields:', err);
                    this.loading.set(false);
                  }
                });
            } else {
              this.formData = record;
              this.loading.set(false);
            }
          },
          error: (err) => {
            console.error('Error loading claim reg by id', err);
            this.loading.set(false);
          }
        });
      return;
    }

    // ADD flow — unchanged
    if (!storedInstCode) {
      this.loading.set(false);
      return;
    }

    this.formData['CLM_INTM_DT'] = new Date();
    this.formData['CLM_RECOVERY_YN'] = false;      // CHANGED from null
    this.formData['CLM_INTER_DIVN_YN'] = false;
    this.formData['CLM_SALVAGE_YN'] = false;

    this.menuService.getClaimRegFields(storedInstCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields) => {
          const dataLossFields = fields.find(f => f.COLUMN_NAME === 'CLM_LOSS_DT');

          if (dataLossFields) {
            dataLossFields.DATA_TYPE = 'D';
          }
          this.fields.set(getVisibleFieldsSorted(fields));
          this.loading.set(false);
          this.loadLovAndDropdowns(fields);
        },
        error: (err) => {
          console.error('Error loading claim registration fields:', err);
          this.loading.set(false);
        }
      });
  }


 canEditField(field: FieldConfig): boolean {
  if (this.isReadOnly) return false;
  if (this.isEdit) return isFieldEditableIntimation(field); // UPDATE_YN === 2
  return true;
}

// Risk grid — edit mode checks ENTERABLE
canEditRiskField(col: FieldConfig): boolean {
  if (this.isReadOnly) return false;
  if (this.isEdit) return isFieldEditable(col); // ENTERABLE === 1
  return true;
}

  private loadLovAndDropdowns(fields: FieldConfig[]): void {
    if (!fields.length) return;
    const progCode = fields[0].PROGRAM_CODE;
    const blockName = fields[0].TABLE_NAME;

    this.menuService.getLovFields(progCode, blockName)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (lovList) => {
          const map: { [key: string]: any } = {};
          lovList.forEach(l => map[l.PLD_FIELD_NAME] = l);
          this.lovMap.set(map);
          // NOTE: dropdown values are no longer fetched here.
          // They're fetched lazily via onDropdownOpen() when the user opens that dropdown.
        },
        error: (err) => console.error('Error loading LOV fields', err)
      });
  }


  onDropdownOpen(columnName: string): void {
    if (this.dropdownOptionsMap()[columnName]) return;

    const lov = this.lovMap()[columnName];
    if (!lov) return;

    this.menuService.getDropdownValues(lov.PLD_PROG_CODE, lov.PLD_BLOCK_NAME, lov.PLD_FIELD_NAME)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (values) => {
          const current = this.dropdownOptionsMap();
          this.dropdownOptionsMap.set({ ...current, [columnName]: values });
        },
        error: (err) => console.error(`Error loading dropdown values for ${columnName}`, err)
      });
  }

  isLovField(columnName: string): boolean {
    if (this.forceTextFields.includes(columnName)) return false;
    return !!this.lovMap()[columnName];
  }

  getDropdownOptions(columnName: string): any[] {
    const raw = this.dropdownOptionsMap()[columnName] || [];
    return raw.map((row: any) => {
      if (columnName === 'CLM_ASSR_CODE') {
        const keys = Object.keys(row);
        return {
          value: row['CLM_ASSR_CODE'],
          label: row[keys[1]]   // the DECODE(...) assured name column
        };
      }

      if (columnName === 'CLM_POL_NO') {
        return {
          label: row.POLH_NO,
          value: row.POLH_NO
        };
      }

      const keys = Object.keys(row);
      const valueKey = row['PC_CODE'] !== undefined ? 'PC_CODE' : keys[0];
      const labelKey = keys[1];
      return {
        value: row[valueKey],
        label: row[labelKey] ?? row[valueKey]
      };
    });
  }

  private mapRecordToFormData(record: any, fields: FieldConfig[]): any {
    const updated: any = {};
    fields.forEach(f => {

      console.log(
        'Column:', f.COLUMN_NAME,
        'UPDATE_YN:', f.UPDATE_YN,
        'ENTERABLE:', f.ENTERABLE,
        'Editable:', this.isFieldEditable(f)
      );
      let value = record[f.COLUMN_NAME] ?? '';
      if (this.getInputType(f.SOURCE_DESIGN_TYPE, f.DATA_TYPE) === 'date' && value) {
        value = new Date(value);
      }
      updated[f.COLUMN_NAME] = value;
    });
    return updated;
  }

  onSubmit(): void {
    const missing = this.fields()
      .filter(f => f.MANDATORY === 1)
      .filter(f => this.getInputType(f.SOURCE_DESIGN_TYPE, f.DATA_TYPE) !== 'checkbox')
      .filter(f => {
        const v = this.formData[f.COLUMN_NAME];
        return v === null || v === undefined || v === '';
      });

    if (missing.length > 0) {
      alert('Please fill mandatory fields: ' + missing.map(f => f.FIELD_PROMPT).join(', '));
      return;
    }

    const now = new Date();
    const payload: any = {};
    console.log('DS code at load:', sessionStorage.getItem('claimIntmDsCode'));
    const dsCode = sessionStorage.getItem('claimIntmDsCode'); // ADDED
    this.fields().forEach(f => {
      let v = this.formData[f.COLUMN_NAME];
      if (v instanceof Date) v = v.toISOString();
      if (this.getInputType(f.SOURCE_DESIGN_TYPE, f.DATA_TYPE) === 'checkbox') {   // ADDED
        v = v === true ? '1' : '0';                                                // ADDED
      }                                                                            // ADDED
      payload[f.COLUMN_NAME] = v;
    });


    payload.CLM_INTM_NO = this.formData['CLM_INTM_NO'] ? this.formData['CLM_INTM_NO'] : 'null';
    payload.CLM_INTM_DS_CODE = dsCode
    payload.CLM_DS_CODE = dsCode
    payload.CLM_YEAR = now.getFullYear();
    payload.CLM_RECOVERY_YN = this.formData.CLM_RECOVERY_YN === true ? '1' : '0';
    payload.CLM_INTER_DIVN_YN = this.formData.CLM_INTER_DIVN_YN === true ? '1' : '0';
    payload.CLM_DIVN_CODE = '101';
    payload.CLM_SALVAGE_YN = this.formData.CLM_SALVAGE_YN === true ? '1' : '0';
    payload.CLM_STS = 'A';
    payload.CLM_CR_DT = now.toISOString();
    payload.CLM_CR_UID = 'TSHEPANDG';
    payload.CLM_COMP_CODE = '001';
    payload.CLM_DEPT_CODE = '10';
    payload.CLM_DS_TYPE = 4;
    payload.CLM_CLASS_CODE = sessionStorage.getItem('claimClassCode');

    const request$ = this.isEdit && this.sysId
      ? this.menuService.updateClaimRegistration(this.sysId, payload)
      : this.menuService.saveClaimRegistration(payload);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const data = res?.data?.data;
          if (data?.CLM_SYS_ID) {
            this.sysId = data.CLM_SYS_ID;
            this.isEdit = true;
          }
          if (data?.CLM_NO) {
            this.formData['CLM_NO'] = data.CLM_NO;
          }
          alert('Claim Registration Saved Successfully');
          this.loadRiskRows(); // Load risk rows after saving and getting sysId
        },
        error: (err) => console.error('Error saving claim registration', err)
      });
  }


  onPolicyNoBlur(): void {
    const polNo = this.formData['CLM_POL_NO'];
    if (!polNo) return;

    this.menuService.getPolicyData(polNo)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const policy = res?.data?.data?.[0];
          if (!policy) return;

          this.formData['CLM_CURR_CODE'] = policy.POL_PREM_CURR_CODE;
          this.formData['CLM_PROD_CODE'] = policy.POL_PROD_CODE;

          const targetAssrCode = String(policy.POL_ASSR_CODE);

          const applyAssrCode = (options: any[]) => {
            const match = options.find(o => String(o.value) === targetAssrCode);
            // always store the STRING form so it matches option.value type
            this.formData['CLM_ASSR_CODE'] = match ? match.value : targetAssrCode;
          };

          const existingOptions = this.getDropdownOptions('CLM_ASSR_CODE');
          if (existingOptions.length) {
            applyAssrCode(existingOptions);
            return;
          }

          const lov = this.lovMap()['CLM_ASSR_CODE'];
          if (lov) {
            this.menuService.getDropdownValues(lov.PLD_PROG_CODE, lov.PLD_BLOCK_NAME, lov.PLD_FIELD_NAME)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (values) => {
                  const current = this.dropdownOptionsMap();
                  this.dropdownOptionsMap.set({ ...current, CLM_ASSR_CODE: values });
                  applyAssrCode(this.getDropdownOptions('CLM_ASSR_CODE'));
                },
                error: (err) => console.error('Error loading assured code options', err)
              });
          } else {
            // lovMap not ready yet — poll/retry once it loads
            const sub = this.menuService.getClaimRegFields; // no-op placeholder
            this.formData['CLM_ASSR_CODE'] = targetAssrCode; // temp fallback
          }
        },
        error: (err) => console.error('Error fetching policy data', err)
      });
  }

  onEstDetailsClick(): void {
    const rows = this.riskGridRows();
    const index = this.activeRowIndex;
    const clmapSysId = index !== null ? rows[index]?.CLMAP_SYS_ID : null;

    this.router.navigate(['/est-details'], {
      queryParams: { clmapSysId, sysId: this.sysId }
    });
  }

  onNextClick(): void {
    if (!this.sysId) {
      alert('Please save the claim registration first.');
      return;
    }
    const riskSection = document.querySelector('.risk-grid');
    if (riskSection) {
      riskSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

  onSettlementDetailsClick(): void {
    const rows = this.riskGridRows();
    const index = this.activeRowIndex;
    const clmapSysId = index !== null ? rows[index]?.CLMAP_SYS_ID : null;

    this.router.navigate(['/settlement-details'], {
      queryParams: {
        sysId: this.sysId,
        clmapSysId: clmapSysId
      }
    });
  }

  addRiskRow(): void {
    this.riskGridRows.update(rows => [...rows, { CLMAP_CLM_SYS_ID: this.sysId }]);
  }

  openRowMenu(event: Event, menu: any, index: number): void {
    this.activeRowIndex = index;
    menu.toggle(event);

    setTimeout(() => {
      const menuEl = document.querySelector('.p-menu-overlay') as HTMLElement;
      if (menuEl) {
        const rect = menuEl.getBoundingClientRect();

        let deltaX = 0;
        let deltaY = 0;

        if (rect.right > window.innerWidth) {
          deltaX = window.innerWidth - rect.right - 12;
        }
        if (rect.bottom > window.innerHeight) {
          deltaY = window.innerHeight - rect.bottom - 12;
        }

        if (deltaX !== 0 || deltaY !== 0) {
          const currentLeft = rect.left;
          const currentTop = rect.top;
          menuEl.style.position = 'fixed';
          menuEl.style.left = `${currentLeft + deltaX}px`;
          menuEl.style.top = `${currentTop + deltaY}px`;
        }

        menuEl.classList.add('menu-visible');
      }
    });
  }

  private loadRiskRows(): void {
    if (!this.sysId) {
      this.riskLoading.set(false);
      return;
    }
    this.riskLoading.set(true);

    this.menuService.getRiskDetailsByClaim(this.sysId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const dataObj = res?.data?.data || {};
          const sortedKeys = Object.keys(dataObj).sort((a, b) => Number(a) - Number(b));

          const rows: any[] = [];
          sortedKeys.forEach(key => {
            dataObj[key].forEach((entry: any) => rows.push(this.normalizeRiskRow(entry)));
          });

          this.riskGridRows.set(rows.length ? rows : [{}]);
          this.riskLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading risk detail rows:', err);
          this.riskLoading.set(false);
        }
      });
  }

  private normalizeRiskRow(entry: any): any {
    const row = { ...entry };
    this.riskTableColumns().forEach(col => {
      const inputType = this.getInputType(col.SOURCE_DESIGN_TYPE, col.DATA_TYPE);
      if (inputType === 'checkbox') {
        row[col.COLUMN_NAME] = row[col.COLUMN_NAME] === '1' || row[col.COLUMN_NAME] === 1;
      } else if (inputType === 'date' && row[col.COLUMN_NAME]) {
        row[col.COLUMN_NAME] = new Date(row[col.COLUMN_NAME]);
      }
    });
    return row;
  }

  saveRiskRow(index: number): void {
    const row = { ...this.riskGridRows()[index] };

    const missing = this.riskTableColumns()
      .filter(col => col.MANDATORY === 1)
      .filter(col => {
        const v = row[col.COLUMN_NAME];
        return v === null || v === undefined || v === '';
      });

    if (missing.length > 0) {
      alert('Please fill mandatory fields: ' + missing.map(f => f.FIELD_PROMPT).join(', '));
      return;
    }

    this.riskTableColumns().forEach(col => {
      if (this.getInputType(col.SOURCE_DESIGN_TYPE, col.DATA_TYPE) === 'checkbox') {
        row[col.COLUMN_NAME] = row[col.COLUMN_NAME] ? '1' : '0';
      }
    });

    const request = row.CLMAP_SYS_ID
      ? this.menuService.updateRiskDetail(row)
      : this.menuService.createRiskDetail(row);

    request
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => alert('Risk Row saved successfully'),
        error: (err: any) => console.error('Error saving risk detail row', err)
      });
  }


  // ADDED — explicit mode-based class helper
getFieldStateClass(field: FieldConfig): string {
  if (this.isReadOnly) return 'field-disabled field-view-mode';
  if (this.isEdit) return !this.isFieldEditable2(field) ? 'field-disabled field-edit-mode' : '';
  return ''; // ADD mode — always full white, no grey
}

// helper alias so template doesn't need to import isFieldEditableIntimation separately
private isFieldEditable2(field: FieldConfig): boolean {
  return field.UPDATE_YN === 2;
}


  isHeaderField(columnName: string): boolean {
    return this.headerFields.includes(columnName);
  }
  goBack(): void {
    const classCode = sessionStorage.getItem('claimClassCode') || '';
    this.router.navigate(['/claim-list', classCode]);
  }
}