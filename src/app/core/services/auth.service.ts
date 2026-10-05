import {
  DestroyRef,
  Injectable,
  computed,
  inject,
  signal,
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { tap } from "rxjs";
import { environment } from "../../../environments/environment";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  UserAccount,
} from "../../models/auth";

const SESSION_KEY = "creditos.session";

function validSession(value: unknown): value is LoginResponse {
  if (!value || typeof value !== "object") return false;
  const session = value as Partial<LoginResponse>;
  return (
    typeof session.accessToken === "string" &&
    !!session.accessToken &&
    session.tokenType === "Bearer" &&
    typeof session.expiresAt === "string" &&
    Date.parse(session.expiresAt) > Date.now() &&
    typeof session.user?.id === "string" &&
    typeof session.user?.username === "string" &&
    typeof session.user?.email === "string" &&
    typeof session.user?.createdAt === "string"
  );
}

@Injectable({ providedIn: "root" })
export class AuthService {
  private http = inject(HttpClient);
  private session = signal<LoginResponse | null>(this.restore());
  private timer?: ReturnType<typeof setTimeout>;
  readonly authenticated = computed(() => this.session() !== null);
  readonly user = computed(() => this.session()?.user ?? null);
  readonly sessionEnded = signal<"logout" | "expired" | null>(null);

  constructor() {
    this.scheduleExpiry();
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  login(body: LoginRequest) {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, body)
      .pipe(
        tap((value) => {
          if (!validSession(value))
            throw new Error("Respuesta de autenticación inválida.");
          this.sessionEnded.set(null);
          this.session.set(value);
          try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify(value));
          } catch {
            /* Session continues in memory if storage is unavailable. */
          }
          this.scheduleExpiry();
        }),
      );
  }

  register(body: RegisterRequest) {
    return this.http.post<UserAccount>(
      `${environment.apiUrl}/auth/register`,
      body,
    );
  }

  isAuthenticated(): boolean {
    const value = this.session();
    return !!value && Date.parse(value.expiresAt) > Date.now();
  }

  getToken(): string | null {
    if (!this.isAuthenticated()) {
      if (this.session()) this.logout("expired");
      return null;
    }
    return this.session()!.accessToken;
  }

  logout(reason: "logout" | "expired" = "logout"): void {
    clearTimeout(this.timer);
    this.sessionEnded.set(reason);
    this.session.set(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* Memory session is already cleared. */
    }
  }

  private restore(): LoginResponse | null {
    try {
      const value: unknown = JSON.parse(
        sessionStorage.getItem(SESSION_KEY) ?? "null",
      );
      if (validSession(value)) return value;
    } catch {
      /* Invalid or inaccessible browser storage never prevents startup. */
    }
    try {
      sessionStorage.removeItem(SESSION_KEY);
    } catch {
      /* Storage may be unavailable. */
    }
    return null;
  }

  private scheduleExpiry(): void {
    clearTimeout(this.timer);
    const value = this.session();
    if (value)
      this.timer = setTimeout(
        () => this.logout("expired"),
        Date.parse(value.expiresAt) - Date.now(),
      );
  }
}
