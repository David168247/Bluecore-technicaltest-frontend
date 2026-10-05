import { Component, DestroyRef, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { CreditRequestService } from "../../../core/services/credit-request.service";
import { apiError } from "../../../core/http/api-error";

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: "./create-credit-request.html",
})
export class CreateCreditRequest {
  private service = inject(CreditRequestService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  readonly busy = signal(false);
  readonly error = signal("");
  readonly form = inject(FormBuilder).nonNullable.group({
    applicantId: [
      "",
      [Validators.required, Validators.maxLength(50), Validators.pattern(/\S/)],
    ],
    amount: [
      500,
      [Validators.required, Validators.min(500), Validators.max(50000)],
    ],
    termMonths: [
      12,
      [
        Validators.required,
        Validators.min(6),
        Validators.max(60),
        Validators.pattern(/^\d+$/),
      ],
    ],
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    this.error.set("");
    const value = this.form.getRawValue();
    this.service
      .create({ ...value, applicantId: value.applicantId.trim() })
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () =>
          void this.router.navigate(["/solicitudes"], {
            queryParams: { created: "1" },
          }),
        error: (error: unknown) => this.error.set(apiError(error)),
      });
  }
}
