import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../../environments/environment";
import {
  CreditRequest,
  CreateCreditRequestRequest,
  StatusName,
  UpdateCreditStatusRequest,
} from "../../models/credit-request";

@Injectable({ providedIn: "root" })
export class CreditRequestService {
  private http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/credit-requests`;

  list(status?: StatusName) {
    return this.http.get<CreditRequest[]>(this.url, {
      params: status ? { status } : {},
    });
  }

  getById(id: number) {
    return this.http.get<CreditRequest>(`${this.url}/${id}`);
  }

  create(body: CreateCreditRequestRequest) {
    return this.http.post<CreditRequest>(this.url, body);
  }

  updateStatus(id: number, body: UpdateCreditStatusRequest) {
    return this.http.patch<CreditRequest>(`${this.url}/${id}/status`, body);
  }
}
