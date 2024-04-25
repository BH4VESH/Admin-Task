import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { VehiclePrice } from '../models/vihiclePrice';

@Injectable({
  providedIn: 'root'
})
export class VehiclePriceService {

  private apiUrl = 'http://localhost:3000/vehicle/price/add';

  constructor(private http: HttpClient) { }

  sendData(data: VehiclePrice): Observable<VehiclePrice> {
    return this.http.post<VehiclePrice>(this.apiUrl, data);
  }
}
