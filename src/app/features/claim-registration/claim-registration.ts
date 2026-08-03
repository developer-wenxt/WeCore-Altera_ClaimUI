import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { switchMap, takeUntil } from 'rxjs/operators';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { FieldConfig } from '../../core/models/model';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import {  getInputType ,getVisibleFieldsSorted,isFieldEditable } from '../../core/utils/field-filter.util';


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

  formData: any = {};         
  isReadOnly = false;          
  isEdit = false;               
  sysId: number | null = null;

  lovMap = signal<{ [fieldName: string]: any }>({});                  // ADD
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

  if ((this.isEdit || this.isReadOnly) && this.sysId) {
    this.menuService.getClaimRegById(this.sysId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (record) => {
          sessionStorage.setItem('claimHeaderData', JSON.stringify({
        CLM_NO: record.CLM_NO,
        CLM_LOSS_DT: record.CLM_LOSS_DT ?new Date ( record.CLM_LOSS_DT) : '',
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

  this.menuService.getClaimRegFields(storedInstCode)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (fields) => {
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

          lovList.forEach(l => {
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
  }

  // ADD
  isLovField(columnName: string): boolean {
    return !!this.lovMap()[columnName];
  }

  // ADD
  getDropdownOptions(columnName: string): any[] {
    const raw = this.dropdownOptionsMap()[columnName] || [];
    return raw.map((row: any) => {
      const keys = Object.keys(row);
      return {
        value: row['PC_CODE'] ?? row[keys[0]],
        label: row[keys[1]] ?? row['PC_CODE']
      };
    });
  }

private mapRecordToFormData(record: any, fields: FieldConfig[]): any {
  const updated: any = {};
  fields.forEach(f => {
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

  this.fields().forEach(f => {
    let v = this.formData[f.COLUMN_NAME];
    if (v instanceof Date) v = v.toISOString();
    payload[f.COLUMN_NAME] = v;
  });

  // system-generated / fixed values that override form input
  payload.CLM_INTM_NO = null;
  payload.CLM_YEAR = now.getFullYear();
  payload.CLM_RECOVERY_YN = this.formData.CLM_RECOVERY_YN ? '1' : '0';
  payload.CLM_SALVAGE_YN = this.formData.CLM_SALVAGE_YN ? '1' : '0';
  payload.CLM_INTER_DIVN_YN = this.formData.CLM_INTER_DIVN_YN ? '1' : '0';
  payload.CLM_DIVN_CODE = '101';
  payload.CLM_STS = 'A';
  payload.CLM_CR_DT = now.toISOString();
  payload.CLM_CR_UID = 'TSHEPANDG';
  payload.CLM_COMP_CODE = '003';
  payload.CLM_DEPT_CODE = '10';
  payload.CLM_DS_TYPE = 4;
  payload.CLM_CLASS_CODE = sessionStorage.getItem('claimClassCode');

  this.menuService.saveClaimRegistration(payload)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => this.router.navigate(['/risk-details'], { queryParams: { sysId: this.sysId } }),
      error: (err) => console.error('Error saving claim registration', err)
    });
}

onEstDetailsClick(): void {
  this.router.navigate(['/est-details']);
}
onSettlementDetailsClick(): void {
  this.router.navigate(['/settlement-details']);
}


onNextClick(): void {
  this.router.navigate(['/risk-details'], {
    queryParams: { sysId: this.sysId }
  });
}
goBack(): void {
  const classCode = sessionStorage.getItem('claimClassCode') || '';
  this.router.navigate(['/claim-list', classCode]);
}
}