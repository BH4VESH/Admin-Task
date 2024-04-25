import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Country } from '../models/country';


@Injectable({
  providedIn: 'root'
})
export class CountryService {
  

  private apiUrl = 'https://restcountries.com/v3.1/name/';
  

  constructor(private http: HttpClient) { }

  searchCountries(query: string): Observable<Country[]> {
    return this.http.get<Country[]>(`${this.apiUrl}${query}`);
  }

  // database
  addCountry(country: Country): Observable<Country> {
    return this.http.post<Country>('http://localhost:3000/countrys/add', country);
  }
  fatchCountry(): Observable<Country[]> { 
    return this.http.get<Country[]>('http://localhost:3000/countrys/get');
  }
  

}
