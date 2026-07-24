import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimRegistration } from './claim-registration';

describe('ClaimRegistration', () => {
  let component: ClaimRegistration;
  let fixture: ComponentFixture<ClaimRegistration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimRegistration],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimRegistration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
