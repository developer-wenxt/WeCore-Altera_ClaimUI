import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { FieldConfig } from '../../core/models/model';
import { MenuItem } from 'primeng/api';import { SHARED_IMPORTS } from '../../core/shared/shared';
import { getSettlementColumns, getTableColumnFields, getInputType } from '../../core/utils/field-filter.util';
import { ActivatedRoute } from '@angular/router';
import { GlobalMessageService } from '../../core/services/GlobalMessageService';


const CLAIM_HEADER_FIELDS = [
  { "COLUMN_NAME": "CLM_POL_NO", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Policy No", "DISPLAY_ORDER_NO": 1, "MANDATORY": 1, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 60, "DISPLAY_LENGTH": 235, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Enter the Policy Number", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_ORPHAN_YN", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Orphan", "DISPLAY_ORDER_NO": 2, "MANDATORY": 1, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "C", "FIELD_LENGTH": 1, "DISPLAY_LENGTH": 10, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Orphan Claim (Y/N)", "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_NO", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Claim No", "DISPLAY_ORDER_NO": 3, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 60, "DISPLAY_LENGTH": 235, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "System Generated Claim Number", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_INTM_NO", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Notification No", "DISPLAY_ORDER_NO": 4, "MANDATORY": 1, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 60, "DISPLAY_LENGTH": 215, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Select/Enter the Intimation Nu", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_DIVN_CODE", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "CPO", "DISPLAY_ORDER_NO": 5, "MANDATORY": 1, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 12, "DISPLAY_LENGTH": 72, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Claim Processing Office Code", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_POL_DIVN_CODE", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "PIO", "DISPLAY_ORDER_NO": 6, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 12, "DISPLAY_LENGTH": 72, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Policy Issuing Office Code", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_LOSS_DT", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Date of Loss", "DISPLAY_ORDER_NO": 7, "MANDATORY": 1, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 30, "DISPLAY_LENGTH": 82, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_DISCOVERY_DT", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Discovery Date", "DISPLAY_ORDER_NO": 8, "MANDATORY": 2, "DATA_TYPE": "D", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 11, "DISPLAY_LENGTH": 77, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Enter Date of Discovery", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_INTM_DT", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Notification Dt", "DISPLAY_ORDER_NO": 9, "MANDATORY": 1, "DATA_TYPE": "D", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 20, "DISPLAY_LENGTH": 100, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Enter the Intimation Date", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_CLAIMED_AMT_FC", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Amt. Claimed", "DISPLAY_ORDER_NO": 10, "MANDATORY": 2, "DATA_TYPE": "N", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 22, "DISPLAY_LENGTH": 135, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Enter the Amount Claimed", "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_INIT_EST_FC", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Provision Amt.", "DISPLAY_ORDER_NO": 11, "MANDATORY": 2, "DATA_TYPE": "N", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 22, "DISPLAY_LENGTH": 135, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Initial Estimate Amount", "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_SPUDDING_DT", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Spudding Dt", "DISPLAY_ORDER_NO": 12, "MANDATORY": 2, "DATA_TYPE": "D", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 20, "DISPLAY_LENGTH": 72, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Enter Spudding date", "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_ASSR_CODE", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Assured Code", "DISPLAY_ORDER_NO": 13, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 12, "DISPLAY_LENGTH": 72, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Assured Code", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_LOSS_CODE", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Nature of Loss", "DISPLAY_ORDER_NO": 15, "MANDATORY": 1, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 12, "DISPLAY_LENGTH": 72, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Enter the Loss Code", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_TYP_OF_CLM", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Type Of Claim", "DISPLAY_ORDER_NO": 17, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 30, "DISPLAY_LENGTH": 72, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Enter the Type Of Claim", "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_CAUSE_LOSS", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Cause of Loss", "DISPLAY_ORDER_NO": 19, "MANDATORY": 1, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 12, "DISPLAY_LENGTH": 72, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Enter the Cause of Loss", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_EVENT_CODE", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Event Code", "DISPLAY_ORDER_NO": 21, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 12, "DISPLAY_LENGTH": 72, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Select/Enter the Event Code", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_LOSS_REMARKS", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Loss Desc", "DISPLAY_ORDER_NO": 23, "MANDATORY": 1, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 4000, "DISPLAY_LENGTH": 236, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Enter Remarks", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_REINST_TYPE", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Reinstate Type", "DISPLAY_ORDER_NO": 24, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "L", "FIELD_LENGTH": 12, "DISPLAY_LENGTH": 109, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Enter Reinst Type", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_CLF_LF_NO", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "LF Number", "DISPLAY_ORDER_NO": 25, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 20, "DISPLAY_LENGTH": 142, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Enter Claim LF Number", "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_APPR_DT", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Approval Dt", "DISPLAY_ORDER_NO": 26, "MANDATORY": 1, "DATA_TYPE": "D", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 20, "DISPLAY_LENGTH": 100, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Date of Approval", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_INIT_EST_LC_1", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "LC", "DISPLAY_ORDER_NO": 27, "MANDATORY": 2, "DATA_TYPE": "N", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 22, "DISPLAY_LENGTH": 135, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Initial Estimation Amount in L", "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_MRTA_YN", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "MRTA", "DISPLAY_ORDER_NO": 28, "MANDATORY": 1, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "C", "FIELD_LENGTH": 1, "DISPLAY_LENGTH": 11, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Select MRTA Flag", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_RECOVERY_YN", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Recovery", "DISPLAY_ORDER_NO": 28, "MANDATORY": 1, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "C", "FIELD_LENGTH": 1, "DISPLAY_LENGTH": 11, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Select Recovery Flag", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_MRTA_NO", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "MRTA No", "DISPLAY_ORDER_NO": 28, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "C", "FIELD_LENGTH": 1, "DISPLAY_LENGTH": 100, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Enter  MRTA No", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_REINST_REQD_YN", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Reinst Reqd YN", "DISPLAY_ORDER_NO": 29, "MANDATORY": 1, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "C", "FIELD_LENGTH": 1, "DISPLAY_LENGTH": 10, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Reinstatement Required or Not?", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_SUIT_YN", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Suit", "DISPLAY_ORDER_NO": 29.5, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "C", "FIELD_LENGTH": 1, "DISPLAY_LENGTH": 10, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Whether it is a Suit or not?", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_CURR_CODE", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Currency Code", "DISPLAY_ORDER_NO": 30, "MANDATORY": 1, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 12, "DISPLAY_LENGTH": 72, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Enter the Claim Currency Code", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_POL_REF_NO", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Police Ref. No.", "DISPLAY_ORDER_NO": 32, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 60, "DISPLAY_LENGTH": 105, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_POL_STAT_CODE", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Police Station", "DISPLAY_ORDER_NO": 33, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 12, "DISPLAY_LENGTH": 73, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_ADJUSTOR_CODE", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Adjustor", "DISPLAY_ORDER_NO": 35, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 30, "DISPLAY_LENGTH": 73, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Enter the adjustor code", "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_PROD_CODE", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Product Code", "DISPLAY_ORDER_NO": 37, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 12, "DISPLAY_LENGTH": 72, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Product Code", "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_CUST_CODE", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Customer Code", "DISPLAY_ORDER_NO": 42, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 12, "DISPLAY_LENGTH": 72, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": "Customer Code", "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_01", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Marketer Code", "DISPLAY_ORDER_NO": 46, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 240, "DISPLAY_LENGTH": 72, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": "Enter Marketer Code", "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_02", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Claim Status", "DISPLAY_ORDER_NO": 47, "MANDATORY": 1, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 72, "DISPLAY_LENGTH": 72, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 2, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_04", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Clm Flexi 04", "DISPLAY_ORDER_NO": 49, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 240, "DISPLAY_LENGTH": 102, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_05", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Clm Flexi 05", "DISPLAY_ORDER_NO": 50, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 240, "DISPLAY_LENGTH": 93, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_CLAIMED_AMT_LC_1", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Claimed Amt Lc", "DISPLAY_ORDER_NO": 51, "MANDATORY": 2, "DATA_TYPE": "N", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 22, "DISPLAY_LENGTH": 72, "ENTERABLE": 2, "UPDATE_YN": 2, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_06", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Clm Flexi 06", "DISPLAY_ORDER_NO": 52, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 240, "DISPLAY_LENGTH": 105, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_07", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Clm Flexi 07", "DISPLAY_ORDER_NO": 53, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 240, "DISPLAY_LENGTH": 105, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_08", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Clm Flexi 08", "DISPLAY_ORDER_NO": 54, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 240, "DISPLAY_LENGTH": 105, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_09", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Clm Flexi 09", "DISPLAY_ORDER_NO": 55, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 240, "DISPLAY_LENGTH": 105, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_10", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Clm Flexi 10", "DISPLAY_ORDER_NO": 56, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 240, "DISPLAY_LENGTH": 105, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_11", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Clm Flexi 10", "DISPLAY_ORDER_NO": 57, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 240, "DISPLAY_LENGTH": 105, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_12", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Clm Flexi 10", "DISPLAY_ORDER_NO": 58, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 240, "DISPLAY_LENGTH": 105, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_13", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Clm Flexi 10", "DISPLAY_ORDER_NO": 59, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 240, "DISPLAY_LENGTH": 105, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_14", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Clm Flexi 10", "DISPLAY_ORDER_NO": 60, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 240, "DISPLAY_LENGTH": 105, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null },
  { "COLUMN_NAME": "CLM_FLEXI_15", "INSTANCE_CODE": "PGIT8000-004", "PROGRAM_CODE": "PGIT8000", "TABLE_NAME": "PGIT_CLAIM", "FIELD_PROMPT": "Clm Flexi 10", "DISPLAY_ORDER_NO": 61, "MANDATORY": 2, "DATA_TYPE": "C", "SOURCE_DESIGN_TYPE": "T", "FIELD_LENGTH": 240, "DISPLAY_LENGTH": 105, "ENTERABLE": 1, "UPDATE_YN": 1, "TOOL_TIP": null, "HIDE_FIELD_YES": 1, "CANVA_NAME": "PGIT_CLAIM", "TABLE_COLUMN": null }
];

const HARDCODED_HEADER_FIELDS = [
  { COLUMN_NAME: 'CLM_SETL_TYPE_CODE', FIELD_PROMPT: 'Settle Type', MANDATORY: 1, INPUT_TYPE: 'text' },
  { COLUMN_NAME: 'CLM_DOC_SUBMISSION_DT', FIELD_PROMPT: 'Date of Doc Submission', MANDATORY: 2, INPUT_TYPE: 'date' },
  { COLUMN_NAME: 'CLM_SALVAGE_YN', FIELD_PROMPT: 'Salvage', MANDATORY: 2, INPUT_TYPE: 'checkbox' }
];

@Component({
  selector: 'app-settlement-details',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './settlement-details.html',
  styleUrls: ['./settlement-details.scss'],
  providers: [UnSubscriber]
})
export class SettlementDetailsComponent extends UnSubscriber implements OnInit {
  tableColumns = signal<FieldConfig[]>([]);
  gridRows = signal<any[]>([{}]);
  loading = signal(true);
  showMoreDialog = signal(false);
  activeRowIndex = signal<number | null>(null);
  getInputType = getInputType;
  reasonCodeOptions = signal<any[]>([]);

  // Risk Details logic
  riskTableColumns = signal<FieldConfig[]>([]);

  lovMap = signal<{ [fieldName: string]: any }>({});
dropdownOptionsMap = signal<{ [fieldName: string]: any[] }>({});

  trackByIndex(index: number, item: any): number { return index; }
  trackByColName(index: number, col: any): string | number { return col?.COLUMN_NAME || index; }

  claimHeaderFields = signal<any[]>([
    ...CLAIM_HEADER_FIELDS
      .filter(f => ['CLM_NO', 'CLM_LOSS_DT', 'CLM_PROD_CODE', 'CLM_RECOVERY_YN'].includes(f.COLUMN_NAME))   // CHANGED — removed CLM_POL_NO
      .map(f => f.COLUMN_NAME === 'CLM_RECOVERY_YN' ? { ...f, INPUT_TYPE: 'checkbox' } : f),
    ...HARDCODED_HEADER_FIELDS
  ]);

  riskGridRows = signal<any[]>([{}]);
  riskLoading = signal(true);
  clmSysId: number | null = null;

  clmapSysId: number | null = null;

  prodCode: string = '';
  polNo: string = '';
  classDesc: string = '';
  custCode: string = '';
  custDesc: string = '';

  activeMenuRow: number | null = null;

  custDisplay: string = '';

  showApproveDialog = signal(false);
  approveRowIndex = signal<number | null>(null);

  approveFormData: any = {
    CS_APPR_DT: new Date(),
    CS_GEN_CLM_AC_YN: false,
    CS_GEN_CLM_COINS_AC_YN: false,
    CS_FINAL_YN: false,
    CLM_CLOSE_REASON_CODE: '',
    CLM_CLOSE_REMARKS: ''
  };






  isReadOnly = false;

  constructor(
    private menuService: MenuService,
    private router: Router,
    private route: ActivatedRoute,
    private msgService: GlobalMessageService
  ) {
    super();
  }

  ngOnInit(): void {
    this.isReadOnly = this.route.snapshot.queryParamMap.get('mode') === 'view';
    this.rowMenuItems = this.isReadOnly
  ? [
      { label: 'More', icon: 'pi pi-external-link', command: () => this.openMoreDialog(this.activeMenuRow!) },
      { label: 'Approve', icon: 'pi pi-check', command: () => this.openApproveDialog(this.activeMenuRow!) }
    ]
  : [
      { label: 'Save', icon: 'pi pi-save', command: () => this.saveRow(this.activeMenuRow!) },
      { label: 'More', icon: 'pi pi-external-link', command: () => this.openMoreDialog(this.activeMenuRow!) },
      { label: 'Approve', icon: 'pi pi-check', command: () => this.openApproveDialog(this.activeMenuRow!) }
    ];
    this.menuService.getDropdownValues('PGIT0010', 'PGIT_CLM_SETL', 'CLM_CLOSE_REASON_CODE')
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (opts) => this.reasonCodeOptions.set(opts || []),
        error: (err) => console.error('Error loading reason code options', err)
      });
    const headerData = sessionStorage.getItem('claimHeaderData');
    if (headerData) {
      const parsed = JSON.parse(headerData);
      this.prodCode = parsed.CLM_PROD_CODE || '';
      this.polNo = parsed.CLM_POL_NO || '';
    }
    this.classDesc = sessionStorage.getItem('claimClassDesc') || '';
    this.custCode = sessionStorage.getItem('claimCustCode') || '';
    this.menuService.getSettlementFields()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields) => {
          this.tableColumns.set(getSettlementColumns(fields));
          this.loading.set(false);
          this.loadSettlementRows();   // ADD — fetch data after columns load
        },
        error: (err) => {
          console.error('Error loading settlement fields:', err);
          this.loading.set(false);
        }
      });

    this.clmSysId = Number(this.route.snapshot.queryParamMap.get('sysId')) ||
      Number(sessionStorage.getItem('claimSysId')) || null;

    this.clmapSysId = Number(this.route.snapshot.queryParamMap.get('clmapSysId')) || null;   // ADD


    if (this.clmSysId) {
      this.menuService.getClaimRegById(this.clmSysId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (record) => {
            this.claimHeaderData.set({
              ...record,
              CLM_DOC_SUBMISSION_DT: record.CLM_DOC_SUBMISSION_DT ? new Date(record.CLM_DOC_SUBMISSION_DT) : '',
              CLM_SALVAGE_YN: record.CLM_SALVAGE_YN === '1',
              CLM_RECOVERY_YN: record.CLM_RECOVERY_YN === '1'
            });
          },
          error: (err) => console.error('Error loading claim record for header', err)
        });
    }

    this.menuService.getRiskDetailFields()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (fields) => {
          const filtered = getTableColumnFields(fields);
          this.riskTableColumns.set(filtered);
          this.riskLoading.set(false);
          this.loadRiskRows();
        },
        error: (err) => {
          console.error('Error loading risk detail fields:', err);
          this.riskLoading.set(false);
        }
      });


      this.menuService.getDropdownValues('PGIT8000', 'PGIT_CLM_EST', 'CE_CUST_CODE')
  .pipe(takeUntil(this.destroy$))
  .subscribe({
    next: (values) => {
      this.dropdownOptionsMap.set({
        ...this.dropdownOptionsMap(),
        CS_CUST_CODE: values,
        CS_ASSR_CODE: values   // same option list reused for Payee Code
      });
      this.lovMap.set({
        ...this.lovMap(),
        CS_CUST_CODE: true,
        CS_ASSR_CODE: true
      });
    },
    error: (err) => console.error('Error loading customer/payee dropdown', err)
  });
  }


  rowMenuItems: MenuItem[] = [
    {
      label: 'Save',
      icon: 'pi pi-save',
      command: () => this.saveRow(this.activeMenuRow!)
    },
    {
      label: 'More',
      icon: 'pi pi-external-link',
      command: () => this.openMoreDialog(this.activeMenuRow!)
    },
    {
      label: 'Approve',
      icon: 'pi pi-check',
      command: () => this.openApproveDialog(this.activeMenuRow!)
    }
  ];


  isLovField(columnName: string): boolean {
  return !!this.lovMap()[columnName];
}

getDropdownOptions(columnName: string): any[] {
  const raw = this.dropdownOptionsMap()[columnName] || [];
  return raw.map((row: any) => {
    const keys = Object.keys(row);
    const code = row[keys[0]];
    const desc = row[keys[1]];
    return { label: desc ? `${code} - ${desc}` : `${code}`, value: code };
  });
}

  // openApproveDialog() stays simple — no API call here anymore:
  openApproveDialog(index: number): void {
    this.approveRowIndex.set(index);
    const row = this.gridRows()[index] || {};
    this.approveFormData = {
      CS_APPR_DT: row.CS_APPR_DT ? new Date(row.CS_APPR_DT) : new Date(),
      CS_GEN_CLM_AC_YN: row.CS_GEN_CLM_AC_YN === '1' || row.CS_GEN_CLM_AC_YN === true,
      CS_GEN_CLM_COINS_AC_YN: row.CS_GEN_CLM_COINS_AC_YN === '1' || row.CS_GEN_CLM_COINS_AC_YN === true,
      CS_FINAL_YN: row.CS_FINAL_YN === '1' || row.CS_FINAL_YN === true,
      CLM_CLOSE_REASON_CODE: row.CLM_CLOSE_REASON_CODE || '',
      CLM_CLOSE_REMARKS: row.CLM_CLOSE_REMARKS || ''
    };
    this.showApproveDialog.set(true);
  }

  saveRow(index: number): void {
     if (this.isReadOnly) return; 
    const row = { ...this.gridRows()[index] };
    row.CS_CLMAP_SYS_ID = this.clmapSysId;

    const missing = this.tableColumns()
      .filter(col => col.MANDATORY === 1)
      .filter(col => this.getInputType(col.SOURCE_DESIGN_TYPE, col.DATA_TYPE) !== 'checkbox')
      .filter(col => {
        const v = row[col.COLUMN_NAME];
        return v === null || v === undefined || v === '';
      });

    if (missing.length > 0) {
      this.msgService.show('error', 'Validation Error', 'Please fill mandatory fields: ' + missing.map(f => f.FIELD_PROMPT).join(', '));
      return;
    }

    this.tableColumns().forEach(col => {
      if (this.getInputType(col.SOURCE_DESIGN_TYPE, col.DATA_TYPE) === 'checkbox') {
        row[col.COLUMN_NAME] = row[col.COLUMN_NAME] ? '1' : '0';
      }
    });

    this.menuService.saveSettlementDetail(row, row.CS_SYS_ID)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => console.log('Settlement row saved successfully'),
        error: (err) => console.error('Error saving settlement row', err)
      });
  }



  private loadSettlementRows(): void {
    console.log('loadSettlementRows called, clmapSysId =', this.clmapSysId);
    if (!this.clmapSysId) {
      this.loading.set(false);
      return;
    }

    // First fetch estimation to get CE_SYS_ID
    this.menuService.getEstDetailsByClmap(this.clmapSysId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (estRes: any) => {
          const estData = estRes && estRes.length > 0 ? estRes[0] : null;
          const ceSysId = estData ? estData.CE_SYS_ID : null;

          if (estData && estData.CE_CUST_CODE) {
  this.custCode = estData.CE_CUST_CODE;
  this.menuService.getDropdownValues('PGIT8000', 'PGIT_CLM_EST', 'CE_CUST_CODE')
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (values: any[]) => {
        if (values && values.length) {
          const row = values.find(v => {
            const keys = Object.keys(v);
            return v[keys[0]] === this.custCode;
          });
          if (row) {
            const keys = Object.keys(row);
            this.custDesc = row[keys[1]] || '';
          }
        }
        // ADD — build combined display string and patch any rows already in the grid
        this.custDisplay = this.custDesc ? `${this.custCode} - ${this.custDesc}` : this.custCode;
        this.gridRows.update(rows => rows.map(r => ({
          ...r,
          CS_CUST_CODE: r.CS_CUST_CODE || this.custCode,
          CS_ASSR_CODE: r.CS_ASSR_CODE || this.custCode
        })));
      }
    });
}

         if (!ceSysId) {
  console.warn('No estimation found for this risk row. Cannot load settlement.');
  const display = this.custDisplay || this.custCode;
this.gridRows.set([{
  CS_CUST_CODE: this.custCode,   // Customer Code
  CS_ASSR_CODE: this.custCode,   // Payee Code — same value
  CS_DT: new Date()
}]);
  this.loading.set(false);
  return;
}

          // Now fetch settlement using ceSysId
          this.menuService.getSettlementDetailsByClaim(ceSysId)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (res: any) => {
                console.log('Settlement raw response:', res);

                const dataObj = res?.data?.data || {};
                const sortedKeys = Object.keys(dataObj).sort((a, b) => Number(a) - Number(b));

                const rows: any[] = [];
                sortedKeys.forEach(key => {
                  dataObj[key].forEach((entry: any) => rows.push(this.normalizeSettlementRow(entry)));
                });

                                  const display = this.custDisplay || this.custCode;
                                        const finalRows = (rows.length ? rows : [{ CS_DT: new Date() }]).map(r => ({
                      ...r,
                      CS_CUST_CODE: r.CS_CUST_CODE || this.custCode,   // Customer Code
                      CS_ASSR_CODE: r.CS_ASSR_CODE || this.custCode,   // Payee Code — same value
                      CS_DT: r.CS_DT || new Date()
                    }));
                    this.gridRows.set(finalRows);
                  this.loading.set(false);
              },
              error: (err) => {
                console.error('Error loading settlement rows:', err);
                this.loading.set(false);
              }
            });
        },
        error: (err) => {
          console.error('Error fetching estimation for settlement:', err);
          this.gridRows.set([{}]);
          this.loading.set(false);
        }
      });
  }


  claimHeaderData = signal<any>(
    JSON.parse(sessionStorage.getItem('claimHeaderData') || '{}')
  );



  private loadRiskRows(): void {
    if (!this.clmSysId) {
      this.riskLoading.set(false);
      return;
    }

    this.menuService.getRiskDetailsByClaim(this.clmSysId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const rawData = res?.data?.data;
          let rows: any[] = [];

          // ADD — handle all shapes: flat array, object-of-arrays, or object-of-single-entries
          if (Array.isArray(rawData)) {
            rows = rawData.map((entry: any) => this.normalizeRiskRow(entry));
          } else if (rawData && typeof rawData === 'object') {
            Object.keys(rawData).forEach(key => {
              const val = rawData[key];
              if (Array.isArray(val)) {
                val.forEach((entry: any) => rows.push(this.normalizeRiskRow(entry)));
              } else if (val && typeof val === 'object') {
                rows.push(this.normalizeRiskRow(val));   // ADD — single object per key, not an array
              }
            });
          }

          const filteredRows = this.clmapSysId
            ? rows.filter(r => String(r.CLMAP_SYS_ID) === String(this.clmapSysId))
            : rows;

          this.riskGridRows.set(filteredRows.length ? filteredRows : [{}]);

          this.riskLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading risk detail rows:', err);
          this.riskLoading.set(false);
        }
      });
  }

  // ADD
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

  // ADD
  private normalizeSettlementRow(entry: any): any {
    const row = { ...entry };
    this.tableColumns().forEach(col => {
      const inputType = this.getInputType(col.SOURCE_DESIGN_TYPE, col.DATA_TYPE);
      if (inputType === 'date' && row[col.COLUMN_NAME]) {
        row[col.COLUMN_NAME] = new Date(row[col.COLUMN_NAME]);
      }
    });
    return row;
  }

addRow(): void {
  if (this.isReadOnly) return; 
  this.gridRows.update(rows => [
    ...rows,
    {
      CS_CLMAP_SYS_ID: this.clmapSysId,
      CS_CUST_CODE: this.custCode,   // Customer Code — prefilled
      CS_ASSR_CODE: this.custCode,   // Payee Code — prefilled with same value
      CS_DT: new Date()
    }
  ]);
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



  get showApproveDialogValue(): boolean {
    return this.showApproveDialog();
  }
  set showApproveDialogValue(value: boolean) {
    this.showApproveDialog.set(value);
  }

  onApproveConfirm(): void {
     if (this.isReadOnly) return; 
    const index = this.approveRowIndex();
    if (index === null) return;

    const payload = {
      P_CLM_SYS_ID: this.clmSysId,
      P_GEN_AC_YN: this.approveFormData.CS_GEN_CLM_AC_YN ? 'Y' : 'N',
      P_APPR_UID: 'ADMIN',   // TODO: replace with actual logged-in user id if available
      P_APPR_DT: this.approveFormData.CS_APPR_DT
        ? new Date(this.approveFormData.CS_APPR_DT).toISOString().slice(0, 10)
        : '',
      P_CLM_FINAL_YN: this.approveFormData.CS_FINAL_YN ? 'Y' : 'N',
      P_CLM_CLOSE_REASON_CODE: this.approveFormData.CLM_CLOSE_REASON_CODE || '',
      P_CLM_CLOSE_REMARKS: this.approveFormData.CLM_CLOSE_REMARKS || ''
    };

    this.menuService.approveSettlement(payload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.gridRows.update(rows => {
            const copy = [...rows];
            copy[index] = { ...copy[index], ...this.approveFormData };
            return copy;
          });
          this.showApproveDialog.set(false);
        },
        error: (err) => console.error('Error approving settlement', err)
      });
  }

  // ADD — Cancel button
  onApproveCancel(): void {
    this.showApproveDialog.set(false);
  }

  goBack(): void {
  this.router.navigate(['/est-details'], {
    queryParams: {
      clmapSysId: this.clmapSysId,
      sysId: this.clmSysId,
      crUid: 'ADMIN',
      polSysId: this.route.snapshot.queryParamMap.get('polSysId') || '',
      endIdx: this.route.snapshot.queryParamMap.get('endIdx') || 0,
      mode: this.isReadOnly ? 'view' : 'edit'   // ADD
    }
  });
}
}