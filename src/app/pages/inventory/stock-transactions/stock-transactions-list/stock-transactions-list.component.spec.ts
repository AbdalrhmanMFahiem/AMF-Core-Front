import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTransactionsListComponent } from './stock-transactions-list.component';

describe('StockTransactionsListComponent', () => {
  let component: StockTransactionsListComponent;
  let fixture: ComponentFixture<StockTransactionsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockTransactionsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StockTransactionsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
