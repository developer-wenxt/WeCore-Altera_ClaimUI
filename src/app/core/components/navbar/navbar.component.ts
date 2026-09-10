import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Select } from 'primeng/select';
import { SessionService } from '../../services/session.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule, Select],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  isDarkMode = false;

  constructor(private sessionService: SessionService) {}

  get branches(): { code: string; name: string }[] {
    const details = this.sessionService.getAttachedBranchDetails();
    if (!details) return [];
    return Object.keys(details).map(code => ({
      code,
      name: details[code].BranchName
    }));
  }

  get currentBranchCode(): string {
    return this.sessionService.getBranchCode() || '';
  }

  getActiveBranchName(): string {
    return this.sessionService.getBranchName() || 'Select Branch';
  }

  onBranchChange(branchCode: string): void {
    this.sessionService.updateBranchCode(branchCode);
    window.location.reload();
  }

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.setDarkMode(true);
    } else if (savedTheme === 'light') {
      this.setDarkMode(false);
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.setDarkMode(prefersDark);
    }
  }

  toggleDarkMode(): void {
    this.setDarkMode(!this.isDarkMode);
  }

  private setDarkMode(dark: boolean): void {
    this.isDarkMode = dark;
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }

  getLogoUrl(): string {
    const companyId = this.sessionService.getCompanyId();
    return companyId ? `images/${companyId}.png` : 'logo.png';
  }

  onLogoError(event: Event): void {
    const img = event.target as HTMLImageElement;
    if (img && !img.src.includes('logo.png')) {
      img.src = 'logo.png';
    }
  }

  getLoginId(): string {
    return this.sessionService.getLoginId() || 'Admin';
  }

  getUserType(): string {
    return this.sessionService.getUserType() || 'Issuer';
  }

  getInitials(): string {
    const loginId = this.sessionService.getLoginId();
    if (!loginId) return 'AZ';
    const parts = loginId.split(/[\s_.-]+/);
    if (parts.length >= 2 && parts[0][0] && parts[1][0]) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return loginId.substring(0, 2).toUpperCase();
  }

  goToWecore(): void {
    const wecorePath = this.sessionService.getWecorePath();
    const targetUrl = wecorePath || 'https://wecorephoenixgroup.com/Eway/#/Home';
    window.location.href = targetUrl;
  }
}
