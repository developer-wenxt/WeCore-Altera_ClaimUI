import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { Claim, ClaimMenuItem, MenuItem } from '../models/model';
import { FieldConfig } from '../models/model';


@Injectable({ providedIn: 'root' })
export class MenuService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getMenuList(): Observable<MenuItem[]> {
    return this.http.get<any>(`${this.baseUrl}/menuList`)
      .pipe(
        map(response => response.data.data)
      );
  }


  updateClaimRegistration(sysId: number, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/pgitClaim/${sysId}`, payload);
  }

  getPolicyData(polNo: string, lossDate?: string): Observable<any> {
    let url = `${this.baseUrl}/policyData?POLNO=${polNo}`;
    if (lossDate) {
      url += `&lossDt=${lossDate}`;
    }
    return this.http.get<any>(url)
      .pipe(map(response => response.data.data));
  }


  getIntimationData(intmNo: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/intiData/intimation?intmNo=${intmNo}`)
      .pipe(map(response => response.data.data));
  }

  getPolicyDataByPolNo(polNo: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/intiData/policy?polNo=${polNo}`)
      .pipe(map(response => response.data.data));
  }

  getIntmNoDropdownValues(progCode: string, blockName: string, fieldName: string, polNo: string, dsCode: string): Observable<any[]> {
    const quotedPolNo = `'${polNo}'`;
    const quotedDsCode = `'${dsCode}'`;
    const url = `${this.baseUrl}/dropDown?PLD_PROG_CODE=${progCode}&PLD_BLOCK_NAME=${blockName}&PLD_FIELD_NAME=${fieldName}&POL_NO=${encodeURIComponent(quotedPolNo)}&DS_CODE=${encodeURIComponent(quotedDsCode)}`;
    return this.http.get<any>(url).pipe(map(response => response.data.data.data));
  }

  getFields(): Observable<FieldConfig[]> {
    return this.http.get<any>(`${this.baseUrl}/claimIntField`)
      .pipe(map(response => response.data.data));
  }

  getClaimRegisterList(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/claimRegister`)
      .pipe(map(response => response.data.data));
  }

  getClaimRegFields(instCode: string): Observable<FieldConfig[]> {
    return this.http.get<any>(`${this.baseUrl}/clmRegField?inst_code=${instCode}`)
      .pipe(map(response => response.data.data));
  }

  saveClaimIntimation(payload: any): Observable<Claim> {
    return this.http.post<any>(
      `${this.baseUrl}/pgitClmIntimation`,
      payload
    );
  }

  getClaimById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/pgitClmIntimation/${id}`)
      .pipe(map(response => response.data.data));
  }

  updateClaimIntimation(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/pgitClmIntimation/${id}`, payload);
  }

  getClaimRegById(sysId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/pgitClaim/${sysId}`)
      .pipe(map(response => response.data.data));
  }


  getLovFields(progCode: string, blockName: string): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/lovField?progCode=${progCode}&blockName=${blockName}`)
      .pipe(map(response => response.data.data));
  }

  getDropdownValues(progCode: string, blockName: string, fieldName: string, lossDate?: string): Observable<any[]> {
    let url = `${this.baseUrl}/dropDown?PLD_PROG_CODE=${progCode}&PLD_BLOCK_NAME=${blockName}&PLD_FIELD_NAME=${fieldName}`;
    if (lossDate) {
      url += `&lossDt=${lossDate}`;
    }
    return this.http.get<any>(url).pipe(map(response => response.data.data.data));
  }


  decodeToken(token: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/decodeToken`, { token })
      .pipe(map(response => response.data.data));
  }

  getRiskDetailsByClaim(clmSysId: number) {
    return this.http.get(`${this.baseUrl}/pgitClmApplPolicy/getById?CLMAP_CLM_SYS_ID=${clmSysId}`);
  }

  getRiskDetailFields(): Observable<FieldConfig[]> {
    return this.http.get<any>(`${this.baseUrl}/clmRegDtlField`)
      .pipe(map(response => response.data.data));
  }

  getEstDetailsByClmap(clmapSysId: number) {
    return this.http.get(`/api/pgitClmEst/getById?CE_CLMAP_SYS_ID=${clmapSysId}`);
  }

  getEstDetailFields(): Observable<FieldConfig[]> {
    return this.http.get<any>(`${this.baseUrl}/estDtlField`)
      .pipe(map(response => response.data.data));
  }

  saveClaimRegistration(payload: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/pgitClaim`, payload);
  }


  saveSettlementDetail(row: any) {
    return this.http.put(`${this.baseUrl}/pgitClmSetl`, row);
  }

  getSettlementFields(): Observable<FieldConfig[]> {
    return this.http.get<any>(`${this.baseUrl}/setField`)
      .pipe(map(response => response.data.data));
  }

  getClaimList(classCode: string): Observable<Claim[]> {
    return this.http
      .get<any>(`${this.baseUrl}/pgitClaim?CLM_CLASS_CODE=${classCode}`)
      .pipe(
        map(response => response.data.data as Claim[])
      );
  }

  getClaimIntimationList(): Observable<any[]> {
    return this.http.get<any>(`${this.baseUrl}/pgitClmIntimation`)
      .pipe(map(response => response.data.data));
  }


  getClaimIntimationById(intmNo: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/pgitClmIntimation/byId`, {
      params: { CI_INTM_NO: intmNo }
    }).pipe(map(response => response.data.data));
  }

  updateRiskDetail(row: any, sysId?: any, prodCode?: string) {
    const payload = {
      ...row,
      CLMAP_CLM_SYS_ID: sysId ?? row.CLMAP_CLM_SYS_ID,
      CLMAP_CR_DT: row.CLMAP_CR_DT || new Date().toISOString(),
      CLMAP_CR_UID: 'ADMIN',
      CLMAP_END_SR_NO: 0,
      CLMAP_PRAI_LVL1_SR_NO: 1,
      CLMAP_COMP_CODE: '001',
      CLMAP_DIVN_CODE: '001',
      CLMAP_PROD_CODE: prodCode || row.CLMAP_PROD_CODE || 'MOTOR',
      CLMAP_DEPT_CODE: 'MOTOR'
    };
    return this.http.put(`${this.baseUrl}/pgitClmApplPolicy/${row.CLMAP_SYS_ID}`, payload);
  }

  updateEstDetail(row: any) {
    return this.http.put(`${this.baseUrl}/pgitClmEst/${row.CE_SYS_ID}`, row);
  }

  createEstDetail(row: any) {
    return this.http.post(`${this.baseUrl}/pgitClmEst`, row);
  }

  saveEstimation(rowData: any, clmapSysId: number, clmSysId: number, crUid: string): Observable<any> {
    const payload = {
      CE_CLMAP_SYS_ID: clmapSysId,
      CE_CLM_SYS_ID: clmSysId,
      CE_REF_TYPE: 'CLM',
      CE_CR_DT: new Date().toISOString(),
      CE_CR_UID: crUid,
      CE_CURR_CODE: rowData.CE_CURR_CODE || 'USD',
      CE_DT: rowData.CE_DT ? new Date(rowData.CE_DT).toISOString() : new Date().toISOString(),
      CE_EST_IND: rowData.CE_EST_IND || 'EST',
      CE_EST_TYPE: rowData.CE_EST_TYPE || 'LOSS',
      CE_EST_CODE: rowData.CE_EST_CODE || 'CLAIM',
      CE_EST_SIGN: rowData.CE_EST_SIGN ?? 1,
      CE_AMT_FC: parseFloat(rowData.CE_AMT_FC) || 0,
      CE_CS_AMT_FC: parseFloat(rowData.CE_CS_AMT_FC) || 1000,
      ...rowData
    };
    // Ensure IDs always override any user-entered values
    payload.CE_CLMAP_SYS_ID = clmapSysId;
    payload.CE_CLM_SYS_ID = clmSysId;
    payload.CE_CR_UID = crUid;
    return this.http.post<any>(`${this.baseUrl}/pgitClmEst`, payload);
  }


  getMenuListClaim(): Observable<ClaimMenuItem[]> {
    return this.http.get<any>(`${this.baseUrl}/menuListClaim`)
      .pipe(map(response => response.data.data));
  }

  createSettlementDetail(row: any) {
    return this.http.post(`${this.baseUrl}/pgitClmSetl`, row);
  }

  getSettlementDetailsByClaim(clmapSysId: number) {
    return this.http.get(`${this.baseUrl}/pgitClmSetl/${clmapSysId}`);
  }

  createRiskDetail(row: any, sysId: any, prodCode?: string) {
    const payload = {
      ...row,
      CLMAP_CLM_SYS_ID: sysId,
      CLMAP_CR_DT: new Date().toISOString(),
      CLMAP_CR_UID: 'ADMIN',
      CLMAP_END_SR_NO: 0,
      CLMAP_PRAI_LVL1_SR_NO: 1,
      CLMAP_COMP_CODE: '001',
      CLMAP_DIVN_CODE: '001',
      CLMAP_PROD_CODE: prodCode || 'MOTOR',
      CLMAP_DEPT_CODE: 'MOTOR'
    };
    return this.http.post(`${this.baseUrl}/pgitClmApplPolicy`, payload);
  }

  getRiskPolicy(polNo: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/riskDtlReg/policy?POLH_NO=${polNo}`)
      .pipe(map(response => response.data.data)); // CHANGED
  }
  getRiskSection(polhSysId: number, endIdx: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/riskDtlReg/section?POLH_SYS_ID=${polhSysId}&POLH_END_NO_IDX=${endIdx}`)
      .pipe(map(response => response.data.data)); // CHANGED
  }
  getRiskRisk(psechSysId: number, polhSysId: number, endIdx: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/riskDtlReg/risk?PSECH_SYS_ID=${psechSysId}&POLH_SYS_ID=${polhSysId}&POLH_END_NO_IDX=${endIdx}`)
      .pipe(map(response => response.data.data)); // CHANGED
  }
  getRiskSmi(praihSysId: number, psechSysId: number, polhSysId: number, endIdx: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/riskDtlReg/smi?PRAIH_SYS_ID=${praihSysId}&PSECH_SYS_ID=${psechSysId}&POLH_SYS_ID=${polhSysId}&POLH_END_NO_IDX=${endIdx}`)
      .pipe(map(response => response.data.data)); // CHANGED
  }
  getRiskCover(praihSysId: number, psechSysId: number, polhSysId: number, endIdx: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/riskDtlReg/cover?PRAIH_SYS_ID=${praihSysId}&PSECH_SYS_ID=${psechSysId}&POLH_SYS_ID=${polhSysId}&POLH_END_NO_IDX=${endIdx}`)
      .pipe(map(response => response.data.data)); // CHANGED
  }

}