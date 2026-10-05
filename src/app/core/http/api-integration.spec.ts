import { TestBed } from "@angular/core/testing";
import {
  HttpClient,
  HttpErrorResponse,
  provideHttpClient,
  withInterceptors,
} from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { Router, provideRouter } from "@angular/router";
import { TimeoutError } from "rxjs";
import { apiInterceptor } from "../interceptors/api.interceptor";
import { AuthService } from "../services/auth.service";
import { CreditRequestService } from "../services/credit-request.service";
import { apiError } from "./api-error";

describe("Contratos HTTP e interceptor de API", () => {
  let http: HttpTestingController;
  let auth: AuthService;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([apiInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
  });
  afterEach(() => {
    auth.logout();
    http.verify();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });
  function login() {
    auth
      .login({ usernameOrEmail: "prueba", password: "frase de prueba" })
      .subscribe();
    const request = http.expectOne("/api/auth/login");
    expect(request.request.headers.has("Authorization")).toBe(false);
    request.flush({
      accessToken: "test-token",
      tokenType: "Bearer",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
      user: {
        id: "test",
        username: "prueba",
        email: "prueba@example.test",
        createdAt: new Date().toISOString(),
      },
    });
  }
  it("envía Bearer y nombre de enum, conserva el estado numérico recibido", () => {
    login();
    TestBed.inject(CreditRequestService)
      .list("Rejected")
      .subscribe((rows) => expect(rows[0].status).toBe(2));
    const request = http.expectOne("/api/credit-requests?status=Rejected");
    expect(request.request.headers.get("Authorization")).toBe(
      "Bearer test-token",
    );
    request.flush([{ id: 1, status: 2 }]);
  });
  it.each([
    "https://example.test/api/credit-requests",
    "/api-externa/credit-requests",
  ])("no filtra JWT a otro destino: %s", (url) => {
    login();
    TestBed.inject(HttpClient).get(url).subscribe();
    const request = http.expectOne(url);
    expect(request.request.headers.has("Authorization")).toBe(false);
    request.flush({});
  });
  it("no adjunta JWT al registro público", () => {
    login();
    auth
      .register({
        username: "prueba",
        email: "prueba@example.test",
        password: "frase de prueba",
      })
      .subscribe();
    const request = http.expectOne("/api/auth/register");
    expect(request.request.headers.has("Authorization")).toBe(false);
    request.flush({});
  });
  it("cierra sesión y redirige si una ruta privada devuelve 401", () => {
    const navigate = vi
      .spyOn(TestBed.inject(Router), "navigate")
      .mockResolvedValue(true);
    login();
    TestBed.inject(CreditRequestService)
      .list()
      .subscribe({ error: () => {} });
    http
      .expectOne("/api/credit-requests")
      .flush({}, { status: 401, statusText: "Unauthorized" });
    expect(auth.getToken()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(["/login"], {
      queryParams: { expired: "1" },
    });
  });
  it("envía PATCH con estado por nombre y comentario", () => {
    login();
    const body = {
      status: "Approved" as const,
      comment: "Prueba de contrato HTTP",
    };
    TestBed.inject(CreditRequestService).updateStatus(12, body).subscribe();
    const request = http.expectOne("/api/credit-requests/12/status");
    expect(request.request.method).toBe("PATCH");
    expect(request.request.body).toEqual(body);
    request.flush({ id: 12 });
  });
  it("cancela una API que excede el tiempo de espera", () => {
    vi.useFakeTimers();
    login();
    let failure: unknown;
    TestBed.inject(CreditRequestService)
      .list()
      .subscribe({ error: (error) => (failure = error) });
    const request = http.expectOne("/api/credit-requests");
    vi.advanceTimersByTime(20_001);
    expect(request.cancelled).toBe(true);
    expect(failure).toBeInstanceOf(TimeoutError);
    expect(apiError(failure)).toContain("tardó demasiado");
  });
  it("muestra errores de validación ProblemDetails", () => {
    expect(
      apiError(
        new HttpErrorResponse({
          status: 400,
          error: {
            errors: {
              Amount: ["Monto inválido"],
              TermMonths: ["Plazo inválido"],
            },
          },
        }),
      ),
    ).toBe("Monto inválido Plazo inválido");
  });
  it.each([500, 503])("oculta detalles internos de HTTP %s", (status) => {
    expect(
      apiError(
        new HttpErrorResponse({
          status,
          error: { detail: "contraseña interna de servidor" },
        }),
      ),
    ).not.toContain("contraseña");
  });
});
