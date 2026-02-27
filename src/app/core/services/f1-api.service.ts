import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { environment } from "../../../environments/environment";
import { catchError, forkJoin, map, Observable, of, throwError } from "rxjs";
import { Driver, DriverStanding } from "../models/driver.model";
import { Constructor, ConstructorStanding } from "../models/team.model";
import { Race, RaceResult, QualifyingResult, Circuit } from "../models/race.model";
import { PerformanceResult, DriverPerformance, ConstructorPerformance } from "../models/analytics.model";
import { ErgastResponse } from "../models/api-response.model";
import { MOCK_DRIVER_STANDINGS } from "../data/mock-driver-standings.data";
import { MOCK_CONSTRUCTOR_STANDINGS } from "../data/mock-constructor-standings.data";
import { MOCK_RACE_CALENDAR } from "../data/mock-race-calendar.data";
import { MOCK_RACE_RESULTS } from "../data/mock-race-results.data";
import { MOCK_SPRINT_RESULTS } from "../data/mock-sprint-results.data";
import { MOCK_TEAM_PERFORMANCE } from "../data/mock-team-performance.data";
import { MOCK_SPRINT_TEAM_PERFORMANCE } from "../data/mock-sprint-team-performance.data";
import { MOCK_DETAILED_RACE_RESULTS } from "../data/mock-detailed-race-results.data";
import { MOCK_DETAILED_QUALIFYING_RESULTS } from "../data/mock-detailed-qualifying-results.data";


@Injectable({
    providedIn: 'root',
})
export class F1ApiService {

    private http = inject(HttpClient);
    private ergastBaseUrl = environment.apiUrls.ergast;
    private openF1ApiBaseUrl = environment.apiUrls.openf1;
    private useMockData = environment.useMockData;

    // --- Mapping Helpers ---

    private mapDriver(d: any): Driver {
        return {
            driverId: d.driverId,
            permanentNumber: d.permanentNumber,
            code: d.code,
            givenName: d.givenName,
            familyName: d.familyName,
            dateOfBirth: d.dateOfBirth,
            nationality: d.nationality,
            url: d.url
        };
    }

    private mapConstructor(c: any): Constructor {
        return {
            constructorId: c.constructorId,
            name: c.name,
            nationality: c.nationality,
            url: c.url
        };
    }

    private mapCircuit(c: any): Circuit {
        return {
            circuitId: c.circuitId,
            circuitName: c.circuitName,
            url: c.url,
            location: {
                lat: c.Location.lat,
                long: c.Location.long,
                locality: c.Location.locality,
                country: c.Location.country
            }
        };
    }

    private mapRace(r: any): Race {
        return {
            season: r.season,
            round: r.round,
            raceName: r.raceName,
            date: r.date,
            time: r.time,
            url: r.url,
            circuit: this.mapCircuit(r.Circuit),
            results: r.Results ? r.Results.map((res: any) => this.mapRaceResult(res)) : undefined,
            qualifyingResults: r.QualifyingResults ? r.QualifyingResults.map((res: any) => this.mapQualifyingResult(res)) : undefined,
            sprint: r.Sprint ? { date: r.Sprint.date, time: r.Sprint.time } : undefined
        };
    }

    private mapRaceResult(r: any): RaceResult {
        return {
            number: Number(r.number),
            position: Number(r.position),
            positionText: r.positionText,
            points: Number(r.points),
            driver: this.mapDriver(r.Driver),
            constructor: this.mapConstructor(r.Constructor),
            grid: Number(r.grid),
            laps: Number(r.laps),
            status: r.status,
            time: r.Time,
            fastestLap: r.FastestLap ? {
                rank: Number(r.FastestLap.rank),
                lap: Number(r.FastestLap.lap),
                time: r.FastestLap.Time,
                // averageSpeed: {
                //     units: r.FastestLap.AverageSpeed.units,
                //     speed: r.FastestLap.AverageSpeed.speed
                // }
            } : undefined
        };
    }

    private mapQualifyingResult(r: any): QualifyingResult {
        return {
            number: Number(r.number),
            position: Number(r.position),
            driver: this.mapDriver(r.Driver),
            constructor: this.mapConstructor(r.Constructor),
            q1: r.Q1,
            q2: r.Q2,
            q3: r.Q3
        };
    }

    getCurrentSeason(): string {
        return new Date().getFullYear().toString();
    }

    // Driver Standings
    getDriverStandings(season?: string): Observable<DriverStanding[]> {
        const year = season || this.getCurrentSeason();
        if (this.useMockData) {
            const mockData = MOCK_DRIVER_STANDINGS.find(item => item.season === year);
            const standings = mockData ? mockData.StandingsLists[0].DriverStandings : [];
            return of(this.mapDriverStandings(standings));
        }

        return this.http.get<ErgastResponse<any>>(`${this.ergastBaseUrl}/${year}/driverStandings.json`)
            .pipe(
                map(response => {
                    const list = response.MRData.StandingsTable?.StandingsLists[0];
                    return this.mapDriverStandings(list?.DriverStandings || []);
                }),
                catchError(error => {
                    console.error('Error fetching driver standings:', error);
                    return throwError(() => new Error('Failed to fetch driver standings'));
                })
            );
    }

    private mapDriverStandings(standings: any[]): DriverStanding[] {
        return standings.map(s => ({
            position: Number(s.position),
            positionText: s.positionText,
            points: Number(s.points),
            wins: Number(s.wins),
            driver: this.mapDriver(s.Driver),
            constructors: s.Constructors.map((c: any) => this.mapConstructor(c))
        }));
    }

    // Constructor Standings
    getConstructorStandings(season?: string): Observable<ConstructorStanding[]> {
        const year = season || this.getCurrentSeason();
        if (this.useMockData) {
            const mockData = MOCK_CONSTRUCTOR_STANDINGS.find(item => item.season === year);
            const standings = mockData ? mockData.StandingsLists[0].ConstructorStandings : [];
            return of(this.mapConstructorStandings(standings));
        }

        return this.http.get<ErgastResponse<any>>(`${this.ergastBaseUrl}/${year}/constructorStandings.json`)
            .pipe(
                map(response => {
                    const list = response.MRData.StandingsTable?.StandingsLists[0];
                    return this.mapConstructorStandings(list?.ConstructorStandings || []);
                }),
                catchError(error => {
                    console.error('Error fetching constructor standings:', error);
                    return throwError(() => new Error('Failed to fetch constructor standings'));
                })
            );
    }

    private mapConstructorStandings(standings: any[]): ConstructorStanding[] {
        return standings.map(s => ({
            position: Number(s.position),
            positionText: s.positionText,
            points: Number(s.points),
            wins: Number(s.wins),
            constructor: this.mapConstructor(s.Constructor)
        }));
    }

    // Race Calendar
    getRaceCalendar(season?: string): Observable<Race[]> {
        const year = season || this.getCurrentSeason();
        if (this.useMockData) {
            const mockData = MOCK_RACE_CALENDAR.find(item => item.season === year)
            return of(mockData ? mockData.Races.map((r: any) => this.mapRace(r)) : []);
        }

        return this.http.get<ErgastResponse<any>>(`${this.ergastBaseUrl}/${year}.json`)
            .pipe(
                map(response => response.MRData.RaceTable?.Races.map(r => this.mapRace(r)) || []),
                catchError(error => {
                    console.error('Error fetching race calendar:', error);
                    return of([]);
                })
            );
    }

    // Race Results
    getRaceResults(season: string, round: string): Observable<Race | null> {
        if (this.useMockData) {
            return of(null);
        }

        return this.http.get<ErgastResponse<any>>(`${this.ergastBaseUrl}/${season}/${round}/results.json`)
            .pipe(
                map(response => {
                    const race = response.MRData.RaceTable?.Races[0];
                    return race ? this.mapRace(race) : null;
                }),
                catchError(error => {
                    console.error('Error fetching race results:', error);
                    return of(null);
                })
            );
    }

    // Driver Details
    getDriverDetails(driverId: string): Observable<Driver | null> {
        if (this.useMockData) {
            return of(null);
        }

        return this.http.get<ErgastResponse<any>>(`${this.ergastBaseUrl}/drivers/${driverId}.json`)
            .pipe(
                map(response => {
                    const driver = response.MRData.DriverTable?.Drivers[0];
                    return driver ? this.mapDriver(driver) : null;
                }),
                catchError(error => {
                    console.error('Error fetching driver details:', error);
                    return of(null);
                })
            );
    }

    // Qualifying Results
    getQualifyingResults(season: string, round: string): Observable<Race | null> {
        if (this.useMockData) {
            return of(null);
        }

        return this.http.get<ErgastResponse<any>>(`${this.ergastBaseUrl}/${season}/${round}/qualifying.json`)
            .pipe(
                map(response => {
                    const race = response.MRData.RaceTable?.Races[0];
                    return race ? this.mapRace(race) : null;
                }),
                catchError(error => {
                    console.error('Error fetching qualifying results:', error);
                    return of(null);
                })
            );
    }

    getDriverSprintResults(driverId: string, year: string): Observable<Race[]> {
        if (this.useMockData) {
            const mockData = MOCK_SPRINT_RESULTS.find(item => item.season === year && item.driverId === driverId);
            return of(mockData ? mockData.Races.map((r: any) => this.mapRace(r)) : []);
        }

        return this.http
            .get<ErgastResponse<any>>(`${this.ergastBaseUrl}/${year}/drivers/${driverId}/sprint.json?limit=100`)
            .pipe(
                map(res => res.MRData.RaceTable?.Races.map(r => this.mapRace(r)) || []),
                catchError(() => of([])),
            );
    }

    getConstructorsSprintResults(constructorId: string, year: string): Observable<Race[]> {
        if (this.useMockData) {
            const mockData = MOCK_SPRINT_TEAM_PERFORMANCE.find(item => item.season === year && item.constructorId === constructorId);
            return of(mockData ? mockData.Races.map((r: any) => this.mapRace(r)) : []);
        }

        return this.http
            .get<ErgastResponse<any>>(`${this.ergastBaseUrl}/${year}/constructors/${constructorId}/sprint.json?limit=100`)
            .pipe(
                map(res => res.MRData.RaceTable?.Races.map(r => this.mapRace(r)) || []),
                catchError(() => of([])),
            );
    }

    getDriverRaceResults(driverId: string, season?: string, includeSprint = true): Observable<PerformanceResult[]> {
        const year = season || this.getCurrentSeason();

        const races$ = this.useMockData
            ? of(MOCK_RACE_RESULTS.find(item => item.season === year && item.driverId === driverId)?.Races.map(r => this.mapRace(r)) ?? [])
            : this.http
                .get<ErgastResponse<any>>(`${this.ergastBaseUrl}/${year}/drivers/${driverId}/results.json?limit=100`)
                .pipe(
                    map(response => response.MRData.RaceTable?.Races.map(r => this.mapRace(r)) || []),
                    catchError(error => {
                        console.error('Error fetching driver race results:', error);
                        return of([]);
                    })
                );

        const sprint$ = includeSprint
            ? this.getDriverSprintResults(driverId, year)
            : of([]);


        return forkJoin([races$, sprint$]).pipe(
            map(([races, sprint]: [Race[], Race[]]) => {
                let cumulativePoints = 0;
                return races.map((race: Race) => {
                    const result = race.results?.[0];
                    const racePoints = Number(result?.points ?? 0);
                    const sprintPoints = Number(sprint.find(s => s.round == race.round)?.results?.[0]?.points ?? 0);
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

    getMultipleDriversRaceResults(driverIds: string[], season?: string): Observable<DriverPerformance[]> {
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

    getConstructorRaceResults(constructorId: string, season?: string, includeSprint: boolean = true): Observable<ConstructorPerformance[]> {
        const year = season || this.getCurrentSeason();

        const races$ = this.useMockData
            ? of(MOCK_TEAM_PERFORMANCE.find(item => item.season === year && item.constructorId === constructorId)?.Races.map(r => this.mapRace(r)) ?? [])
            : this.http
                .get<ErgastResponse<any>>(`${this.ergastBaseUrl}/${year}/constructors/${constructorId}/results.json?limit=100`)
                .pipe(
                    map(response => response.MRData.RaceTable?.Races.map(r => this.mapRace(r)) || []),
                    catchError(error => {
                        console.error('Error fetching constructor race results:', error);
                        return of([]);
                    })
                );

        const sprint$ = includeSprint
            ? this.getConstructorsSprintResults(constructorId, year)
            : of([]);

        return forkJoin([races$, sprint$]).pipe(
            map(([races, sprint]: [Race[], Race[]]) => {
                let cumulativePoints = 0;

                return races.map((race: Race) => {
                    const raceResults = race.results ?? [];
                    const racePoints = raceResults.reduce(
                        (sum: number, r: RaceResult) => sum + Number(r.points ?? 0),
                        0
                    );

                    const sprintRace = sprint.find(s => s.round == race.round);
                    const sprintResults = sprintRace?.results ?? [];
                    const sprintPoints = sprintResults.reduce(
                        (sum: number, r: RaceResult) => sum + Number(r.points ?? 0),
                        0
                    );

                    const totalPoints = racePoints + sprintPoints;
                    cumulativePoints += totalPoints;

                    return {
                        ...race,
                        sprintPoints: sprintPoints,
                        totalPoints: totalPoints,
                        cumulativePoints,
                        sprintResults: sprintResults
                    } as ConstructorPerformance;
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

        return this.getConstructorRaceResults(constructorId, year, includeSprint).pipe(
            map(results => {
                return results.length > 0 ? this.getDriverBreakDownForRace(results[results.length - 1]) : [];
            })
        );
    }

    public getDriverBreakDownForRace(race: ConstructorPerformance): any[] {
        return (race.results || []).map((r: RaceResult) => ({
            driver: r.driver,
            points: Number(r.points),
            sprintPoints: Number(race.sprintResults?.find((s: any) => s.driver.driverId === r.driver.driverId)?.points ?? 0),
            position: r.position
        }));
    }

    getRaceDetails(season: string, round: string): Observable<Race | null> {
        const year = season || this.getCurrentSeason();
        if (this.useMockData) {
            const raceData = MOCK_DETAILED_RACE_RESULTS.find(item => item.season === year && item.round === round);
            return of(raceData?.Races[0] ? this.mapRace(raceData.Races[0]) : null);
        }

        return this.http.get<ErgastResponse<any>>(`${this.ergastBaseUrl}/${year}/${round}/results.json`)
            .pipe(
                map(response => {
                    const race = response.MRData.RaceTable?.Races[0];
                    return race ? this.mapRace(race) : null;
                }),
                catchError(error => {
                    console.error('Error fetching race details:', error);
                    return of(null);
                })
            );
    }

    getQualifyingDetails(season: string, round: string): Observable<QualifyingResult[]> {
        const year = season || this.getCurrentSeason();
        if (this.useMockData) {
            const raceData = MOCK_DETAILED_QUALIFYING_RESULTS.find(item => item.season === year && item.round === round);
            return of(raceData?.Races[0].QualifyingResults.map((r: any) => this.mapQualifyingResult(r)) || []);
        }

        return this.http.get<ErgastResponse<any>>(`${this.ergastBaseUrl}/${year}/${round}/qualifying.json`)
            .pipe(
                map(response => {
                    const race = response.MRData.RaceTable?.Races[0];
                    return race?.QualifyingResults?.map((r: any) => this.mapQualifyingResult(r)) || [];
                }),
                catchError(error => {
                    console.error('Error fetching qualifying results:', error);
                    return of([]);
                })
            );
    }

    // Circuits
    getCircuits(season?: string): Observable<Circuit[]> {
        const year = season || this.getCurrentSeason();
        // For circuits, Ergast has /{year}/circuits.json
        return this.http.get<ErgastResponse<any>>(`${this.ergastBaseUrl}/${year}/circuits.json`)
            .pipe(
                map(response => response.MRData.CircuitTable?.Circuits.map(c => this.mapCircuit(c)) || []),
                catchError(error => {
                    console.error('Error fetching circuits:', error);
                    return of([]);
                })
            );
    }
}