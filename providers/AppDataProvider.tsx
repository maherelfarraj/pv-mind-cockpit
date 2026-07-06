import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type WorkOrderDraftInput = {
  projectId: string;
  title: string;
  description: string;
  photoPlaceholder: boolean;
};

export type WorkOrderDraft = WorkOrderDraftInput & {
  id: string;
  status: 'pending' | 'synced';
  updatedAt: string;
  syncedAt?: string;
};

type AppDataContextValue = {
  isOnline: boolean;
  workOrderDrafts: WorkOrderDraft[];
  pendingDraftCount: number;
  lastSyncedAt?: string;
  saveWorkOrderDraft: (draft: WorkOrderDraftInput) => Promise<void>;
  syncPendingDrafts: () => Promise<void>;
};

const STORAGE_KEY = 'pvmind.work-order-drafts';

const AppDataContext = createContext<AppDataContextValue | undefined>(undefined);

export function AppDataProvider({ children }: PropsWithChildren) {
  const [isOnline, setIsOnline] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>();
  const [workOrderDrafts, setWorkOrderDrafts] = useState<WorkOrderDraft[]>([]);

  const persistDrafts = useCallback(async (drafts: WorkOrderDraft[]) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(drafts));
  }, []);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    async function hydrate() {
      const storedDrafts = await AsyncStorage.getItem(STORAGE_KEY);

      if (storedDrafts) {
        setWorkOrderDrafts(JSON.parse(storedDrafts) as WorkOrderDraft[]);
      }

      setIsHydrated(true);
    }

    void hydrate();
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void persistDrafts(workOrderDrafts);
  }, [isHydrated, persistDrafts, workOrderDrafts]);

  const syncPendingDrafts = useCallback(async () => {
    if (!isHydrated || !isOnline || !workOrderDrafts.some((draft) => draft.status === 'pending')) {
      return;
    }

    const syncedAt = new Date().toISOString();
    const nextDrafts = workOrderDrafts.map((draft) =>
      draft.status === 'pending'
        ? {
            ...draft,
            status: 'synced' as const,
            syncedAt,
          }
        : draft
    );

    setWorkOrderDrafts(nextDrafts);
    setLastSyncedAt(syncedAt);
  }, [isHydrated, isOnline, persistDrafts, workOrderDrafts]);

  useEffect(() => {
    void syncPendingDrafts();
  }, [syncPendingDrafts]);

  const saveWorkOrderDraft = useCallback(
    async (draft: WorkOrderDraftInput) => {
      const updatedAt = new Date().toISOString();
      const draftRecord = {
        ...draft,
        id: `${updatedAt}-${draft.projectId}`,
        status: 'pending' as const,
        updatedAt,
      };

      setWorkOrderDrafts((current) => [
        draftRecord,
        ...current,
      ]);
    },
    []
  );

  const value = useMemo(
    () => ({
      isOnline,
      workOrderDrafts,
      pendingDraftCount: workOrderDrafts.filter((draft) => draft.status === 'pending').length,
      lastSyncedAt,
      saveWorkOrderDraft,
      syncPendingDrafts,
    }),
    [isOnline, lastSyncedAt, saveWorkOrderDraft, syncPendingDrafts, workOrderDrafts]
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);

  if (!context) {
    throw new Error('useAppData must be used inside AppDataProvider');
  }

  return context;
}
