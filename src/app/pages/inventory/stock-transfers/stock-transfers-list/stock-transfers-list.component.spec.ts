import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTransfersListComponent } from './stock-transfers-list.component';

describe('StockTransfersListComponent', () => {
  let component: StockTransfersListComponent;
  let fixture: ComponentFixture<StockTransfersListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockTransfersListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockTransfersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
