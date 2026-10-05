import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideRouter } from "@angular/router";
import { Register } from "./register";

describe("Formulario de registro", () => {
  let page: Register;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    page = TestBed.createComponent(Register).componentInstance;
    http = TestBed.inject(HttpTestingController);
    page.form.setValue({
      username: "prueba.usuario",
      email: "prueba@example.test",
      password: "  frase de prueba larga  ",
    });
  });
  afterEach(() => http.verify());
  it.each(["ab", "nombre con espacios", "usuário"])(
    "rechaza usuario incompatible con el backend: %s",
    (username) => {
      page.form.patchValue({ username });
      page.submit();
      http.expectNone("/api/auth/register");
      expect(page.form.invalid).toBe(true);
    },
  );
  it("respeta la contraseña y no inicia sesión automáticamente al registrar", () => {
    page.submit();
    const request = http.expectOne("/api/auth/register");
    expect(request.request.body.password).toBe("  frase de prueba larga  ");
    request.flush({ id: "test" });
    expect(page.created()).toBe(true);
    expect(page.busy()).toBe(false);
    http.expectNone("/api/auth/login");
  });
  it("muestra conflicto de cuenta sin perder los datos ingresados", () => {
    page.submit();
    http
      .expectOne("/api/auth/register")
      .flush(
        { detail: "La cuenta ya existe." },
        { status: 409, statusText: "Conflict" },
      );
    expect(page.error()).toContain("ya existe");
    expect(page.form.controls.username.value).toBe("prueba.usuario");
    expect(page.busy()).toBe(false);
  });
});
