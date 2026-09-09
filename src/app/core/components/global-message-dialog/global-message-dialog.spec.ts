import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlobalMessageDialog } from './global-message-dialog';

describe('GlobalMessageDialog', () => {
  let component: GlobalMessageDialog;
  let fixture: ComponentFixture<GlobalMessageDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalMessageDialog],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalMessageDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
