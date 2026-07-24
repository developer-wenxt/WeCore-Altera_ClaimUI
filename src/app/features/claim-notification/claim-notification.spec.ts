import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimNotification } from './claim-notification';

describe('ClaimNotification', () => {
  let component: ClaimNotification;
  let fixture: ComponentFixture<ClaimNotification>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimNotification],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimNotification);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
