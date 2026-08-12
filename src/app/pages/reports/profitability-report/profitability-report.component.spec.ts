import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfitabilityReportComponent } from './profitability-report.component';

describe('ProfitabilityReportComponent', () => {
  let component: ProfitabilityReportComponent;
  let fixture: ComponentFixture<ProfitabilityReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfitabilityReportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfitabilityReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
