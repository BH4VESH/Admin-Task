import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AddCardResponse, CustomerCardsResponse } from '../models/card'

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private baseUrl = 'http://localhost:3000/users'; 

  constructor(private http: HttpClient) { }

  addCard(CostomerId: any, token: any): Observable<AddCardResponse> {
    const payload = { CostomerId, token };
    return this.http.post<AddCardResponse>(`${this.baseUrl}/add-card`, payload);
  }
  getCustomerCards(customerId: string): Observable<CustomerCardsResponse> {
    return this.http.get<CustomerCardsResponse>(`${this.baseUrl}/cards/${customerId}`);
  }
  setDefaultCard(customerId: string, cardId: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/cards/set-default`, { customerId, cardId });
  }
  deleteCard(customerId: string, cardId: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${customerId}/cards/${cardId}`);
  }
} 
