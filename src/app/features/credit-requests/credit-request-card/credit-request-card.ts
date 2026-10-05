import { Component, input, output } from "@angular/core";
import { CurrencyPipe, DatePipe } from "@angular/common";
import {
  CreditDecision,
  CreditRequest,
  CreditStatus,
} from "../../../models/credit-request";
import { StatusBadge } from "../../../shared/status-badge/status-badge";

@Component({
  selector: "app-credit-request-card",
  imports: [CurrencyPipe, DatePipe, StatusBadge],
  templateUrl: "./credit-request-card.html",
})
export class CreditRequestCard {
  readonly credit = input.required<CreditRequest>();
  readonly decide = output<CreditDecision>();
  readonly states = CreditStatus;
}
