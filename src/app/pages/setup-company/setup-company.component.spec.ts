import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetupCompanyComponent } from './setup-company.component';

describe('SetupCompanyComponent', () => {
  let component: SetupCompanyComponent;
  let fixture: ComponentFixture<SetupCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SetupCompanyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetupCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
