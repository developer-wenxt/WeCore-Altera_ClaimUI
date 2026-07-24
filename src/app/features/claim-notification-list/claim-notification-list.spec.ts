import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClaimNotificationList } from './claim-notification-list';

describe('ClaimNotificationList', () => {
  let component: ClaimNotificationList;
  let fixture: ComponentFixture<ClaimNotificationList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClaimNotificationList],
    }).compileComponents();

    fixture = TestBed.createComponent(ClaimNotificationList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
