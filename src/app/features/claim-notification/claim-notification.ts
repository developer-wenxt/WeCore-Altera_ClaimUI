import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { FieldConfig } from '../../core/models/model';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import { getVisibleFields, getInputType, isFieldEditable, isFieldEditableIntimation } from '../../core/utils/field-filter.util';

@Component({
  selector: 'app-claim-notification',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './claim-notification.html',
  styleUrls: ['./claim-notification.scss'],
  providers: [UnSubscriber]
})
export class ClaimNotificationComponent extends UnSubscriber implements OnInit {
  fields = signal<FieldConfig[]>([]);
  loading = signal(true);

  isReadOnly = false;
  formData: any = {};
  isEdit = false;
  intmNo: string | null = null;

  dateError: string = '';

  dsCode: string = ''; 

  classCode: string = '';
  classDesc: string = '';


  private readonly forceTextFields: string[] = [];
  lovMap = signal<{ [fieldName: string]: any }>({});
  dropdownOptionsMap = signal<{ [fieldName: string]: any[] }>({});

  getInputType = getInputType;


  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit(): void {
    const menuId = this.route.snapshot.paramMap.get('menuId');
    this.classCode = sessionStorage.getItem('claimClassCode') || '';
    this.classDesc = sessionStorage.getItem('claimClassDesc') || '';
    this.isReadOnly = this.route.snapshot.queryParamMap.get('mode') === 'view';
    this.isEdit = this.route.snapshot.queryParamMap.get('mode') === 'edit';
    this.intmNo = this.route.snapshot.queryParamMap.get('intmNo');
    this.dsCode = sessionStorage.getItem('claimDsCode') || ''; 

    if (!this.isEdit && !this.isReadOnly) {
      this.formData['CI_DOC_DESP_YN'] = false;
      this.formData['CI_CLM_REGD_YN'] = false;
    }

    this.menuService.getLovFields('PGIT0007', 'PGIT_CLM_INTIMATION')
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

    this.menuService.getFields()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const visible = getVisibleFields(res);
          this.fields.set(visible);
          console.log('DATE FIELDS:', this.fields().filter(f => this.getInputType(f.SOURCE_DESIGN_TYPE, f.DATA_TYPE) === 'date').map(f => f.COLUMN_NAME));
          this.loading.set(false);
          console.log('FIELDS:', this.fields());

          if ((this.isEdit || this.isReadOnly) && this.intmNo) {
            this.menuService.getClaimIntimationById(this.intmNo)   // CHANGED (already a number now, no need for Number() again)
              .pipe(takeUntil(this.destroy$))
              .subscribe({
                next: (record) => {
                  console.log('API response record:', record);
                  const updated: any = {};
                  this.fields().forEach(f => {


                    let value = record[f.COLUMN_NAME] ?? '';
                    if (this.getInputType(f.SOURCE_DESIGN_TYPE, f.DATA_TYPE) === 'date' && value) {
                      value = new Date(value);
                    }
                    updated[f.COLUMN_NAME] = value;
                  });
                  this.formData = updated;
                  console.log('formData after mapping:', this.formData);
                  this.cdr.detectChanges();
                },
                error: (err) => console.error('Error loading claim by id', err)
              });
          }
        },
        error: (err) => {
          console.error('Fields API error:', err);
          this.loading.set(false);
        }
      });
  }



  canEditField(field: FieldConfig): boolean {
    if (this.isReadOnly) return false;

    if (field.COLUMN_NAME === 'CI_POL_NO' && !this.formData['CI_LOSS_DT']) {
      return false;
    }

    return this.isEdit
      ? isFieldEditableIntimation(field)  // UPDATE_YN === 2
      : isFieldEditable(field);           // ENTERABLE === 1
  }


  checkDateValidity(): void {
    const lossDate = this.formData['CI_LOSS_DT'];   // CHANGED
    const intmDate = this.formData['CI_INTM_DT'];   // CHANGED
    if (lossDate && intmDate && new Date(lossDate) > new Date(intmDate)) {
      this.dateError = 'Loss Date cannot be greater than Notification Date';
    } else {
      this.dateError = '';
    }
  }


  onPolicyDropdownOpen(): void {   // ADDED
    const lov = this.lovMap()['CI_POL_NO'];
    if (!lov) return;

    const lossDate = this.formData['CI_LOSS_DT'];
    const formattedDate = lossDate ? this.formatDate(lossDate) : '';   // CHANGED
    this.menuService.getDropdownValues(lov.PLD_PROG_CODE, lov.PLD_BLOCK_NAME, lov.PLD_FIELD_NAME, formattedDate)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (values) => {
          const current = this.dropdownOptionsMap();
          this.dropdownOptionsMap.set({ ...current, CI_POL_NO: values });
        },
        error: (err) => console.error('Error loading policy options', err)
      });
  }


  private formatDate(date: any): string {   // ADDED
    const d = new Date(date);
    const day = d.getDate();
    const month = d.getMonth() + 1;
    const year = d.getFullYear();
    return `${month}/${day}/${year}`;   // e.g. 26/3/26
  }

  saveClaim(): void {
    const missing = this.fields()
      .filter(f => f.MANDATORY === 1)
      .filter(f => f.COLUMN_NAME !== 'CI_DOC_DESP_YN' && f.COLUMN_NAME !== 'CI_CLM_REGD_YN')
      .filter(f => {
        const v = this.formData[f.COLUMN_NAME];
        return v === null || v === undefined || v === '';
      });

    if (missing.length > 0) {
      alert('Please fill mandatory fields: ' + missing.map(f => f.FIELD_PROMPT).join(', '));
      return;
    }


    if (this.dateError) {
      alert(this.dateError);
      return;
    }

    // ---- dynamic payload instead of hardcoded keys ----
    const payload: any = {};
    this.fields().forEach(f => {
      payload[f.COLUMN_NAME] = this.formData[f.COLUMN_NAME];
    });

    // checked = '1', unchecked = '0'
    if ('CI_DOC_DESP_YN' in payload) {
      payload['CI_DOC_DESP_YN'] = this.formData['CI_DOC_DESP_YN'] ? '1' : '0';
    }
    if ('CI_CLM_REGD_YN' in payload) {
      payload['CI_CLM_REGD_YN'] = this.formData['CI_CLM_REGD_YN'] ? '1' : '0';
    }

    // hardcoded values
    payload.CI_CR_UID = 'TSHEPANDG';
    payload.CI_COMP_CODE = '001';
    payload.CI_DEPT_CODE = '10';
    payload.CI_DIVN_CODE = '101';
    payload.CI_DS_CODE = this.dsCode;  
    payload.CI_DS_TYPE = 10;
    payload.CI_ADDR_01 = 'null';
    payload.CI_CR_DT = new Date().toISOString();

    const request$ = this.isEdit && this.intmNo
      ? this.menuService.updateClaimIntimation(this.intmNo as any, payload)
      : this.menuService.saveClaimIntimation(payload);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          const intmNo = res?.data?.data?.data?.CI_INTM_NO;
          if (intmNo) {
            this.formData['CI_INTM_NO'] = intmNo;
            this.intmNo = intmNo;      // ADD THIS BACK
            this.isEdit = true;

            this.cdr.detectChanges();
          }
          alert('Claim Notification Saved Successfully');
        },
        error: (err) => {
          console.error('Save Failed', err);
        }
      });
  }


  isLovField(columnName: string): boolean {
    if (this.forceTextFields.includes(columnName)) return false;
    return !!this.lovMap()[columnName];
  }


  getDropdownOptions(columnName: string): any[] {
  const raw = this.dropdownOptionsMap()[columnName] || [];
  return raw.map((row: any) => {
    const keys = Object.keys(row);
    if (columnName === 'CI_POL_NO') {
      return {
        label: row.POLH_NO,
        value: row.POLH_NO
      };
    }
    const code = row[keys[0]];
    const desc = row[keys[1]];
    return {
      label: `${code} - ${desc}`,  
      value: code                 
    };
  });
}

  goBack(): void {
    this.router.navigate(['/claim-notification-list']);
  }


}