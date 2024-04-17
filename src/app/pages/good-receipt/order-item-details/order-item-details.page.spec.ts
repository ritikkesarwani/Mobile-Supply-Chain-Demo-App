import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderItemDetailsPage } from './order-item-details.page';

describe('OrderItemDetailsPage', () => {
  let component: OrderItemDetailsPage;
  let fixture: ComponentFixture<OrderItemDetailsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderItemDetailsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
