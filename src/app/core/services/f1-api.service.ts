import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { catchError, map, Observable, of } from "rxjs";
import { MOCK_DRIVER_STANDINGS } from "../data/mock-driver-standings.data";
import { MOCK_CONSTRUCTOR_STANDINGS } from "../data/mock-constructor-standings.data";
import { MOCK_RACE_CALENDAR } from "../data/mock-race-calendar.data";


@Injectable({
    providedIn: 'root',
})
export class F1ApiService {

    private http = inject(HttpClient);
    private ergastBaseUrl = environment.apiUrls.ergast;
    private openF1ApiBaseUrl = environment.apiUrls.openf1;
    private useMockData = environment.useMockData;

    getCurrentSeason(): string {
        return new Date().getFullYear().toString();
    }

    // Driver Standings
    getDriverStandings(season?: string): Observable<any> {
        const year = season || this.getCurrentSeason();
        if (this.useMockData) {
            const mockData = MOCK_DRIVER_STANDINGS.find(item => item.season === year);
            return of(mockData ? mockData.StandingsLists[0] : null);
        }

        return this.http.get(`${this.ergastBaseUrl}/${year}/driverStandings.json`)
            .pipe(
                map((response: any) => response.MRData.StandingsTable.StandingsLists[0]),
                catchError(error => {
                    console.error('Error fetching driver standings:', error);
                    console.log('Falling back to mock data...');
                    return of(null);
                })
            );
    }

    // Constructor Standings
    getConstructorStandings(season?: string): Observable<any> {
        const year = season || this.getCurrentSeason();
        if (this.useMockData) {
            const mockData = MOCK_CONSTRUCTOR_STANDINGS.find(item => item.season === year);
            return of(mockData ? mockData.StandingsLists[0] : null);
        }

        return this.http.get(`${this.ergastBaseUrl}/${year}/constructorStandings.json`)
            .pipe(
                map((response: any) => response.MRData.StandingsTable.StandingsLists[0]),
                catchError(error => {
                    console.error('Error fetching constructor standings:', error);
                    console.log('Falling back to mock data...');
                    return of(null);
                })
            );
    }

    // Race Calendar
    getRaceCalendar(season?: string): Observable<any> {
        const year = season || this.getCurrentSeason();
        if (this.useMockData) {
            const mockData = MOCK_RACE_CALENDAR.find(item => item.season === year)
            return of(mockData ? mockData.Races : null);
        }

        return this.http.get(`${this.ergastBaseUrl}/${year}.json`)
            .pipe(
                map((response: any) => response.MRData.RaceTable.Races),
                catchError(error => {
                    console.error('Error fetching race calendar:', error);
                    console.log('Falling back to mock data...');
                    return of([]);
                })
            );
    }

    // Race Results
    getRaceResults(season: string, round: string): Observable<any> {
        if (this.useMockData) {
            return of(null);
        }

        return this.http.get(`${this.ergastBaseUrl}/${season}/${round}/results.json`)
            .pipe(
                map((response: any) => response.MRData.RaceTable.Races[0]),
                catchError(error => {
                    console.error('Error fetching race results:', error);
                    return of(null);
                })
            );
    }

    // Driver Details
    getDriverDetails(driverId: string): Observable<any> {
        if (this.useMockData) {
            return of(null);
        }

        return this.http.get(`${this.ergastBaseUrl}/drivers/${driverId}.json`)
            .pipe(
                map((response: any) => response.MRData.DriverTable.Drivers[0]),
                catchError(error => {
                    console.error('Error fetching driver details:', error);
                    return of(null);
                })
            );
    }

    // Qualifying Results
    getQualifyingResults(season: string, round: string): Observable<any> {
        if (this.useMockData) {
            return of(null);
        }

        return this.http.get(`${this.ergastBaseUrl}/${season}/${round}/qualifying.json`)
            .pipe(
                map((response: any) => response.MRData.RaceTable.Races[0]),
                catchError(error => {
                    console.error('Error fetching qualifying results:', error);
                    return of(null);
                })
            );
    }
}