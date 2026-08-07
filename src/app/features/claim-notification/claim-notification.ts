import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { FieldConfig } from '../../core/models/model';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import { getVisibleFields, getInputType, isFieldEditable } from '../../core/utils/field-filter.util';

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

  classCode: string = '';
  classDesc: string = '';

  
 private readonly forceTextFields = ['CI_POL_NO'];
  lovMap = signal<{ [fieldName: string]: any }>({});
  dropdownOptionsMap = signal<{ [fieldName: string]: any[] }>({});

  getInputType = getInputType;
  isFieldEditable = isFieldEditable;

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


  saveClaim(): void {
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

    // ---- dynamic payload instead of hardcoded keys ----
    const payload: any = {};
    this.fields().forEach(f => {
      payload[f.COLUMN_NAME] = this.formData[f.COLUMN_NAME];
    });

    // keep any fields your backend always needs but aren't in the dynamic field list
    payload.CI_CR_DT = new Date().toISOString();
    payload.CI_CR_UID = 'ADMIN';
    // ---- end dynamic payload ----

    const request$ = this.isEdit && this.intmNo
      ? this.menuService.updateClaimIntimation(this.intmNo as any, payload)
      : this.menuService.saveClaimIntimation(payload);

    request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          console.log('Saved Successfully', res);
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
      return {
        value: row['PC_CODE'] ?? row[keys[0]],
        label: row[keys[1]] ?? row['PC_CODE']   // second key is the decode expression column
      };
    });
  }

  goBack(): void {
    this.router.navigate(['/claim-notification-list']);
  }


}