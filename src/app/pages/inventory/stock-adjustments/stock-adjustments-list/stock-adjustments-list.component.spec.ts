import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockAdjustmentsListComponent } from './stock-adjustments-list.component';

describe('StockAdjustmentsListComponent', () => {
  let component: StockAdjustmentsListComponent;
  let fixture: ComponentFixture<StockAdjustmentsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockAdjustmentsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockAdjustmentsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
