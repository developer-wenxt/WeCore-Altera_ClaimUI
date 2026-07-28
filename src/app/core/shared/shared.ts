import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';

// Add only the specific PrimeNG modules your application needs here
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { Select } from 'primeng/select';
import { MenuModule } from 'primeng/menu';
import { DatePicker } from 'primeng/datepicker';

// Single source of truth for all shared imports across the app
export const SHARED_IMPORTS = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  ButtonModule,
  InputTextModule,
  InputNumber,
  TableModule,
  CardModule,
  DialogModule,
   Select ,
   MenuModule,
   DatePicker
];