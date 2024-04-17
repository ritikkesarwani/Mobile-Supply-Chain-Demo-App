import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderItemsPage } from './order-items.page';

describe('OrderItemsPage', () => {
  let component: OrderItemsPage;
  let fixture: ComponentFixture<OrderItemsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderItemsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
