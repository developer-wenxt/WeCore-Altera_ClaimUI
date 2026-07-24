import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environments';
import { Claim, MenuItem } from '../models/model';
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

updateClaimIntimation(id: number, payload: any): Observable<any> {
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

getDropdownValues(progCode: string, blockName: string, fieldName: string): Observable<any[]> {
  return this.http.get<any>(
    `${this.baseUrl}/dropDown?PLD_PROG_CODE=${progCode}&PLD_BLOCK_NAME=${blockName}&PLD_FIELD_NAME=${fieldName}`
  ).pipe(map(response => response.data.data.data.data));   // fixed nesting
}

getRiskDetailsByClaim(clmSysId: number) {
  return this.http.get(`/api/pgitClmApplPolicy/getById?CLMAP_CLM_SYS_ID=${clmSysId}`);
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
  return this.http.post<any>(`${this.baseUrl}/pgitClmIntimation`, payload);
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


  updateRiskDetail(row: any) {
  return this.http.put(`/api/pgitClmApplPolicy/${row.CLMAP_SYS_ID}`, row);
}

updateEstDetail(row: any) {
  return this.http.put(`/api/pgitClmEst/${row.CE_SYS_ID}`, row);
}


}