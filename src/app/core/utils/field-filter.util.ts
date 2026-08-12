import { FieldConfig } from '../models/model';


export function getVisibleFields(fields: FieldConfig[]): FieldConfig[] {
  return fields.filter(f => f.MANDATORY === 1 || f.HIDE_FIELD_YES === 2)
  
   .sort((a, b) => a.DISPLAY_ORDER_NO - b.DISPLAY_ORDER_NO);;
}


export function getInputType(sourceDesignType: string, dataType: string, columnName?: string): string {

  
  if (columnName === 'CLM_LOSS_DT') {
    return 'date';
  }

  if (sourceDesignType === 'C') {
    return 'checkbox';
  }

  if (sourceDesignType === 'T'  && dataType === 'D') {
    return 'date';
  }

   if (sourceDesignType === 'T' && dataType === 'N') {
    return 'number';
  }

  return 'text';
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
  return  field.ENTERABLE === 1;
}  

export function isFieldEditableIntimation(field: FieldConfig): boolean {
  return field.UPDATE_YN === 2 ;
}  


