export enum CreditStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2,
}
export type StatusName = "Pending" | "Approved" | "Rejected";
export type CreditDecision = Exclude<StatusName, "Pending">;

export interface CreditRequest {
  id: number;
  applicantId: string;
  amount: number;
  termMonths: number;
  status: CreditStatus;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCreditRequestRequest {
  applicantId: string;
  amount: number;
  termMonths: number;
}

export interface UpdateCreditStatusRequest {
  status: CreditDecision;
  comment: string;
}

export const statusOptions: ReadonlyArray<{
  value: StatusName;
  label: string;
}> = [
  { value: "Pending", label: "Pendientes" },
  { value: "Approved", label: "Aprobadas" },
  { value: "Rejected", label: "Rechazadas" },
];
export const statusLabels: Record<CreditStatus, string> = {
  [CreditStatus.Pending]: "Pendiente",
  [CreditStatus.Approved]: "Aprobada",
  [CreditStatus.Rejected]: "Rechazada",
};
export function isStatusName(value: unknown): value is StatusName {
  return statusOptions.some((option) => option.value === value);
}
