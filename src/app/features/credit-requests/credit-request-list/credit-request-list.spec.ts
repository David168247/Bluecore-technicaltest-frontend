import { TestBed } from "@angular/core/testing";
import { provideHttpClient } from "@angular/common/http";
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import {
  ActivatedRoute,
  Router,
  convertToParamMap,
  provideRouter,
} from "@angular/router";
import { BehaviorSubject } from "rxjs";
import { CreditRequestList } from "./credit-request-list";
import { CreditRequest, CreditStatus } from "../../../models/credit-request";

const sample: CreditRequest = {
  id: 42,
  applicantId: "PRUEBA",
  amount: 500,
  termMonths: 6,
  status: CreditStatus.Pending,
  comment: null,
  createdAt: "2026-10-04T12:00:00Z",
  updatedAt: "2026-10-04T12:00:00Z",
};

describe("Listado y filtros de solicitudes", () => {
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let snapshot: { queryParamMap: ReturnType<typeof convertToParamMap> };
  let http: HttpTestingController;
  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ status: "Pending" }));
    snapshot = { queryParamMap: convertToParamMap({}) };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: params.asObservable(), snapshot },
        },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    vi.spyOn(TestBed.inject(Router), "navigate").mockResolvedValue(true);
  });
  afterEach(() => http.verify());
  it("restaura el filtro desde la URL y renderiza la respuesta", async () => {
    const fixture = TestBed.createComponent(CreditRequestList);
    http.expectOne("/api/credit-requests?status=Pending").flush([sample]);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.filter()).toBe("Pending");
    expect(fixture.nativeElement.querySelector('select').value).toBe('Pending');
    expect(fixture.nativeElement.textContent).toContain("PRUEBA");
  });
  it("cancela respuestas viejas cuando cambia rápidamente el filtro", () => {
    const page = TestBed.createComponent(CreditRequestList).componentInstance;
    const oldRequest = http.expectOne("/api/credit-requests?status=Pending");
    params.next(convertToParamMap({ status: "Approved" }));
    expect(oldRequest.cancelled).toBe(true);
    http
      .expectOne("/api/credit-requests?status=Approved")
      .flush([{ ...sample, status: CreditStatus.Approved }]);
    expect(page.rows()[0].status).toBe(CreditStatus.Approved);
    expect(page.loading()).toBe(false);
  });
  it("ignora estados inválidos en la URL", () => {
    params.next(convertToParamMap({ status: "0" }));
    const page = TestBed.createComponent(CreditRequestList).componentInstance;
    http.expectOne("/api/credit-requests").flush([]);
    expect(page.filter()).toBe("");
  });
  it("recupera el listado tras un error sin perder el filtro", () => {
    const page = TestBed.createComponent(CreditRequestList).componentInstance;
    http
      .expectOne("/api/credit-requests?status=Pending")
      .flush({}, { status: 503, statusText: "Unavailable" });
    expect(page.error()).toContain("servidor");
    expect(page.loading()).toBe(false);
    page.reload();
    http.expectOne("/api/credit-requests?status=Pending").flush([sample]);
    expect(page.error()).toBe("");
    expect(page.rows()).toHaveLength(1);
  });
  it("no permite seleccionar una solicitud resuelta", () => {
    const page = TestBed.createComponent(CreditRequestList).componentInstance;
    http.expectOne("/api/credit-requests?status=Pending").flush([]);
    page.select({ ...sample, status: CreditStatus.Rejected }, "Approved");
    expect(page.selected()).toBeNull();
  });
  it("no vuelve a mostrar el éxito de creación al recargar", () => {
    snapshot.queryParamMap = convertToParamMap({ created: "1" });
    const page = TestBed.createComponent(CreditRequestList).componentInstance;
    http.expectOne("/api/credit-requests?status=Pending").flush([]);
    expect(page.message()).toContain("creada");
    expect(TestBed.inject(Router).navigate).toHaveBeenCalledWith(
      [],
      expect.objectContaining({
        queryParams: { created: null },
        replaceUrl: true,
      }),
    );
  });
});
