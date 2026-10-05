import { Component, DestroyRef, inject, signal } from "@angular/core";
import { FormBuilder, ReactiveFormsModule, Validators } from "@angular/forms";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { finalize } from "rxjs";
import { AuthService } from "../../../core/services/auth.service";
import { apiError } from "../../../core/http/api-error";
import { safeReturnUrl } from "../../../core/guards/auth.guard";
import { AuthLayout } from "../../../shared/auth-layout/auth-layout";

@Component({
  imports: [ReactiveFormsModule, RouterLink, AuthLayout],
  templateUrl: "./login.html",
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  readonly expired = this.route.snapshot.queryParamMap.has("expired");
  readonly busy = signal(false);
  readonly error = signal("");
  readonly form = inject(FormBuilder).nonNullable.group({
    usernameOrEmail: [
      "",
      [
        Validators.required,
        Validators.maxLength(250),
        Validators.pattern(/\S/),
      ],
    ],
    password: [
      "",
      [
        Validators.required,
        Validators.maxLength(120),
        Validators.pattern(/\S/),
      ],
    ],
  });

  submit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.busy()) return;
    this.error.set("");
    this.busy.set(true);
    const value = this.form.getRawValue();
    this.auth
      .login({
        usernameOrEmail: value.usernameOrEmail.trim(),
        password: value.password,
      })
      .pipe(
        finalize(() => this.busy.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () =>
          void this.router.navigateByUrl(
            safeReturnUrl(this.route.snapshot.queryParamMap.get("returnUrl")),
          ),
        error: (error: unknown) => this.error.set(apiError(error)),
      });
  }
}
