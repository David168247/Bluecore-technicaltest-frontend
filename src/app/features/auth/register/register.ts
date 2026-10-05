import { Component, DestroyRef, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { AuthService } from "../../../core/services/auth.service";
import { apiError } from "../../../core/http/api-error";
import { AuthLayout } from "../../../shared/auth-layout/auth-layout";

@Component({
  imports: [ReactiveFormsModule, RouterLink, AuthLayout],
  templateUrl: "./register.html",
})
export class Register {
  private auth = inject(AuthService);
  private destroyRef = inject(DestroyRef);
  readonly busy = signal(false);
  readonly error = signal("");
  readonly created = signal(false);
  readonly form = inject(FormBuilder).nonNullable.group({
    username: [
      "",
      [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        Validators.pattern(/^[a-zA-Z0-9_.-]+$/),
      ],
    ],
    email: [
      "",
      [Validators.required, Validators.email, Validators.maxLength(250)],
    ],
    password: [
      "",
      [
        Validators.required,
        Validators.minLength(12),
        Validators.maxLength(120),
        Validators.pattern(/\S/),
      ],
    ],
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy() || this.created()) return;
    this.busy.set(true);
    this.error.set("");
    const value = this.form.getRawValue();
    this.auth
      .register({ ...value, email: value.email.trim() })
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.created.set(true);
          this.form.reset();
        },
        error: (error: unknown) => this.error.set(apiError(error)),
      });
  }
}
