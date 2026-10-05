import { Component, DestroyRef, inject, signal } from "@angular/core";
import { CurrencyPipe, DatePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  EMPTY,
  Subject,
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  merge,
  switchMap,
  tap,
} from "rxjs";
import { CreditRequestService } from "../../../core/services/credit-request.service";
import { apiError } from "../../../core/http/api-error";
import {
  CreditDecision as Decision,
  CreditRequest,
  CreditStatus,
  StatusName,
  isStatusName,
  statusOptions,
} from "../../../models/credit-request";
import { StatusBadge } from "../../../shared/status-badge/status-badge";
import { CreditDecision } from "../credit-decision/credit-decision";

@Component({
  imports: [
    RouterLink,
    FormsModule,
    CurrencyPipe,
    DatePipe,
    StatusBadge,
    CreditDecision,
  ],
  templateUrl: "./credit-request-list.html",
})
export class CreditRequestList {
  private service = inject(CreditRequestService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private refresh = new Subject<void>();
  private destroyRef = inject(DestroyRef);
  readonly rows = signal<CreditRequest[]>([]);
  readonly loading = signal(false);
  readonly error = signal("");
  readonly filter = signal<StatusName | "">("");
  readonly message = signal(
    this.route.snapshot.queryParamMap.has("created")
      ? "Solicitud creada correctamente."
      : "",
  );
  readonly statuses = statusOptions;
  readonly states = CreditStatus;
  readonly selected = signal<{ row: CreditRequest; decision: Decision } | null>(
    null,
  );

  constructor() {
    const statusChanges = this.route.queryParamMap.pipe(
      map((params) => params.get("status")),
      map((value) => (isStatusName(value) ? value : ("" as const))),
      distinctUntilChanged(),
      tap((value) => this.filter.set(value)),
    );
    merge(statusChanges, this.refresh.pipe(map(() => this.filter())))
      .pipe(
        switchMap((status) => {
          this.loading.set(true);
          this.error.set("");
          return this.service.list(status || undefined).pipe(
            catchError((error: unknown) => {
              this.rows.set([]);
              this.error.set(apiError(error));
              return EMPTY;
            }),
            finalize(() => this.loading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((rows) => this.rows.set(rows));

    if (this.route.snapshot.queryParamMap.has("created")) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { created: null },
        queryParamsHandling: "merge",
        replaceUrl: true,
      });
    }
  }

  changeFilter(value: string): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { status: isStatusName(value) ? value : null },
      queryParamsHandling: "merge",
    });
  }

  reload(): void {
    this.refresh.next();
  }

  select(row: CreditRequest, decision: Decision): void {
    if (row.status === CreditStatus.Pending)
      this.selected.set({ row, decision });
  }

  decisionSaved(): void {
    this.selected.set(null);
    this.message.set("Decisión guardada correctamente.");
    this.reload();
  }
}
