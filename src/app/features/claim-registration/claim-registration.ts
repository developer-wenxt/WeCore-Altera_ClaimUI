import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, takeUntil } from 'rxjs/operators';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { FieldConfig } from '../../core/models/model';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import { getInputType, getVisibleFieldsSorted, isFieldEditable, isFieldEditableIntimation, getTableColumnFields } from '../../core/utils/field-filter.util';
import { MenuItem } from 'primeng/api';
import {  map } from 'rxjs/operators';
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

  lockedByFlow: 'intm' | 'policy' | null = null;

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
      const reordered = this.reorderRiskColumns(filtered); // CHANGED
      this.riskTableColumns.set(reordered); // CHANGED
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

                    const visibleFields = this.reorderPriorityFields(getVisibleFieldsSorted(fields));
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
         this.fields.set(this.reorderPriorityFields(getVisibleFieldsSorted(fields)));
          this.loading.set(false);
          this.loadLovAndDropdowns(fields);
        },
        error: (err) => {
          console.error('Error loading claim registration fields:', err);
          this.loading.set(false);
        }
      });
  }



  getMultiValues(value: any): string[] {
  if (value === null || value === undefined || value === '') {
    return [];
  }

  return String(value)
    .split(',')
    .map(v => v.trim())
    .filter(Boolean);
}

// ADD — fields auto-populated by each flow, locked once that flow has run
private getLockedFields(): string[] {
  if (this.lockedByFlow === 'intm') {
    return ['CLM_POL_NO', 'CLM_CURR_CODE', 'CLM_PROD_CODE', 'CLM_ASSR_CODE', 'CLM_EVENT_CODE'];
  }
  if (this.lockedByFlow === 'policy') {
    return ['CLM_CURR_CODE', 'CLM_PROD_CODE', 'CLM_ASSR_CODE'];
  }
  return [];
}

canEditField(field: FieldConfig): boolean {
  if (this.isReadOnly) return false;
  if (this.getLockedFields().includes(field.COLUMN_NAME)) return false;   // ADD
  if (this.isEdit) return isFieldEditableIntimation(field);
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
  const lov = this.lovMap()[columnName];
  if (!lov) return;

 if (columnName === 'CLM_POL_NO') {
  const lossDate = this.formData['CLM_LOSS_DT'];
  const formattedDate = lossDate ? this.formatDate(lossDate) : '';

  this.menuService.getDropdownValues(
    lov.PLD_PROG_CODE,
    lov.PLD_BLOCK_NAME,
    lov.PLD_FIELD_NAME,
    formattedDate   // CHANGED back — plain string, same as claim-notification
  )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (values) => {
        const current = this.dropdownOptionsMap();
        this.dropdownOptionsMap.set({ ...current, [columnName]: values });
      },
      error: (err) => console.error(`Error loading dropdown values for ${columnName}`, err)
    });
  return;
}

  if (columnName === 'CLM_INTM_NO') {
 
    const dsINTCode = sessionStorage.getItem('claimIntm_1DsCode') || '';
  const polNo = this.formData['CLM_POL_NO'] || 'null';   // matches your working URL's POL_NO='null'

  this.menuService.getIntmNoDropdownValues(
    lov.PLD_PROG_CODE,
    lov.PLD_BLOCK_NAME,
    lov.PLD_FIELD_NAME,
    'null',
    dsINTCode
  )
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (values) => {
        const current = this.dropdownOptionsMap();
        this.dropdownOptionsMap.set({ ...current, [columnName]: values });
      },
      error: (err) => console.error(`Error loading dropdown values for ${columnName}`, err)
    });
  return;
}

  // unchanged — every other field still uses the cache
  if (this.dropdownOptionsMap()[columnName]) return;

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


onIntmNoSelect(intmNo: string): void {
  if (!intmNo) return;

  this.menuService.getIntimationData(intmNo)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        const intm = res?.data?.[0] ?? res?.[0];
        if (!intm) return;

        this.formData['CLM_POL_NO']  = intm.CI_POL_NO;
        this.formData['CLM_LOSS_DT'] = intm.CI_LOSS_DT ? new Date(intm.CI_LOSS_DT) : this.formData['CLM_LOSS_DT'];
        this.formData['CLM_EVENT_CODE'] = intm.CI_EVENT_CODE;

        if (this.isLovField('CLM_POL_NO')) {
          this.onDropdownOpen('CLM_POL_NO');
        }

        if (intm.CI_ASSR_NAME) {
          this.resolveAssrCodeFromName(intm.CI_ASSR_NAME);
          if (this.isLovField('CLM_ASSR_CODE')) {
            this.onDropdownOpen('CLM_ASSR_CODE');
          }
        }

        if (intm.CI_POL_NO) {
          this.menuService.getPolicyDataByPolNo(intm.CI_POL_NO)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (polRes: any) => {
                const pol = polRes?.data?.[0] ?? polRes?.[0];
                if (!pol) return;
                this.formData['CLM_PROD_CODE'] = pol.POL_PROD_CODE;
                this.formData['CLM_CURR_CODE'] = pol.POL_PREM_CURR_CODE;

                if (this.isLovField('CLM_CURR_CODE')) {
                  this.onDropdownOpen('CLM_CURR_CODE');
                }

                this.lockedByFlow = 'intm';
              },
              error: (err) => {
                console.error('Error fetching policy data by pol no', err);
                this.lockedByFlow = 'intm';
              }
            });
        } else {
          this.lockedByFlow = 'intm';
        }
      },
      error: (err) => console.error('Error fetching intimation data', err)
    });
}


private resolveAssrCodeFromName(assrName: string): void {
  const normalize = (s: string) =>
    String(s).trim().toUpperCase().replace(/&/g, 'AND').replace(/\s+/g, ' ');

  const target = normalize(assrName);

  const applyMatch = (options: any[]) => {
    let match = options.find(o => normalize(o.label) === target);

    // fallback: loose partial match if exact normalized match fails
    if (!match) {
      match = options.find(o =>
        normalize(o.label).includes(target) || target.includes(normalize(o.label))
      );
    }

    if (match) {
      this.formData['CLM_ASSR_CODE'] = match.value;
    } else {
      console.warn('No matching assured code found for name:', assrName);
    }
  };

  const existingOptions = this.getDropdownOptions('CLM_ASSR_CODE');
  if (existingOptions.length) {
    applyMatch(existingOptions);
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
          applyMatch(this.getDropdownOptions('CLM_ASSR_CODE'));
        },
        error: (err) => console.error('Error loading assured code options', err)
      });
  }
}


private reorderPriorityFields(fields: FieldConfig[]): FieldConfig[] {
  const priorityOrder = ['CLM_LOSS_DT', 'CLM_INTM_NO', 'CLM_POL_NO'];
  const priorityFields: FieldConfig[] = [];
  const rest: FieldConfig[] = [];

  fields.forEach(f => {
    if (priorityOrder.includes(f.COLUMN_NAME)) {
      priorityFields.push(f);
    } else {
      rest.push(f);
    }
  });

  priorityFields.sort(
    (a, b) => priorityOrder.indexOf(a.COLUMN_NAME) - priorityOrder.indexOf(b.COLUMN_NAME)
  );

  return [...priorityFields, ...rest];
}

  isLovField(columnName: string): boolean {
    if (this.forceTextFields.includes(columnName)) return false;
    return !!this.lovMap()[columnName];
  }


  private formatDate(date: any): string {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${month}/${day}/${year}`;
}

  getDropdownOptions(columnName: string): any[] {
    const raw = this.dropdownOptionsMap()[columnName] || [];
    return raw.map((row: any) => {
      if (columnName === 'CLM_ASSR_CODE') {
  const keys = Object.keys(row);
  return {
    value: row[keys[0]],   // CHANGED from row['CLM_ASSR_CODE'] — that key doesn't exist on the raw row
    label: row[keys[1]]
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
    const dsCode = sessionStorage.getItem('claimIntmDsCode');
     // ADDED
    this.fields().forEach(f => {
      let v = this.formData[f.COLUMN_NAME];
      if (v instanceof Date) v = v.toISOString();
      if (this.getInputType(f.SOURCE_DESIGN_TYPE, f.DATA_TYPE) === 'checkbox') {   // ADDED
        v = v === true ? '1' : '0';                                                // ADDED
      }                                                                            // ADDED
      payload[f.COLUMN_NAME] = v;
    });


    payload.CLM_INTM_NO =
  this.formData['CLM_INTM_NO']?.toString().trim() || 'null';
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
            console.log('🔥 SAVE RESPONSE:', JSON.stringify(res, null, 2)); // TEMP DEBUG

          const data = res?.data?.data;
          if (data?.CLM_SYS_ID) {
            this.sysId = data.CLM_SYS_ID;
            this.isEdit = true;
          }
          if (data?.CLM_NO) {
            this.formData['CLM_NO'] = data.CLM_NO;
          }
          alert('Claim Registration Saved Successfully');
const polNo = this.formData['CLM_POL_NO'];
this.loadRiskRowsThenPopulate(polNo);
        },
        error: (err) => console.error('Error saving claim registration', err)
      });
  }


   onPolicyNoSelect(polNo: string): void {
    if (!polNo) return;

    const lossDate = this.formData['CLM_LOSS_DT'];
    if (!lossDate) {
      alert('Please select the Date of Loss before selecting the Policy No.');
      return;
    }

    const formattedLossDate = this.formatDate(lossDate);

    this.menuService.getPolicyData(polNo, formattedLossDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const policy = res?.[0];
          if (!policy) return;

           this.lockedByFlow = 'policy';

          this.formData['CLM_CURR_CODE'] = policy.POL_PREM_CURR_CODE;
          this.formData['CLM_PROD_CODE'] = policy.POL_PROD_CODE;

          // ADD THIS — ensure currency dropdown options are loaded so the select displays the value
          if (this.isLovField('CLM_CURR_CODE')) {
            this.onDropdownOpen('CLM_CURR_CODE');
          }

          const targetAssrCode = String(policy.POL_ASSR_CODE);
          console.log('targetAssrCode:', targetAssrCode);
console.log('lovMap CLM_ASSR_CODE:', this.lovMap()['CLM_ASSR_CODE']);
          const applyAssrCode = (options: any[]) => {
            const match = options.find(o => String(o.value) === targetAssrCode);
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
            this.formData['CLM_ASSR_CODE'] = targetAssrCode;
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

onRiskPolicyNoChange(polNo: string, index: number): void {
  if (!polNo) return;

  this.updateRiskRow(index, { CLMAP_POL_NO: polNo });

  this.menuService.getRiskPolicy(polNo).pipe(
    switchMap((polRes: any) => {
      const pol = Array.isArray(polRes) ? polRes[0] : polRes;
      const polhSysId = pol?.POLH_SYS_ID;
      const endIdx = pol?.POLH_END_NO_IDX ?? 0;
      return this.menuService.getRiskSection(polhSysId, endIdx).pipe(
        map((sec: any): { sec: any; polhSysId: any; endIdx: any } => ({ sec, polhSysId, endIdx }))
      );
    }),
    switchMap(({ sec, polhSysId, endIdx }: { sec: any; polhSysId: any; endIdx: any }) => {
      const secData = Array.isArray(sec) ? sec[0] : sec;
      this.updateRiskRow(index, { CLMAP_SECTION_CODE: secData?.PSECH_SEC_CODE });
      const psechSysId = secData?.PSECH_SYS_ID;
      return this.menuService.getRiskRisk(psechSysId, polhSysId, endIdx).pipe(
        map((risk: any): { risk: any; polhSysId: any; endIdx: any; psechSysId: any } => ({ risk, polhSysId, endIdx, psechSysId }))
      );
    }),
    switchMap(({ risk, polhSysId, endIdx, psechSysId }: { risk: any; polhSysId: any; endIdx: any; psechSysId: any }) => {
      const riskRows = Array.isArray(risk) ? risk : (risk ? [risk] : []); // CHANGED — keep all rows

      // ADDED — join all PRAIH_RISK_ID values into Risk Desc 1
      const riskDesc = riskRows.map((r: any) => r.PRAIH_RISK_ID).filter(Boolean).join(', ');
      this.updateRiskRow(index, { CLMAP_PRAI_LVL1_DESC: riskDesc });

      const praihSysId = riskRows[0]?.PRAIH_SYS_ID; // still use first for downstream chain
      return this.menuService.getRiskSmi(praihSysId, psechSysId, polhSysId, endIdx).pipe(
        map((smi: any): { smi: any; praihSysId: any; psechSysId: any; polhSysId: any; endIdx: any } => ({ smi, praihSysId, psechSysId, polhSysId, endIdx }))
      );
    }),
    switchMap(({ smi, praihSysId, psechSysId, polhSysId, endIdx }: { smi: any; praihSysId: any; psechSysId: any; polhSysId: any; endIdx: any }) => {
      const smiRows = Array.isArray(smi) ? smi : (smi ? [smi] : []); // CHANGED
      const smiCode = smiRows.map((s: any) => s.PRSH_SMI_CODE).filter(Boolean).join(', '); // CHANGED — join multiple
      this.updateRiskRow(index, { CLMAP_SMI_CODE: smiCode });
      return this.menuService.getRiskCover(praihSysId, psechSysId, polhSysId, endIdx);
    }),
    takeUntil(this.destroy$)
  ).subscribe({
    next: (coverRes: any) => {
      const coverRows = Array.isArray(coverRes) ? coverRes : (coverRes ? [coverRes] : []); // CHANGED
      const coverCode = coverRows.map((c: any) => c.PRCH_CODE).filter(Boolean).join(', '); // CHANGED — join multiple
      this.updateRiskRow(index, { CLMAP_COVER_CODE: coverCode });
    },
    error: (err) => console.error('Error chaining risk detail lookups', err)
  });
}

// ADDED — reorder risk grid columns so Risk Desc 1 sits right after Section Code
private reorderRiskColumns(fields: FieldConfig[]): FieldConfig[] {
  const sectionIdx = fields.findIndex(f => f.COLUMN_NAME === 'CLMAP_SECTION_CODE');
  const riskDescIdx = fields.findIndex(f => f.COLUMN_NAME === 'CLMAP_PRAI_LVL1_DESC');

  if (sectionIdx === -1 || riskDescIdx === -1 || riskDescIdx === sectionIdx + 1) {
    return fields; // nothing to do
  }

  const result = [...fields];
  const [riskDescField] = result.splice(riskDescIdx, 1);
  const newSectionIdx = result.findIndex(f => f.COLUMN_NAME === 'CLMAP_SECTION_CODE');
  result.splice(newSectionIdx + 1, 0, riskDescField);
  return result;
}

private loadRiskRowsThenPopulate(polNo: string): void {
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

        if (!rows.length && polNo) {
          this.onRiskPolicyNoChange(polNo, 0);
        }
      },
      error: (err) => {
        // CHANGED — 404 here just means "no risk rows yet", not a real failure
        if (err?.status === 404) {
          console.log('No existing risk rows — populating fresh row from policy chain');
          this.riskGridRows.set([{}]);
          this.riskLoading.set(false);
          if (polNo) {
            this.onRiskPolicyNoChange(polNo, 0);
          }
        } else {
          console.error('Error loading risk detail rows:', err);
          this.riskLoading.set(false);
        }
      }
    });
}

private updateRiskRow(index: number, patch: any): void {
  this.riskGridRows.update(rows => {
    const copy = [...rows];
    copy[index] = { ...copy[index], ...patch };
    return copy;
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