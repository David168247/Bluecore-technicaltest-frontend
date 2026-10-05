import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import {
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
  UrlTree,
  provideRouter,
} from "@angular/router";
import { AuthService } from "./auth.service";
import { authGuard, safeReturnUrl } from "../guards/auth.guard";
import { LoginResponse } from "../../models/auth";

const response = (): LoginResponse => ({
  accessToken: "test-token",
  tokenType: "Bearer",
  expiresAt: new Date(Date.now() + 60_000).toISOString(),
  user: {
    id: "test-user",
    username: "prueba",
    email: "prueba@example.test",
    createdAt: new Date().toISOString(),
  },
});

describe("Sesión y rutas privadas", () => {
  function configure() {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
  }
  beforeEach(() => {
    vi.useFakeTimers();
    sessionStorage.clear();
    configure();
  });
  afterEach(() => {
    TestBed.inject(AuthService).logout();
    TestBed.inject(HttpTestingController).verify();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  function login(): AuthService {
    const auth = TestBed.inject(AuthService);
    auth
      .login({ usernameOrEmail: "prueba", password: "frase de prueba" })
      .subscribe();
    TestBed.inject(HttpTestingController)
      .expectOne("/api/auth/login")
      .flush(response());
    return auth;
  }

  it("conserva sesión válida al volver a crear el servicio", () => {
    login();
    TestBed.resetTestingModule();
    configure();
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(true);
    expect(TestBed.inject(AuthService).user()?.username).toBe("prueba");
  });
  it("elimina JWT al salir", () => {
    const auth = login();
    auth.logout();
    expect(auth.getToken()).toBeNull();
    expect(auth.sessionEnded()).toBe("logout");
    expect(sessionStorage.getItem("creditos.session")).toBeNull();
  });
  it("expira automáticamente y distingue expiración de logout", () => {
    const auth = login();
    vi.advanceTimersByTime(60_001);
    expect(auth.authenticated()).toBe(false);
    expect(auth.sessionEnded()).toBe("expired");
    expect(auth.getToken()).toBeNull();
  });
  it.each([
    "{json incompleto",
    JSON.stringify({ accessToken: "token", expiresAt: "2099-01-01" }),
    JSON.stringify({ ...response(), expiresAt: "2000-01-01" }),
  ])("descarta sesión inválida sin romper el inicio", (value) => {
    sessionStorage.setItem("creditos.session", value);
    expect(TestBed.inject(AuthService).isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem("creditos.session")).toBeNull();
  });
  it("funciona en memoria si el navegador bloquea sessionStorage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("Storage blocked");
    });
    expect(login().isAuthenticated()).toBe(true);
  });
  it("el guard conserva la ruta privada que se intentó abrir", () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard(
        {} as ActivatedRouteSnapshot,
        { url: "/solicitudes/nueva" } as RouterStateSnapshot,
      ),
    );
    expect(TestBed.inject(Router).serializeUrl(result as UrlTree)).toBe(
      "/login?returnUrl=%2Fsolicitudes%2Fnueva",
    );
  });
  it.each([
    "https://example.test",
    "//example.test",
    "/login",
    "/solicitudes-externas",
    "/solicitudes/../registro",
  ])("rechaza un destino de retorno ajeno: %s", (value) => {
    expect(safeReturnUrl(value)).toBe("/solicitudes");
  });
  it("acepta retornar a crear solicitud", () => {
    expect(safeReturnUrl("/solicitudes/nueva")).toBe("/solicitudes/nueva");
  });
});
