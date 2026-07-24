import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RiskDetails } from './risk-details';

describe('RiskDetails', () => {
  let component: RiskDetails;
  let fixture: ComponentFixture<RiskDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RiskDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(RiskDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
