import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { provideRouter, Router } from "@angular/router";
import { CreateCreditRequest } from "./create-credit-request";

describe("Formulario de crédito", () => {
  let page: CreateCreditRequest;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    page = TestBed.createComponent(CreateCreditRequest).componentInstance;
    http = TestBed.inject(HttpTestingController);
    page.form.patchValue({ applicantId: "PRUEBA", amount: 500, termMonths: 6 });
  });
  afterEach(() => http.verify());

  it.each([499, 50001])("rechaza monto fuera de rango: %s", (amount) => {
    page.form.patchValue({ amount });
    page.submit();
    expect(page.form.invalid).toBe(true);
    http.expectNone("/api/credit-requests");
  });
  it.each([5, 61, 6.5])("rechaza plazo inválido: %s", (termMonths) => {
    page.form.patchValue({ termMonths });
    page.submit();
    expect(page.form.invalid).toBe(true);
    http.expectNone("/api/credit-requests");
  });
  it("rechaza cédula formada únicamente por espacios", () => {
    page.form.patchValue({ applicantId: "   " });
    page.submit();
    expect(page.form.invalid).toBe(true);
    http.expectNone("/api/credit-requests");
  });
  it.each([
    [500, 6],
    [50000, 60],
  ])(
    "acepta los límites %s y %s sin duplicar el envío",
    (amount, termMonths) => {
      const navigate = vi
        .spyOn(TestBed.inject(Router), "navigate")
        .mockResolvedValue(true);
      page.form.patchValue({ applicantId: " PRUEBA ", amount, termMonths });
      page.submit();
      page.submit();
      const request = http.expectOne("/api/credit-requests");
      expect(request.request.body).toEqual({
        applicantId: "PRUEBA",
        amount,
        termMonths,
      });
      request.flush({ id: 1 });
      expect(page.busy()).toBe(false);
      expect(navigate).toHaveBeenCalled();
    },
  );
});
