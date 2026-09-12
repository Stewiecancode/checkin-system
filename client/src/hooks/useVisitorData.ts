import { useCallback, useEffect, useMemo, useState } from "react";
import type { CheckInRecord, IdentificationType, User, VisitorStore } from "@/types";
import { createId, loadStore, saveStore } from "@/services/storage";

export function useVisitorData() {
  const [store, setStore] = useState<VisitorStore>(() => loadStore());

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const findUser = useCallback((type: IdentificationType, number: string) => {
    const normalized = number.trim().toLowerCase();
    return store.users.find(
      (user) =>
        user.identificationType === type &&
        user.identificationNumber.toLowerCase() === normalized,
    );
  }, [store.users]);

  const activeRecordFor = useCallback((userId: string) => {
    return store.records.find((record) => record.userId === userId && record.status === "CHECKED_IN");
  }, [store.records]);

  const checkIn = useCallback((userId: string): CheckInRecord | null => {
    const existing = store.records.find((record) => record.userId === userId && record.status === "CHECKED_IN");
    if (existing) return null;
    const record: CheckInRecord = {
      id: createId("record"),
      userId,
      checkInTime: new Date().toISOString(),
      status: "CHECKED_IN",
    };
    setStore((current) => ({ ...current, records: [record, ...current.records] }));
    return record;
  }, [store.records]);

  const registerAndCheckIn = useCallback((input: Omit<User, "id" | "createdAt">) => {
    const user: User = {
      ...input,
      id: createId("user"),
      createdAt: new Date().toISOString(),
    };
    const record: CheckInRecord = {
      id: createId("record"),
      userId: user.id,
      checkInTime: new Date().toISOString(),
      status: "CHECKED_IN",
    };
    setStore((current) => ({
      users: [user, ...current.users],
      records: [record, ...current.records],
    }));
    return { user, record };
  }, []);

  const checkOut = useCallback((recordId: string) => {
    const checkOutTime = new Date().toISOString();
    setStore((current) => ({
      ...current,
      records: current.records.map((record) =>
        record.id === recordId
          ? { ...record, checkOutTime, status: "CHECKED_OUT" }
          : record,
      ),
    }));
  }, []);

  const currentRecords = useMemo(
    () => store.records.filter((record) => record.status === "CHECKED_IN"),
    [store.records],
  );

  return {
    users: store.users,
    records: store.records,
    currentRecords,
    findUser,
    activeRecordFor,
    checkIn,
    checkOut,
    registerAndCheckIn,
  };
}
