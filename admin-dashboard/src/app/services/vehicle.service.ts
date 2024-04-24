import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private baseUrl = 'http://localhost:3000/vehicles';
  vehicleAdded = new Subject<void>();

  constructor(private http: HttpClient) { }

  getAllVehicles(): Observable<any> {
    return this.http.get(this.baseUrl + '/list');
  }

  addVehicle(name: string, icon: File): Observable<any> {
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('icon', icon);
    return this.http.post(this.baseUrl + '/add', formData).pipe(
      tap(() => this.vehicleAdded.next())
    );
  }

  editVehicle(id: string, name: string, icon: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('name', name);
    if (icon) {
      formData.append('icon', icon);
    }
    return this.http.put(`http://localhost:3000/vehicles/edit/${id}`, formData);
  }

  // Implement deleteVehicle method if needed
}
