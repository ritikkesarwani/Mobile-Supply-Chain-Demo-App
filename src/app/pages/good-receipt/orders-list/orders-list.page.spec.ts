import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdersListPage } from './orders-list.page';

describe('OrdersListPage', () => {
  let component: OrdersListPage;
  let fixture: ComponentFixture<OrdersListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrdersListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
