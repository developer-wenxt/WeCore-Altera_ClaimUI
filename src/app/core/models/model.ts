export interface MenuItem {
  CLM_INTM_MENU_NAME: string;
  PARENT_MENU_ID: string;
  MENU_ID: string;
  CLM_INTM_PRODUCT: string;
  CLM_INTM_DS_CODE: string;
  PRODUCT_CODE: string;
  PRODUCT_DESC: string;
  CLM_DEPT_CODE: string;
  CLASS_CODE: string;
  CLASS_DESC: string;
  CLM_TYPE: string;
  CLM_INTM_INST_CODE: string;
}

export interface ClaimMenuItem {
  CLM_MENU_NAME: string;
  PARENT_MENU_ID: string;
  MENU_ID: string;
  CLM_PRODUCT: string;
  CLM_DS_CODE: string;
  PRODUCT_CODE: string;
  PRODUCT_DESC: string;
  CLM_DEPT_CODE: string;
  CLASS_CODE: string;
  CLASS_DESC: string;
  CLM_TYPE: string | null;
  CLM_INST_CODE: string;
  CLM_SETL_INST_CODE: string;
}


export interface FieldConfig {
  COLUMN_NAME: string;
  INSTANCE_CODE: string;
  PROGRAM_CODE: string;
  TABLE_NAME: string;
  FIELD_PROMPT: string;
  DISPLAY_ORDER_NO: number;
  MANDATORY: number;
  DATA_TYPE: string;
  SOURCE_DESIGN_TYPE: string;
  FIELD_LENGTH: number;
  DISPLAY_LENGTH: number;
  ENTERABLE: number;
  UPDATE_YN: number;
  TOOL_TIP: string;
  HIDE_FIELD_YES: number;
  CANVA_NAME: string;
  TABLE_COLUMN: number | null;
}

export interface ClaimIntimation {
  CI_INTM_NO: string;
  CI_INTM_NAME: string | null;
  CI_ASSR_NAME: string | null;
  CI_POL_NO: string | null;
  CI_LOSS_DT: string;
  CI_INTM_DT: string;
  CI_CR_DT: string;
}

export interface Claim {
  CLM_SYS_ID: number;
  CLM_INTM_NO: string;
  CLM_NO: string;
  CLM_POL_NO: string;
  CLM_PROD_CODE: string;
  CLM_STS: string;
  CLM_ASSR_NAME: string;
  CLM_LOSS_DT: string;
  CLM_INTM_DT: string;
  CLM_CR_DT: string;
}