import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonSharedListPage } from './common-shared-list.page';

describe('CommonSharedListPage', () => {
  let component: CommonSharedListPage;
  let fixture: ComponentFixture<CommonSharedListPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(CommonSharedListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
