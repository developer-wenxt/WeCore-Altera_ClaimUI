import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyAccountingEntry } from './policy-accounting-entry';

describe('PolicyAccountingEntry', () => {
  let component: PolicyAccountingEntry;
  let fixture: ComponentFixture<PolicyAccountingEntry>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyAccountingEntry],
    }).compileComponents();

    fixture = TestBed.createComponent(PolicyAccountingEntry);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
