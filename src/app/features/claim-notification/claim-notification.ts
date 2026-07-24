import { Component, OnInit, signal ,ChangeDetectorRef  } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router'; 
import { takeUntil } from 'rxjs/operators';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { FieldConfig } from '../../core/models/model';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import { getVisibleFields,getInputType , isFieldEditable } from '../../core/utils/field-filter.util';

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
sysId: number | null = null;   

lovMap = signal<{ [fieldName: string]: any }>({});
dropdownOptionsMap = signal<{ [fieldName: string]: any[] }>({}); 

    getInputType = getInputType;
     isFieldEditable = isFieldEditable;

  constructor(
    private menuService: MenuService,
    private route: ActivatedRoute,
    private router: Router ,
      private cdr: ChangeDetectorRef   
  ) {
    super();
  }

 ngOnInit(): void {
  const menuId = this.route.snapshot.paramMap.get('menuId');
  this.isReadOnly = this.route.snapshot.queryParamMap.get('mode') === 'view'; 
  this.isEdit = this.route.snapshot.queryParamMap.get('mode') === 'edit';
  this.sysId = Number(this.route.snapshot.queryParamMap.get('sysId'));

  console.log('menuId =', menuId);
  console.log('isEdit =', this.isEdit);      // CHANGED
  console.log('sysId =', this.sysId);        // CHANGED

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

    if ((this.isEdit || this.isReadOnly) && this.sysId) {
          this.menuService.getClaimById(this.sysId)   // CHANGED (already a number now, no need for Number() again)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (record) => {
                console.log('API response record:', record);
                const updated: any = {};
                this.fields().forEach(f => {
                  let value = record[f.COLUMN_NAME] ?? '';
                  if (this.getInputType(f.SOURCE_DESIGN_TYPE) === 'date' && value) {
                    value = new Date(value).toISOString().slice(0, 16);
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
  const payload = {
    CI_LOSS_DT: this.formData.CI_LOSS_DT,
    CI_INTM_DT: this.formData.CI_INTM_DT,
    CI_ADDR_01: this.formData.CI_ADDR_01,
    CI_CR_DT: new Date().toISOString(),
    CI_CR_UID: 'ADMIN',
    CI_DS_TYPE: this.formData.CI_DS_TYPE,
    CI_DS_CODE: this.formData.CI_DS_CODE,
    CI_LOSS_REMARKS: this.formData.CI_LOSS_REMARKS,
    CI_COMP_CODE: this.formData.CI_COMP_CODE,
    CI_DIVN_CODE: this.formData.CI_DIVN_CODE,
    CI_DEPT_CODE: this.formData.CI_DEPT_CODE
  };

  const request$ = this.isEdit && this.sysId
    ? this.menuService.updateClaimIntimation(this.sysId, payload)
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