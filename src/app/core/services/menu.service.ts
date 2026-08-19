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

  updateRiskDetail(row: any) {
    return this.http.put(`${this.baseUrl}/pgitClmApplPolicy/${row.CLMAP_SYS_ID}`, row);
  }

  updateEstDetail(row: any) {
    return this.http.put(`${this.baseUrl}/pgitClmEst/${row.CE_SYS_ID}`, row);
  }

  createEstDetail(row: any) {
    return this.http.post(`${this.baseUrl}/pgitClmEst`, row);
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

  createRiskDetail(row: any) {
    return this.http.post(`${this.baseUrl}/pgitClmApplPolicy`, row);
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