import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockAdjustmentFormComponent } from './stock-adjustment-form.component';

describe('StockAdjustmentFormComponent', () => {
  let component: StockAdjustmentFormComponent;
  let fixture: ComponentFixture<StockAdjustmentFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockAdjustmentFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockAdjustmentFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
