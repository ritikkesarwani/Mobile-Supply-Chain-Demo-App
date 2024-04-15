import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoodReceiptPage } from './good-receipt.page';

describe('GoodReceiptPage', () => {
  let component: GoodReceiptPage;
  let fixture: ComponentFixture<GoodReceiptPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GoodReceiptPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
