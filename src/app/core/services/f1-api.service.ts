import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { catchError, forkJoin, map, Observable, of } from "rxjs";
import { MOCK_DRIVER_STANDINGS } from "../data/mock-driver-standings.data";
import { MOCK_CONSTRUCTOR_STANDINGS } from "../data/mock-constructor-standings.data";
import { MOCK_RACE_CALENDAR } from "../data/mock-race-calendar.data";
import { MOCK_RACE_RESULTS } from "../data/mock-race-results.data";
import { MOCK_SPRINT_RESULTS } from "../data/mock-sprint-results.data";


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

    getDriverSprintResults(driverId: string, year: string): Observable<any[]> {
        if (this.useMockData) {
            const mockData = MOCK_SPRINT_RESULTS.find(item => item.season === year && item.driverId === driverId);
            return of(mockData ? mockData.Races : []);
        }

        return this.http
            .get(`${this.ergastBaseUrl}/${year}/drivers/${driverId}/sprint.json?limit=100`)
            .pipe(
                map((res: any) => res.MRData.RaceTable.Races),
                catchError(() => of([])),
            );
    }

    getDriverRaceResults(driverId: string, season?: string, includeSprint = true): Observable<any[]> {
        const year = season || this.getCurrentSeason();

        const races$ = this.useMockData
            ? of(MOCK_RACE_RESULTS.find(item => item.season === year && item.driverId === driverId)?.Races ?? [])
            : this.http
                .get(`${this.ergastBaseUrl}/${year}/drivers/${driverId}/results.json?limit=100`)
                .pipe(
                    map((response: any) => response.MRData.RaceTable.Races),
                    catchError(error => {
                        console.error('Error fetching driver race results:', error);
                        return of([]);
                    })
                );

        const sprint$ = includeSprint
            ? this.getDriverSprintResults(driverId, year)
            : of([]);


        return forkJoin([races$, sprint$]).pipe(
            map(([races, sprint]: [any[], any[]]) => {
                let cumulativePoints = 0;
                let i = 1;
                return races.map((race: any) => {
                    const result = race.Results?.[0];
                    const racePoints = Number(result?.points ?? 0);
                    const sprintPoints = Number(sprint.find(s => s.round == race.round)?.SprintResults[0]?.points ?? 0);
                    const totalPoints = racePoints + sprintPoints;

                    cumulativePoints += totalPoints;

                    return {
                        round: Number(race.round),
                        raceName: race.raceName,
                        position: Number(result?.position ?? 0),
                        points: racePoints,
                        sprintPoints: sprintPoints,
                        totalPoints: totalPoints,
                        cumulativePoints
                    };
                });
            })
        );
    }

    getMultipleDriversRaceResults(driverIds: string[], season?: string): Observable<any> {
        const requests = driverIds.map(id => this.getDriverRaceResults(id, season));
        return forkJoin(requests).pipe(
            map(results => {
                return driverIds.map((id, index) => ({
                    driverId: id,
                    results: results[index]
                }));
            })
        );
    }

    getTeamColor(constructorId: string): string {
        const colors: any = {
            'red_bull': '#0600ef',
            'mercedes': '#00d2be',
            'ferrari': '#dc0000',
            'mclaren': '#ff8700',
            'alpine': '#037af0',
            'aston_martin': '#016860',
            'haas': '#ffffff',
            'rb': '#0000fe',
            'williams': '#01a3e6',
            'sauber': '#02ce05'
        };
        return colors[constructorId] || '#00f0ff';
    }
}