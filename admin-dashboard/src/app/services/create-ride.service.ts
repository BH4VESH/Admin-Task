import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User} from '../models/user';

@Injectable({
  providedIn: 'root'
})
export class CreateRideService {
  private baseUrl = 'http://localhost:3000/createride';

  constructor(private http: HttpClient) {}

  searchUsers(countryId: string, phone: string): Observable<User[]> {
    const body = { countryId, phone };

    return this.http.post<User[]>(`${this.baseUrl}/searchUser`,  body );
  }
}
