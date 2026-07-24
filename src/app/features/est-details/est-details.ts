import { Component, OnInit, signal } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { FieldConfig } from '../../core/models/model';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import { getEstDetailColumns, isFieldEditable } from '../../core/utils/field-filter.util';

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
    showMoreDialog = signal(false); 
     activeRowIndex = signal<number | null>(null);

     clmapSysId: number | null = null;
     clmSysId: number | null = null;

  constructor(private menuService: MenuService,
     private router: Router,
      private route: ActivatedRoute 

  ) {
    super();
  }

  ngOnInit(): void {

    this.clmapSysId = Number(this.route.snapshot.queryParamMap.get('clmapSysId')) || null; 
     this.clmSysId = Number(this.route.snapshot.queryParamMap.get('sysId')) || null;
    this.menuService.getEstDetailFields()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields) => {
           const filtered = getEstDetailColumns(fields);  
          this.tableColumns.set(getEstDetailColumns(fields));
          this.loading.set(false);
          this.loadEstRows();
        },
        error: (err) => {
          console.error('Error loading estimation detail fields:', err);
          this.loading.set(false);
        }
      });
  }

  private loadEstRows(): void {
    if (!this.clmapSysId) {
      this.loading.set(false);
      return;
    }

    this.menuService.getEstDetailsByClmap(this.clmapSysId)
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
          console.error('Error loading estimation detail rows:', err);
          this.loading.set(false);
        }
      });
  }

  addRow(): void {
    this.gridRows.update(rows => [...rows, {}]);
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
  const row = this.gridRows()[index];
  this.menuService.updateEstDetail(row)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => console.log('Row saved successfully'),
      error: (err) => console.error('Error saving estimation row', err)
    });
}

  goBack(): void {
  this.router.navigate(['/risk-details'], {
    queryParams: { sysId: this.clmSysId }   
  });
}
}