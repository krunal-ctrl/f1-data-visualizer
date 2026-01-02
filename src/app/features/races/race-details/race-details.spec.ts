import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaceDetails } from './race-details';

describe('RaceDetails', () => {
  let component: RaceDetails;
  let fixture: ComponentFixture<RaceDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RaceDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaceDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
