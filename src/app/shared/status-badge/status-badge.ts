import { Component, input } from "@angular/core";
import { CreditStatus, statusLabels } from "../../models/credit-request";

@Component({ selector: "app-status-badge", templateUrl: "./status-badge.html" })
export class StatusBadge {
  readonly status = input.required<CreditStatus>();
  readonly labels = statusLabels;
  readonly states = CreditStatus;
}
