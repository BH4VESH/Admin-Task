import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehiclePriceService {

  private apiUrl = 'http://localhost:3000/vehicle/price/add';

  constructor(private http: HttpClient) { }

  sendData(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }
}
