import {
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  output,
  signal,
  viewChild,
} from "@angular/core";
import { CurrencyPipe } from "@angular/common";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import {
  CreditDecision as Decision,
  CreditRequest,
} from "../../../models/credit-request";
import { CreditRequestService } from "../../../core/services/credit-request.service";
import { apiError } from "../../../core/http/api-error";

@Component({
  selector: "app-credit-decision",
  imports: [CurrencyPipe, ReactiveFormsModule],
  templateUrl: "./credit-decision.html",
})
export class CreditDecision {
  readonly credit = input.required<CreditRequest>();
  readonly decision = input.required<Decision>();
  readonly saved = output<void>();
  readonly closed = output<void>();
  private service = inject(CreditRequestService);
  private destroyRef = inject(DestroyRef);
  private dialog = viewChild.required<ElementRef<HTMLDialogElement>>("dialog");
  readonly busy = signal(false);
  readonly error = signal("");
  readonly form = inject(FormBuilder).nonNullable.group({
    comment: [
      "",
      [
        Validators.required,
        Validators.maxLength(2000),
        Validators.pattern(/\S/),
      ],
    ],
  });

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
    this.destroyRef.onDestroy(() => this.dialog().nativeElement.close());
  }

  cancel(event?: Event): void {
    event?.preventDefault();
    if (!this.busy()) this.closed.emit();
  }

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.busy.set(true);
    this.error.set("");
    this.service
      .updateStatus(this.credit().id, {
        status: this.decision(),
        comment: this.form.getRawValue().comment.trim(),
      })
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => this.saved.emit(),
        error: (error: unknown) => this.error.set(apiError(error)),
      });
  }
}
