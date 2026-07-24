import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SettlementDetails } from './settlement-details';

describe('SettlementDetails', () => {
  let component: SettlementDetails;
  let fixture: ComponentFixture<SettlementDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettlementDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(SettlementDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
