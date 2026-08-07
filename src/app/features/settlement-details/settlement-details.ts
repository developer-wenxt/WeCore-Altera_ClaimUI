import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { FieldConfig } from '../../core/models/model';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import { getSettlementColumns, getTableColumnFields, getInputType } from '../../core/utils/field-filter.util';
import { ActivatedRoute } from '@angular/router';



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

  // Risk Details logic
  riskTableColumns = signal<FieldConfig[]>([]);
  



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




  constructor(
    private menuService: MenuService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

 ngOnInit(): void {
  const headerData = sessionStorage.getItem('claimHeaderData');
  if (headerData) {
    const parsed = JSON.parse(headerData);
    this.prodCode = parsed.CLM_PROD_CODE || '';
    this.polNo = parsed.CLM_POL_NO || '';
  }
  this.classDesc = sessionStorage.getItem('claimClassDesc') || '';
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
}

saveRow(index: number): void {
  const row = { ...this.gridRows()[index] };
  row.CS_CLMAP_SYS_ID = this.clmapSysId;

  const missing = this.tableColumns()
    .filter(col => col.MANDATORY === 1)
    .filter(col => {
      const v = row[col.COLUMN_NAME];
      return v === null || v === undefined || v === '';
    });

  if (missing.length > 0) {
    alert('Please fill mandatory fields: ' + missing.map(f => f.FIELD_PROMPT).join(', '));
    return;
  }

  this.menuService.saveSettlementDetail(row)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: () => console.log('Settlement row saved successfully'),
      error: (err) => console.error('Error saving settlement row', err)
    });
}



private loadSettlementRows(): void {
  if (!this.clmapSysId) {           // CHANGED
    this.loading.set(false);
    return;
  }

  this.menuService.getSettlementDetailsByClaim(this.clmapSysId)   // CHANGED
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res: any) => {
        console.log('Settlement Response:', res);

        const dataObj = res?.data?.data || {};
        const sortedKeys = Object.keys(dataObj).sort((a, b) => Number(a) - Number(b));

        const rows: any[] = [];
        sortedKeys.forEach(key => {
          dataObj[key].forEach((entry: any) => rows.push(this.normalizeSettlementRow(entry)));
        });

        this.gridRows.set(rows.length ? rows : [{}]);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading settlement rows:', err);
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
        const dataObj = res?.data?.data || {};
        const sortedKeys = Object.keys(dataObj).sort((a, b) => Number(a) - Number(b));

        const rows: any[] = [];
        sortedKeys.forEach(key => {
          dataObj[key].forEach((entry: any) => rows.push(this.normalizeRiskRow(entry)));   // CHANGED
        });

        this.riskGridRows.set(rows.length ? rows : [{}]);
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
  this.gridRows.update(rows => [...rows, { CS_CLMAP_SYS_ID: this.clmapSysId }]);
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

  goBack(): void {
    this.router.navigate(['/risk-details'], {
      queryParams: { sysId: this.clmSysId }
    });
  }
}