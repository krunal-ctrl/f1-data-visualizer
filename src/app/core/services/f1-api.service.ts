import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { catchError, forkJoin, map, Observable, of } from "rxjs";
import { MOCK_DRIVER_STANDINGS } from "../data/mock-driver-standings.data";
import { MOCK_CONSTRUCTOR_STANDINGS } from "../data/mock-constructor-standings.data";
import { MOCK_RACE_CALENDAR } from "../data/mock-race-calendar.data";
import { MOCK_RACE_RESULTS } from "../data/mock-race-results.data";
import { MOCK_SPRINT_RESULTS } from "../data/mock-sprint-results.data";
import { MOCK_TEAM_PERFORMANCE } from "../data/mock-team-performance.data";
import { MOCK_SPRINT_TEAM_PERFORMANCE } from "../data/mock-sprint-team-performance.data";


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

    getConstructorsSprintResults(constructorId: string, year: string): Observable<any[]> {
        if (this.useMockData) {
            const mockData = MOCK_SPRINT_TEAM_PERFORMANCE.find(item => item.season === year && item.constructorId === constructorId);
            return of(mockData ? mockData.Races : []);
        }

        return this.http
            .get(`${this.ergastBaseUrl}/${year}/constructors/${constructorId}/sprint.json?limit=100`)
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

    getConstructorRaceResults(constructorId: string, season?: string, includeSprint: boolean = true): Observable<any[]> {
        const year = season || this.getCurrentSeason();

        const races$ = this.useMockData
            ? of(MOCK_TEAM_PERFORMANCE.find(item => item.season === year && item.constructorId === constructorId)?.Races ?? [])
            : this.http
                .get(`${this.ergastBaseUrl}/${year}/constructors/${constructorId}/results.json?limit=100`)
                .pipe(
                    map((response: any) => response.MRData.RaceTable.Races),
                    catchError(error => {
                        console.error('Error fetching driver race results:', error);
                        return of([]);
                    })
                );

        const sprint$ = includeSprint
            ? this.getConstructorsSprintResults(constructorId, year)
            : of([]);

        // Real API implementation
        return forkJoin([races$, sprint$]).pipe(
            map(([races, sprint]: [any[], any[]]) => {
                let cumulativePoints = 0;

                return races.map((race: any) => {

                    const raceResults = race.Results ?? [];
                    const racePoints = raceResults.reduce(
                        (sum: number, r: any) => sum + Number(r.points ?? 0),
                        0
                    );

                    const sprintRace = sprint.find(s => s.round == race.round);
                    const sprintResults = sprintRace?.SprintResults ?? [];
                    const sprintPoints = sprintResults.reduce(
                        (sum: number, r: any) => sum + Number(r.points ?? 0),
                        0
                    );

                    const totalPoints = racePoints + sprintPoints;
                    cumulativePoints += totalPoints;

                    return {
                        round: Number(race.round),
                        raceName: race.raceName,
                        // position: Number(result?.position ?? 0),
                        points: racePoints,
                        sprintPoints: sprintPoints,
                        totalPoints: totalPoints,
                        cumulativePoints,
                        sprintResults: sprint.find(s => s.round == race.round)?.SprintResults ?? [],
                        ...race,
                    };
                });
            }),
            catchError(error => {
                console.error('Error fetching team race results:', error);
                return of([]);
            })
        );
    }

    getConstructorDrivers(constructorId: string, season?: string, includeSprint: boolean = true): Observable<any[]> {
        const year = season || this.getCurrentSeason();

        // Get drivers from standings who belong to this team
        const raceResults$ = this.getConstructorRaceResults(constructorId, year, includeSprint);
        return of(this.getDriverBreakDownForRace(raceResults$));
    }

    getDriverBreakDownForRace(race: any): any[] {
        return race.Results.map((r: any) => ({
            Driver: r.Driver,
            points: Number(r.points),
            sprintPoints: Number(race.sprintResults?.find((s: any) => s.Driver.driverId === r.Driver.driverId)?.points ?? 0),
            position: r.position
        }))
    }

}