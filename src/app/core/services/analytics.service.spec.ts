import { TestBed } from '@angular/core/testing';
import { AnalyticsService } from './analytics.service';
import { DriverStanding } from '../models/driver.model';
import { Race } from '../models/race.model';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnalyticsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should calculate championship predictions correctly', () => {
    const mockStandings: DriverStanding[] = [
      {
        position: 1,
        positionText: '1',
        points: 100,
        wins: 3,
        driver: { driverId: 'driver1', givenName: 'Driver', familyName: 'One', code: 'D1', permanentNumber: '1', dateOfBirth: '', nationality: '' },
        constructors: []
      },
      {
        position: 2,
        positionText: '2',
        points: 90,
        wins: 1,
        driver: { driverId: 'driver2', givenName: 'Driver', familyName: 'Two', code: 'D2', permanentNumber: '2', dateOfBirth: '', nationality: '' },
        constructors: []
      }
    ];

    const mockRaces: Race[] = [
      {
        season: '2024',
        round: '1',
        raceName: 'Race 1',
        date: '2024-01-01',
        circuit: { circuitId: '', circuitName: '', location: { lat: '', long: '', locality: '', country: '' } }
      },
      {
        season: '2024',
        round: '2',
        raceName: 'Race 2',
        date: '2099-01-01', // Future race
        circuit: { circuitId: '', circuitName: '', location: { lat: '', long: '', locality: '', country: '' } }
      }
    ];

    const predictions = service.calculateChampionshipPrediction(mockStandings, mockRaces);

    expect(predictions.length).toBeGreaterThan(0);
    expect(predictions[0].name).toBe('Driver One');
    expect(predictions[0].value).toBeGreaterThan(predictions[1].value);
  });

  it('should return empty array if no standings provided', () => {
    const predictions = service.calculateChampionshipPrediction([], []);
    expect(predictions).toEqual([]);
  });
});
