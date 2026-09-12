import type { CheckInRecord, User, VisitorStore } from "@/types";

const STORAGE_KEY = "visitorflow-kiosk-store-v1";

function hoursAgo(hours: number) {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

export function getSeedStore(): VisitorStore {
  const users: User[] = [
    {
      id: "user-alice",
      identificationType: "ID",
      identificationNumber: "ID-7842-19",
      name: "Alice",
      surname: "Mokoena",
      email: "alice.mokoena@northstar.co",
      phone: "+27 71 555 0184",
      createdAt: hoursAgo(24 * 18),
    },
    {
      id: "user-daniel",
      identificationType: "PASSPORT",
      identificationNumber: "PZ4829106",
      name: "Daniel",
      surname: "van Wyk",
      email: "daniel.vanwyk@northstar.co",
      phone: "+27 82 209 4480",
      createdAt: hoursAgo(24 * 11),
    },
    {
      id: "user-nadia",
      identificationType: "ID",
      identificationNumber: "ID-9031-44",
      name: "Nadia",
      surname: "Pillay",
      email: "nadia.pillay@northstar.co",
      phone: "+27 72 991 3020",
      createdAt: hoursAgo(24 * 6),
    },
    {
      id: "user-martin",
      identificationType: "PASSPORT",
      identificationNumber: "PA1184022",
      name: "Martin",
      surname: "Okafor",
      email: "martin.okafor@northstar.co",
      phone: "+27 79 411 8702",
      createdAt: hoursAgo(24 * 4),
    },
  ];

  const records: CheckInRecord[] = [
    {
      id: "record-alice-today",
      userId: "user-alice",
      checkInTime: hoursAgo(2),
      status: "CHECKED_IN",
    },
    {
      id: "record-daniel-today",
      userId: "user-daniel",
      checkInTime: hoursAgo(4.5),
      checkOutTime: hoursAgo(1.5),
      status: "CHECKED_OUT",
    },
    {
      id: "record-nadia-yesterday",
      userId: "user-nadia",
      checkInTime: hoursAgo(27),
      checkOutTime: hoursAgo(24.5),
      status: "CHECKED_OUT",
    },
    {
      id: "record-martin-yesterday",
      userId: "user-martin",
      checkInTime: hoursAgo(31),
      checkOutTime: hoursAgo(28),
      status: "CHECKED_OUT",
    },
  ];

  return { users, records };
}

export function loadStore(): VisitorStore {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as VisitorStore;
  } catch {
    // Fall back to the seed data if storage is unavailable or malformed.
  }
  return getSeedStore();
}

export function saveStore(store: VisitorStore) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
