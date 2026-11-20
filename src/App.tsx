import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AuthGate } from './components/AuthGate';
import { CalendarView } from './components/CalendarView';
import { CoverageSummaryView } from './components/CoverageSummaryView';
import { DayEditorDrawer } from './components/DayEditorDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { HeaderBar } from './components/HeaderBar';
import { LandingDirectoryView } from './components/LandingDirectoryView';
import { SettingsView } from './components/SettingsView';
import { StandardsTriageView } from './components/StandardsTriageView';
import {
  BOOTSTRAP_ADMIN_EMAIL,
  isEmailAllowedForDomain,
  SCHOOL_YEAR,
} from './config/authConfig';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from './lib/firebase';
import {
  applyEntryToDateRange,
  bulkImportStandards,
  clearCalendarStandards,
  createCustomCalendar,
  createStandard,
  deleteCalendar,
  deleteEntry,
  deleteStandard,
  grantAdminAccess,
  revokeAdminAccess,
  saveEntry,
  seedInitialDataIfNeeded,
  updateStandard,
  updateStandardType,
} from './services/pacingService';
import type {
  AdminDoc,
  CalendarCategory,
  CalendarDoc,
  EntryDoc,
  NgssFilter,
  StandardDoc,
  SyncState,
  ViewTab,
} from './types/pacing';
import { getDefaultMonthKey } from './utils/calendarUtils';

function PacingWorkspace() {
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [domainBlockedEmail, setDomainBlockedEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [dataLoading, setDataLoading] = useState(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const [calendars, setCalendars] = useState<CalendarDoc[]>([]);
  const [standards, setStandards] = useState<StandardDoc[]>([]);
  const [entries, setEntries] = useState<EntryDoc[]>([]);
  const [admins, setAdmins] = useState<AdminDoc[]>([]);

  const [selectedCalendarId, setSelectedCalendarId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('home');
  const [monthKey, setMonthKey] = useState<string>(() => getDefaultMonthKey());
  const [showWeekends, setShowWeekends] = useState<boolean>(false);
  const [ngssFilter, setNgssFilter] = useState<NgssFilter>('integrated');
  const [editingDateStr, setEditingDateStr] = useState<string | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('idle');

  const syncTimerRef = useRef<number | null>(null);

  if (fatalError) {
    throw fatalError;
  }

  const markSaved = useCallback(() => {
    setSyncState('saved');
    if (syncTimerRef.current) {
      window.clearTimeout(syncTimerRef.current);
    }
    syncTimerRef.current = window.setTimeout(() => {
      setSyncState('idle');
    }, 2500);
  }, []);

  const runWithSync = useCallback(
    async <T,>(fn: () => Promise<T>): Promise<T> => {
      setSyncState('saving');
      try {
        const result = await fn();
        markSaved();
        return result;
      } catch (err) {
        setSyncState('error');
        setFatalError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      }
    },
    [markSaved]
  );

  // Auth listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      setAuthError(null);
      if (!nextUser) {
        setUser(null);
        setDomainBlockedEmail(null);
        setIsAdmin(false);
        setSelectedCalendarId(null);
        setActiveTab('home');
        setAuthLoading(false);
        return;
      }

      if (!nextUser.emailVerified || !isEmailAllowedForDomain(nextUser.email)) {
        setUser(null);
        setDomainBlockedEmail(nextUser.email || 'Unknown account');
        setIsAdmin(false);
        setAuthLoading(false);
        return;
      }

      setDomainBlockedEmail(null);
      setUser(nextUser);

      // Determine admin role
      const isBootstrap =
        nextUser.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase();
      if (isBootstrap) {
        setIsAdmin(true);
      } else {
        try {
          const adminSnap = await getDoc(doc(db, 'admins', nextUser.uid));
          setIsAdmin(adminSnap.exists());
        } catch {
          setIsAdmin(false);
        }
      }

      setAuthLoading(false);
    });

    return () => unsub();
  }, []);

  // Seed & attach real-time Firestore listeners once authenticated
  useEffect(() => {
    if (!user) {
      setCalendars([]);
      setStandards([]);
      setEntries([]);
      setAdmins([]);
      return;
    }

    let cancelled = false;
    setDataLoading(true);

    void seedInitialDataIfNeeded(user)
      .then(() => {
        if (!cancelled) {
          setDataLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setFatalError(err instanceof Error ? err : new Error(String(err)));
        }
      });

    const calQuery = query(
      collection(db, 'calendars'),
      where('schoolYear', '==', SCHOOL_YEAR)
    );
    const unsubCalendars = onSnapshot(
      calQuery,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ ...(d.data() as Omit<CalendarDoc, 'id'>), id: d.id }))
          .sort((a, b) => a.order - b.order);
        setCalendars(list);
        setSelectedCalendarId((prev) =>
          prev && list.some((c) => c.id === prev) ? prev : null
        );
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'calendars');
        } catch (wrapped) {
          setFatalError(wrapped as Error);
        }
      }
    );

    const stdQuery = query(
      collection(db, 'standards'),
      where('schoolYear', '==', SCHOOL_YEAR)
    );
    const unsubStandards = onSnapshot(
      stdQuery,
      (snap) => {
        const list = snap.docs
          .map((d) => ({ ...(d.data() as Omit<StandardDoc, 'id'>), id: d.id }))
          .sort((a, b) => a.code.localeCompare(b.code));
        setStandards(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'standards');
        } catch (wrapped) {
          setFatalError(wrapped as Error);
        }
      }
    );

    const entryQuery = query(
      collection(db, 'entries'),
      where('schoolYear', '==', SCHOOL_YEAR)
    );
    const unsubEntries = onSnapshot(
      entryQuery,
      (snap) => {
        const list = snap.docs.map((d) => ({
          ...(d.data() as Omit<EntryDoc, 'id'>),
          id: d.id,
        }));
        setEntries(list);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'entries');
        } catch (wrapped) {
          setFatalError(wrapped as Error);
        }
      }
    );

    let unsubAdmins: (() => void) | undefined;
    if (user.email?.toLowerCase() === BOOTSTRAP_ADMIN_EMAIL.toLowerCase()) {
      unsubAdmins = onSnapshot(
        collection(db, 'admins'),
        (snap) => {
          const list = snap.docs.map((d) => d.data() as AdminDoc);
          setAdmins(list);
        },
        () => {
          // Non-fatal if admins list is restricted
        }
      );
    }

    return () => {
      cancelled = true;
      unsubCalendars();
      unsubStandards();
      unsubEntries();
      if (unsubAdmins) unsubAdmins();
    };
  }, [user]);

  const handleSignIn = async () => {
    setAuthError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Sign-in cancelled or failed.';
      setAuthError(msg);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
  };

  const handleSelectCourse = useCallback((id: string | null, targetTab?: ViewTab) => {
    setSelectedCalendarId(id);
    setEditingDateStr(null);
    if (targetTab) {
      setActiveTab(targetTab);
    } else if (id === null) {
      setActiveTab('home');
    }
  }, []);

  const selectedCalendar = useMemo(
    () =>
      selectedCalendarId
        ? calendars.find((c) => c.id === selectedCalendarId)
        : undefined,
    [calendars, selectedCalendarId]
  );

  const activeEditingEntry = useMemo(() => {
    if (!editingDateStr || !selectedCalendar) return undefined;
    return entries.find(
      (e) => e.calendarId === selectedCalendar.id && e.date === editingDateStr
    );
  }, [entries, editingDateStr, selectedCalendar]);

  if (authLoading || !user || domainBlockedEmail) {
    return (
      <AuthGate
        loading={authLoading}
        domainBlockedEmail={domainBlockedEmail}
        authError={authError}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
      />
    );
  }

  const effectiveTab: ViewTab =
    activeTab === 'settings'
      ? 'settings'
      : activeTab === 'home' || !selectedCalendar
      ? 'home'
      : activeTab;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <HeaderBar
        user={user}
        calendars={calendars}
        selectedCalendarId={selectedCalendarId}
        onSelectCalendar={handleSelectCourse}
        activeTab={effectiveTab}
        onSelectTab={(tab) => {
          setEditingDateStr(null);
          setActiveTab(tab);
        }}
        onSignOut={handleSignOut}
      />

      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 py-5">
        {dataLoading && calendars.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
            <div className="h-6 w-64 bg-slate-200 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-52 bg-slate-100 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        ) : effectiveTab === 'home' ? (
          <LandingDirectoryView
            calendars={calendars}
            standards={standards}
            entries={entries}
            onSelectCourse={(calId, targetTab = 'calendar') =>
              handleSelectCourse(calId, targetTab)
            }
            onOpenSettings={() => setActiveTab('settings')}
          />
        ) : effectiveTab === 'calendar' ? (
          <CalendarView
            calendar={selectedCalendar}
            entries={entries}
            standards={standards}
            monthKey={monthKey}
            onChangeMonth={setMonthKey}
            showWeekends={showWeekends}
            onToggleWeekends={() => setShowWeekends((prev) => !prev)}
            ngssFilter={ngssFilter}
            onChangeNgssFilter={setNgssFilter}
            syncState={syncState}
            onSelectDate={setEditingDateStr}
          />
        ) : effectiveTab === 'triage' ? (
          <StandardsTriageView
            calendar={selectedCalendar}
            calendars={calendars}
            standards={standards}
            ngssFilter={ngssFilter}
            onChangeNgssFilter={setNgssFilter}
            syncState={syncState}
            onQuickClassify={(standardId, nextType) =>
              runWithSync(() => updateStandardType(user, standardId, nextType))
            }
            onCreateStandard={(calendarId, data) =>
              runWithSync(() => createStandard(user, calendarId, data))
            }
            onUpdateStandard={(standardId, data) =>
              runWithSync(() => updateStandard(user, standardId, data))
            }
            onDeleteStandard={(standardId) =>
              runWithSync(() => deleteStandard(standardId))
            }
            onClearAllStandards={(standardIds) =>
              runWithSync(() => clearCalendarStandards(standardIds))
            }
            onBulkImport={(calendarId, rows, mode) => {
              const existingIds = standards
                .filter((s) => s.calendarId === calendarId)
                .map((s) => s.id);
              return runWithSync(() =>
                bulkImportStandards(user, calendarId, rows, mode, existingIds).then(
                  () => undefined
                )
              );
            }}
          />
        ) : effectiveTab === 'coverage' ? (
          <CoverageSummaryView
            calendar={selectedCalendar}
            standards={standards}
            entries={entries}
            ngssFilter={ngssFilter}
            onChangeNgssFilter={setNgssFilter}
            onJumpToDate={(dateStr) => {
              const targetMonth = dateStr.slice(0, 7);
              setMonthKey(targetMonth);
              setActiveTab('calendar');
              setEditingDateStr(dateStr);
            }}
          />
        ) : (
          <SettingsView
            user={user}
            isAdmin={isAdmin}
            calendars={calendars}
            admins={admins}
            onCreateCalendar={async (
              name: string,
              cat: CalendarCategory,
              sci: boolean
            ) => {
              const nextOrder =
                calendars.reduce((max, c) => Math.max(max, c.order), 0) + 1;
              const newId = await runWithSync(() =>
                createCustomCalendar(user, name, cat, sci, nextOrder)
              );
              setSelectedCalendarId(newId);
            }}
            onDeleteCalendar={(id) => runWithSync(() => deleteCalendar(id))}
            onGrantAdmin={(uid, email) =>
              runWithSync(() => grantAdminAccess(user, uid, email))
            }
            onRevokeAdmin={(uid) => runWithSync(() => revokeAdminAccess(uid))}
          />
        )}
      </main>

      <DayEditorDrawer
        dateStr={editingDateStr}
        calendar={selectedCalendar}
        entry={activeEditingEntry}
        standards={standards}
        ngssFilter={ngssFilter}
        onClose={() => setEditingDateStr(null)}
        onSaveSingleDay={(date, topic, notes, dayTag, standardIds) =>
          selectedCalendar
            ? runWithSync(() =>
                saveEntry(
                  user,
                  selectedCalendar.id,
                  date,
                  topic,
                  notes,
                  dayTag,
                  standardIds
                )
              )
            : Promise.resolve()
        }
        onApplyRange={(dates, topic, notes, dayTag, standardIds) =>
          selectedCalendar
            ? runWithSync(() =>
                applyEntryToDateRange(
                  user,
                  selectedCalendar.id,
                  dates,
                  topic,
                  notes,
                  dayTag,
                  standardIds
                )
              )
            : Promise.resolve()
        }
        onDeleteDay={(date) =>
          selectedCalendar
            ? runWithSync(() => deleteEntry(selectedCalendar.id, date))
            : Promise.resolve()
        }
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <PacingWorkspace />
    </ErrorBoundary>
  );
}
