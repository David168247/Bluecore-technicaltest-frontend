import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { Login } from "./login";

describe("Formulario de login", () => {
  let page: Login;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    page = TestBed.createComponent(Login).componentInstance;
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => {
    sessionStorage.clear();
    http.verify();
  });
  it("no envía campos vacíos", () => {
    page.submit();
    http.expectNone("/api/auth/login");
    expect(page.form.touched).toBe(true);
  });
  it("muestra credenciales inválidas y permite volver a intentar", () => {
    page.form.setValue({ usernameOrEmail: "prueba", password: "incorrecta" });
    page.submit();
    http
      .expectOne("/api/auth/login")
      .flush({}, { status: 401, statusText: "Unauthorized" });
    expect(page.error()).toContain("Credenciales incorrectas");
    expect(page.busy()).toBe(false);
  });
});
