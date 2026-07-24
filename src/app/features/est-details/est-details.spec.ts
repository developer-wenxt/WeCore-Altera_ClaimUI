import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstDetails } from './est-details';

describe('EstDetails', () => {
  let component: EstDetails;
  let fixture: ComponentFixture<EstDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstDetails],
    }).compileComponents();

    fixture = TestBed.createComponent(EstDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
