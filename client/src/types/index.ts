export type IdentificationType = "ID" | "PASSPORT";
export type CheckInStatus = "CHECKED_IN" | "CHECKED_OUT";

export interface User {
  id: string;
  identificationType: IdentificationType;
  identificationNumber: string;
  name: string;
  surname: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface CheckInRecord {
  id: string;
  userId: string;
  checkInTime: string;
  checkOutTime?: string;
  status: CheckInStatus;
}

export interface VisitorStore {
  users: User[];
  records: CheckInRecord[];
}

export interface CheckInSuccess {
  name: string;
  checkInTime: string;
}

export const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
};

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function isToday(value?: string) {
  if (!value) return false;
  const date = new Date(value);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function initials(user?: Pick<User, "name" | "surname"> | null) {
  if (!user) return "VF";
  return `${user.name.charAt(0)}${user.surname.charAt(0)}`.toUpperCase();
}

export function getRecordUser(record: CheckInRecord, users: User[]) {
  return users.find((user) => user.id === record.userId);
}
