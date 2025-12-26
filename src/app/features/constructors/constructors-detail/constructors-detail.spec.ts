import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstructorsDetail } from './constructors-detail';

describe('ConstructorsDetail', () => {
  let component: ConstructorsDetail;
  let fixture: ComponentFixture<ConstructorsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstructorsDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConstructorsDetail);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
