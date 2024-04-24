
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DriverListService {

  private baseUrl = 'http://localhost:3000/driverlist';
  userAdded = new Subject<void>();

  constructor(private http: HttpClient) { }

  getDriver(page: number, limit: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/get?page=${page}&limit=${limit}`);
  }

  getSortDriver(page: number, limit: number, sortBy: string, sortOrder: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/getshort?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`).pipe(
      catchError(error => {
        console.error('Error fetching users:', error);
        return throwError('Failed to fetch users');
      })
    );
  }
  

  addDriver(countryId:string,cityId:string,username: string, email: string, phone: string, profilePic: File): Observable<any> {
    const formData = new FormData();
    formData.append('profilePic', profilePic);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('cityId', cityId);
    formData.append('countryId', countryId);
    formData.append('phone', phone);
    
    return this.http.post(this.baseUrl + '/add', formData).pipe(
      tap(() => this.userAdded.next())
    );
  }

  deleteDriver(driverId: string): Observable<any> {
    const url = `${this.baseUrl}/delete/${driverId}`;
    return this.http.delete<any>(url);
  }

  editDriver(driverId: string, username: string, email: string, countryId: string,cityId:string, phone: string, profilePic: File | null): Observable<any> {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);
    formData.append('countryId', countryId);
    formData.append('cityId', cityId);
    formData.append('phone', phone);
    if (profilePic !==null) {
      formData.append('profilePic', profilePic);
    }
    const url = `${this.baseUrl}/edit/${driverId}`;
    return this.http.put<any>(`${this.baseUrl}/edit/${driverId}`, formData);
  }

  
  searchDriver(query: string, page: number, pageSize: number): Observable<any> {
    let params = new HttpParams();
    params = params.append('query', query);
    params = params.append('page', page.toString());
    params = params.append('pageSize', pageSize.toString());
    
    return this.http.get<any>(`${this.baseUrl}/search`, { params });
  }

  addService(driverId: string, serviceId: string): Observable<any> {
    const url = `${this.baseUrl}/service/${driverId}`;
    const body = { serviceId }; 
    return this.http.put<any>(url, body); 
  }
  addStatus(driverId: string): Observable<any> {
    const url = `${this.baseUrl}/status/${driverId}`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error(error);
        return throwError('Server error');
      })
    );
  }


}