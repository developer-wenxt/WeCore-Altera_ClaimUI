import { Component, OnInit, signal, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntil } from 'rxjs/operators';
import { UnSubscriber } from '../../core/un-subscriber';
import { MenuService } from '../../core/services/menu.service';
import { SHARED_IMPORTS } from '../../core/shared/shared';
import { ClaimIntimation } from '../../core/models/model';
import { Claim } from '../../core/models/model';


@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [...SHARED_IMPORTS],
  templateUrl: './claim-list.html',
  styleUrls: ['./claim-list.scss'],
  providers: [UnSubscriber]
})
export class ClaimListComponent extends UnSubscriber implements OnInit {
    @Input() classCode = '';
  @Input() instCode = '';  
  @Output() back = new EventEmitter<void>();  
  allRecords = signal<ClaimIntimation[]>([]);
  allClaims = signal<Claim[]>([]);

  loading = signal(true);
  searchTerm = '';
  statusFilter = 'All Statuses';

  statusOptions = [
    { label: 'All Statuses', value: 'All Statuses' },
    { label: 'Registered', value: 'A' },
    { label: 'Closed', value: 'C' },
    { label: 'Open', value: 'O' },
    { label: 'Reopened', value: 'R' },
    { label: 'Reject', value: 'J' }
  ];

  statusLabelMap: { [key: string]: string } = {
    'J': 'Reject',
    'A': 'Registered',
    'C': 'Closed',
    'O': 'Open',
    'R': 'Reopened'
  };


  constructor(
    private menuService: MenuService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit(): void {


     if (!this.classCode) {
      this.classCode = this.route.snapshot.paramMap.get('classCode') || '';
    }
    
    this.menuService.getClaimList(this.classCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.allClaims.set(res);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading claim list:', err);
          this.loading.set(false);
        }
      });
  }

  getStatusLabel(code: string): string {
    return this.statusLabelMap[code] || code || '-';
  }

  get filteredClaims() {
    let result = this.allClaims();
    if (this.statusFilter !== 'All Statuses') {
      result = result.filter(c => c.CLM_STS === this.statusFilter);
    }
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(c =>
        c.CLM_ASSR_NAME?.toLowerCase().includes(term) ||
        c.CLM_POL_NO?.toLowerCase().includes(term) ||
        c.CLM_NO?.toLowerCase().includes(term)
      );
    }
    return result;
  }

 onViewClaim(claim: any): void {
  sessionStorage.setItem('selectedClaimRecord', JSON.stringify(claim));
  this.router.navigate(['/claim-notification', claim.CLM_INTM_NO], {
    queryParams: { mode: 'view', sysId: claim.CLM_SYS_ID }
  });
}
  onAddRegistration(): void {
  this.menuService.getClaimRegisterList()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        const match = res.find((r: any) => r.CLASS_CODE === this.classCode);
        const instCode = match ? match.CLM_INST_CODE : '';
        sessionStorage.setItem('claimInstCode', instCode);
         sessionStorage.setItem('claimClassCode', this.classCode);
        this.router.navigate(['/claim-registration']);
      },
      error: (err) => {
        console.error('Error loading claim register list:', err);
      }
    });
}


get filteredRecords() {
  let result = this.allRecords();
  if (this.searchTerm.trim()) {
    const term = this.searchTerm.toLowerCase();
    result = result.filter(c =>
      c.CI_ASSR_NAME?.toLowerCase().includes(term) ||
      c.CI_POL_NO?.toLowerCase().includes(term) ||
      c.CI_INTM_NO?.toLowerCase().includes(term) ||
      c.CI_INTM_NAME?.toLowerCase().includes(term)
    );
  }
  return result;
}


onViewClaimRegistration(claim: any): void {
  this.router.navigate(['/claim-registration'], {
    queryParams: { mode: 'view', sysId: claim.CLM_SYS_ID }
  });
}


onEditClaimRegistration(claim: any): void {
  this.router.navigate(['/claim-registration'], {
    queryParams: { mode: 'edit', sysId: claim.CLM_SYS_ID }
  });
}

  goBack(): void {
  this.router.navigate(['/']);
}
}