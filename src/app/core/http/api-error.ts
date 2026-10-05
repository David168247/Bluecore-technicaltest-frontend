import { HttpErrorResponse } from "@angular/common/http";
import { TimeoutError } from "rxjs";

interface ProblemDetails {
  detail?: string;
  errors?: Record<string, unknown>;
}

export function apiError(error: unknown): string {
  if (error instanceof TimeoutError)
    return "El servidor tardó demasiado en responder. Vuelve a intentar.";
  if (!(error instanceof HttpErrorResponse))
    return "No se pudo completar la operación.";
  if (error.status === 0)
    return "No se pudo conectar con el servidor. Comprueba que el backend esté iniciado.";
  if (error.status >= 500)
    return "El servidor no pudo completar la operación. Intenta nuevamente más tarde.";
  if (error.status === 401)
    return "Credenciales incorrectas o sesión expirada. Inicia sesión nuevamente.";
  if (error.status === 403)
    return "No tienes permiso para realizar esta operación.";
  if (error.status === 404)
    return "La solicitud no existe. Actualiza el listado.";
  if (error.status === 429)
    return "Demasiados intentos. Espera un minuto antes de volver a intentar.";
  const problem: ProblemDetails | null =
    error.error && typeof error.error === "object" ? error.error : null;
  if (error.status === 400 && problem?.errors) {
    const messages = Object.values(problem.errors)
      .flat()
      .filter((value): value is string => typeof value === "string");
    if (messages.length) return messages.join(" ");
  }
  return typeof problem?.detail === "string"
    ? problem.detail
    : "Revisa los datos e intenta nuevamente.";
}
