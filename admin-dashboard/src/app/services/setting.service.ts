import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Setting } from '../models/setting';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private baseUrl = 'http://localhost:3000/setting';

  constructor(private http: HttpClient) {}
  saveSetting(selectedSeconds: number, selectedStopCount: number): Observable<Setting> {
    const body = {selectedSeconds, selectedStopCount };
    return this.http.post<Setting>(`${this.baseUrl}/save`, body);
  }
  getSetting(): Observable<Setting[]> { 
    return this.http.get<Setting[]>(`${this.baseUrl}/get`);
  }
}
