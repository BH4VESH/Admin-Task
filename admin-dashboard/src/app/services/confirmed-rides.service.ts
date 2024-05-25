import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfirmedRidesService {
  private baseUrl = 'http://localhost:3000/confirmedride';

  constructor(private http: HttpClient) { }

  getRideList(page: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getRideList?page=${page}&limit=${limit}`);
  }

  searchRides(statusSearch: number, vehicleSearch: string, search: string, page: number, limit: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/search`, {statusSearch, vehicleSearch, search, page, limit});
  }
  
}
