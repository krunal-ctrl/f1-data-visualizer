import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, of, catchError } from 'rxjs';
import { WeatherData } from '../models/weather.model';

@Injectable({
  providedIn: 'root',
})
export class WeatherService {
  private http = inject(HttpClient);


  getWeatherForSessions(
    lat: string,
    lon: string,
    sessions: { [key: string]: { date: string; time?: string } },
  ): Observable<{ [key: string]: WeatherData | null }> {
    const sessionEntries = Object.entries(sessions).filter(([, s]) => s?.date);
    if (sessionEntries.length === 0) return of({});

    const dates = sessionEntries.map(([, s]) => new Date(s.date));
    const startDate = dates.reduce((a, b) => (a < b ? a : b));
    const endDate = dates.reduce((a, b) => (a > b ? a : b));

    const url = this.buildHourlyUrl(lat, lon, startDate, endDate);

    return this.http.get<any>(url).pipe(
      map((response) => {
        const result: { [key: string]: WeatherData | null } = {};
        if (!response || !response.hourly || !response.hourly.time) return result;

        const times: string[] = response.hourly.time;

        sessionEntries.forEach(([name, session]) => {
          const index = this.findIndexForSession(times, session.date, session.time);
          if (index === -1) {
            result[name] = null;
            return;
          }

          result[name] = this.mapHourlyToWeather(response.hourly, index);
        });

        return result;
      }),
      catchError((error) => {
        console.error('Error fetching weather data:', error);
        return of({});
      }),
    );
  }

  // Fetch weather for a specific timestamp
  getWeatherForDate(
    lat: string,
    lon: string,
    date: string,
    time?: string,
  ): Observable<WeatherData | null> {
    const targetDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const url = this.buildHourlyUrl(lat, lon, targetDate, targetDate);

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (!response || !response.hourly || !response.hourly.time.length) return null;

        const times: string[] = response.hourly.time;
        const index = this.findIndexForSession(times, date, time);
        const finalIndex = index === -1 ? 14 : index;

        return this.mapHourlyToWeather(response.hourly, finalIndex);
      }),
      catchError((error) => {
        console.error('Error fetching weather data:', error);
        return of(null);
      }),
    );
  }

  getWeather(lat: string, lon: string): Observable<WeatherData | null> {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        const current = response.current;
        if (!current) return null;
        return {
          temperature: Math.round(current.temperature_2m),
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          condition: this.mapWeatherCode(current.weather_code),
          icon: this.getWeatherIcon(current.weather_code),
        };
      }),
      catchError((error) => {
        console.error('Error fetching weather data:', error);
        return of(null);
      }),
    );
  }

  // Helper: choose archive vs forecast and build hourly URL
  private buildHourlyUrl(lat: string, lon: string, start: Date, end: Date): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isPast = end < today;
    const isFuture = start >= today;

    const baseUrl = isPast
      ? 'https://archive-api.open-meteo.com/v1/archive'
      : isFuture
        ? 'https://api.open-meteo.com/v1/forecast'
        : 'https://api.open-meteo.com/v1/forecast';

    const format = (d: Date) => d.toISOString().split('T')[0];

    return `${baseUrl}?latitude=${lat}&longitude=${lon}&start_date=${format(start)}&end_date=${format(end)}&hourly=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;
  }

  // Helper: find index in hourly array matching date/time
  private findIndexForSession(times: string[], date: string, time?: string): number {
    const targetHour = time ? time.split(':')[0] : '14';
    const targetTimeStr = `${date}T${targetHour.padStart(2, '0')}:00`;

    let index = times.findIndex((t) => t.startsWith(targetTimeStr));
    if (index !== -1) return index;

    index = times.findIndex((t) => t.startsWith(date));
    return index;
  }

  // Helper: map hourly block values at index to WeatherData
  private mapHourlyToWeather(hourly: any, index: number): WeatherData {
    return {
      temperature: Math.round(hourly.temperature_2m[index]),
      humidity: hourly.relative_humidity_2m[index],
      windSpeed: Math.round(hourly.wind_speed_10m[index]),
      condition: this.mapWeatherCode(hourly.weather_code[index]),
      icon: this.getWeatherIcon(hourly.weather_code[index]),
    };
  }

  private mapWeatherCode(code: number): string {
    if (code === 0) return 'Clear sky';
    if (code >= 1 && code <= 3) return 'Mainly clear, partly cloudy, and overcast';
    if (code >= 45 && code <= 48) return 'Fog and depositing rime fog';
    if (code >= 51 && code <= 55) return 'Drizzle: Light, moderate, and dense intensity';
    if (code >= 61 && code <= 65) return 'Rain: Slight, moderate and heavy intensity';
    if (code >= 71 && code <= 77) return 'Snow fall: Slight, moderate, and heavy intensity';
    if (code >= 80 && code <= 82) return 'Rain showers: Slight, moderate, and violent';
    if (code >= 95 && code <= 99) return 'Thunderstorm: Slight or moderate';
    return 'Unknown';
  }

  private getWeatherIcon(code: number): string {
    if (code === 0) return '☀️';
    if (code >= 1 && code <= 3) return '⛅';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 55) return '🌧️';
    if (code >= 61 && code <= 65) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '🌦️';
    if (code >= 95 && code <= 99) return '⛈️';
    return '🌡️';
  }
}
