import { Injectable } from '@angular/core';
 
export interface UserDetails {
  ValidateToken?: boolean;
  LoginId?: string;
  UserType?: string;
  SubUserType?: string;
  CompanyId?: string;
  BranchCode?: string;
  MenuAccessYN?: string;
  ReferalAccessYN?: string;
  ReportAccessYN?: string;
  LoginUserCoreAppCode?: string | null;
  AttachedBranchDetails?: Record<string, { BranchName: string; BranchCoreAppCode: string }>;
}
 
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly USER_DETAILS_KEY = 'UserDetails';
  private readonly USER_TOKEN_KEY = 'UserToken';
  private readonly WECORE_PATH_KEY = 'WecorePath';
 
  constructor() {}
 
  /**
   * Set user details in sessionStorage
   */
  setUserDetails(details: UserDetails): void {
    if (details) {
      sessionStorage.setItem(this.USER_DETAILS_KEY, JSON.stringify(details));
    }
  }
 
  /**
   * Get all user details from sessionStorage
   */
  getUserDetails(): UserDetails | null {
    const details = sessionStorage.getItem(this.USER_DETAILS_KEY);
    if (!details) return null;
    try {
      return JSON.parse(details) as UserDetails;
    } catch (e) {
      console.error('Error parsing UserDetails from sessionStorage', e);
      return null;
    }
  }
 
  /**
   * Helper to retrieve a specific property from UserDetails
   */
  private getUserDetailProp<K extends keyof UserDetails>(key: K): UserDetails[K] | undefined {
    const details = this.getUserDetails();
    return details ? details[key] : undefined;
  }
 
  /**
   * Get LoginId
   */
  getLoginId(): string | undefined {
    return this.getUserDetailProp('LoginId');
  }
 
  /**
   * Get UserType
   */
  getUserType(): string | undefined {
    return this.getUserDetailProp('UserType');
  }
 
  /**
   * Get SubUserType
   */
  getSubUserType(): string | undefined {
    return this.getUserDetailProp('SubUserType');
  }
 
  /**
   * Get CompanyId
   */
  getCompanyId(): string | undefined {
    return this.getUserDetailProp('CompanyId');
  }
 
  /**
   * Get BranchCode
   */
  getBranchCode(): string | undefined {
    return this.getUserDetailProp('BranchCode');
  }
 
  /**
   * Get AttachedBranchDetails
   */
  getAttachedBranchDetails(): Record<string, { BranchName: string; BranchCoreAppCode: string }> | undefined {
    return this.getUserDetailProp('AttachedBranchDetails');
  }
 
  /**
   * Get active branch name
   */
  getBranchName(): string | undefined {
    const branchCode = this.getBranchCode();
    const branches = this.getAttachedBranchDetails();
    if (branchCode && branches && branches[branchCode]) {
      return branches[branchCode].BranchName;
    }
    return undefined;
  }
 
  /**
   * Update active BranchCode in UserDetails
   */
  updateBranchCode(branchCode: string): void {
    const details = this.getUserDetails();
    if (details) {
      details.BranchCode = branchCode;
      this.setUserDetails(details);
    }
  }
 
  /**
   * Get MenuAccessYN
   */
  getMenuAccessYN(): string | undefined {
    return this.getUserDetailProp('MenuAccessYN');
  }
 
  /**
   * Get ReferalAccessYN
   */
  getReferalAccessYN(): string | undefined {
    return this.getUserDetailProp('ReferalAccessYN');
  }
 
  /**
   * Get ReportAccessYN
   */
  getReportAccessYN(): string | undefined {
    return this.getUserDetailProp('ReportAccessYN');
  }
 
  /**
   * Check if Token is validated
   */
  isTokenValidated(): boolean {
    return this.getUserDetailProp('ValidateToken') || false;
  }
 
  /**
   * Get the authentication token
   */
  getToken(): string | null {
    return sessionStorage.getItem(this.USER_TOKEN_KEY);
  }
 
  /**
   * Set the authentication token
   */
  setToken(token: string): void {
    sessionStorage.setItem(this.USER_TOKEN_KEY, token);
  }
 
  /**
   * Get the Wecore path
   */
  getWecorePath(): string | null {
    return sessionStorage.getItem(this.WECORE_PATH_KEY);
  }
 
  /**
   * Set the Wecore path
   */
  setWecorePath(path: string): void {
    sessionStorage.setItem(this.WECORE_PATH_KEY, path);
  }
 
  /**
   * Clear session details
   */
  clearSession(): void {
    sessionStorage.removeItem(this.USER_DETAILS_KEY);
    sessionStorage.removeItem(this.USER_TOKEN_KEY);
    sessionStorage.removeItem(this.WECORE_PATH_KEY);
  }
}