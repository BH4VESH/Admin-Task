import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private baseUrl = 'http://localhost:3000/users'; // Change this to your backend URL

  constructor(private http: HttpClient) { }

  // createCustomer(email: string, name: string): Observable<any> {
  //   const payload = { email, name };
  //   return this.http.post<any>(`${this.baseUrl}/create-customer`, payload);
  // }
  addCard(CostomerId: any, token: any): Observable<any> {
    const payload = { CostomerId, token };
    return this.http.post<any>(`${this.baseUrl}/add-card`, payload);
  }
  getCustomerCards(customerId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/cards/${customerId}`);
  }
  setDefaultCard(customerId: string, cardId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cards/set-default`, { customerId, cardId });
  }
  deleteCard(customerId: string, cardId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${customerId}/cards/${cardId}`);
  }
} 
