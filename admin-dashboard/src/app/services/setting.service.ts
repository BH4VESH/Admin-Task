import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private baseUrl = 'http://localhost:3000/setting';

  constructor(private http: HttpClient) {}
  saveSetting(selectedSeconds: number, selectedStopCount: number): Observable<any> {
    const body = {selectedSeconds, selectedStopCount };
    console.log(body)
    return this.http.post(`${this.baseUrl}/save`, body);
  }
  getSetting(): Observable<any> { 
    return this.http.get<any>(`${this.baseUrl}/get`);
  }
}
