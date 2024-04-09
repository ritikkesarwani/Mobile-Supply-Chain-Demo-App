import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrgListPage } from './org-list.page';

describe('OrgListPage', () => {
  let component: OrgListPage;
  let fixture: ComponentFixture<OrgListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(OrgListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
