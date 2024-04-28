import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SerialsPage } from './serials.page';

describe('SerialsPage', () => {
  let component: SerialsPage;
  let fixture: ComponentFixture<SerialsPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SerialsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
