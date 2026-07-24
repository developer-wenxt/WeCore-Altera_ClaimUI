import { FieldConfig } from '../models/model';


export function getVisibleFields(fields: FieldConfig[]): FieldConfig[] {
  return fields.filter(f => f.MANDATORY === 1 || f.HIDE_FIELD_YES === 2)
  
   .sort((a, b) => a.DISPLAY_ORDER_NO - b.DISPLAY_ORDER_NO);;
}
export function getInputType(dataType: string): string {
  switch (dataType) {
    case 'C': return 'checkbox';
    case 'D': return 'date';
    default: return 'text';
  }
}

export function getVisibleFieldsSorted(fields: FieldConfig[]): FieldConfig[] {
  return fields
    .filter(f => f.HIDE_FIELD_YES === 2)
    .sort((a, b) => a.DISPLAY_ORDER_NO - b.DISPLAY_ORDER_NO);
}

export function getTableColumnFields(fields: FieldConfig[]): FieldConfig[] {
  return fields
    .filter(f => f.TABLE_COLUMN === 1)
    .sort((a, b) => a.DISPLAY_ORDER_NO - b.DISPLAY_ORDER_NO);
}

export function getEstDetailColumns(fields: FieldConfig[]): FieldConfig[] {
  return fields
    .filter(f => f.HIDE_FIELD_YES === 2)
    .sort((a, b) => a.DISPLAY_ORDER_NO - b.DISPLAY_ORDER_NO);
}

export function getSettlementColumns(fields: FieldConfig[]): FieldConfig[] {
  return fields
    .filter(f => f.HIDE_FIELD_YES === 2)
    .sort((a, b) => a.DISPLAY_ORDER_NO - b.DISPLAY_ORDER_NO);
}

export function isFieldEditable(field: FieldConfig): boolean {
  return field.UPDATE_YN === 1;
}