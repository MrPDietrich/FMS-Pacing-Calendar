import type { User } from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { SCHOOL_YEAR } from '../config/authConfig';
import { SEED_CALENDARS, SEED_STANDARDS } from '../data/seedData';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import {
  VALIDATION_LIMITS,
  type CalendarCategory,
  type NgssModel,
  type StandardType,
} from '../types/pacing';
import type { ParsedStandardImportRow } from '../utils/calendarUtils';

export function getStaffAttribution(user: User): string {
  const name = user.displayName?.trim();
  const email = user.email?.trim();
  const raw = name && email ? `${name} (${email})` : name || email || 'Staff Member';
  return raw.slice(0, VALIDATION_LIMITS.UPDATED_BY_MAX);
}

export function slugifyCalendarId(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
  return base || `course-${Date.now()}`;
}

function makeStandardDocId(calendarId: string): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${calendarId}__std_${Date.now()}_${rand}`.slice(0, VALIDATION_LIMITS.ID_MAX);
}

export async function seedInitialDataIfNeeded(user: User): Promise<void> {
  const BATCH_CHUNK_SIZE = 15;
  const updatedBy = getStaffAttribution(user);

  let existingCalIds = new Set<string>();
  try {
    const existingCalSnap = await getDocs(
      query(collection(db, 'calendars'), where('schoolYear', '==', SCHOOL_YEAR))
    );
    existingCalIds = new Set(existingCalSnap.docs.map((d) => d.id));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'calendars');
  }

  const missingCalendars = SEED_CALENDARS.filter((c) => !existingCalIds.has(c.id));
  const newlySeededCalIds = new Set(missingCalendars.map((c) => c.id));

  if (missingCalendars.length > 0) {
    try {
      for (let i = 0; i < missingCalendars.length; i += BATCH_CHUNK_SIZE) {
        const chunk = missingCalendars.slice(i, i + BATCH_CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const cal of chunk) {
          const ref = doc(db, 'calendars', cal.id);
          batch.set(ref, {
            id: cal.id,
            name: cal.name.slice(0, VALIDATION_LIMITS.CALENDAR_NAME_MAX),
            category: cal.category,
            isScience: cal.isScience,
            order: cal.order,
            schoolYear: SCHOOL_YEAR,
            createdByUid: user.uid,
            updatedBy,
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'calendars');
    }
  }

  // Only seed sample standards for calendars that were just created so user-cleared
  // or replaced standards on existing calendars are never re-inserted on reload.
  if (newlySeededCalIds.size === 0) {
    return;
  }

  let existingStdIds = new Set<string>();
  try {
    const existingStdSnap = await getDocs(
      query(collection(db, 'standards'), where('schoolYear', '==', SCHOOL_YEAR))
    );
    existingStdIds = new Set(existingStdSnap.docs.map((d) => d.id));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'standards');
  }

  const missingStandards = SEED_STANDARDS.filter(
    (std) => newlySeededCalIds.has(std.calendarId) && !existingStdIds.has(std.id)
  );
  if (missingStandards.length > 0) {
    try {
      for (let i = 0; i < missingStandards.length; i += BATCH_CHUNK_SIZE) {
        const chunk = missingStandards.slice(i, i + BATCH_CHUNK_SIZE);
        const batch = writeBatch(db);
        for (const std of chunk) {
          const ref = doc(db, 'standards', std.id);
          batch.set(ref, {
            calendarId: std.calendarId,
            code: std.code.slice(0, VALIDATION_LIMITS.STANDARD_CODE_MAX),
            description: std.description.slice(0, VALIDATION_LIMITS.STANDARD_DESC_MAX),
            gradeLevel: std.gradeLevel.slice(0, VALIDATION_LIMITS.STANDARD_GRADE_MAX),
            domain: std.domain.slice(0, VALIDATION_LIMITS.STANDARD_DOMAIN_MAX),
            type: std.type,
            ngssModel: std.ngssModel,
            schoolYear: SCHOOL_YEAR,
            updatedBy,
            updatedByUid: user.uid,
            updatedAt: serverTimestamp(),
          });
        }
        await batch.commit();
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'standards');
    }
  }
}

export async function saveEntry(
  user: User,
  calendarId: string,
  date: string,
  topic: string,
  notes: string,
  dayTag: string,
  standardIds: string[]
): Promise<void> {
  const entryId = `${calendarId}__${date}`;
  const path = `entries/${entryId}`;
  try {
    const cleanIds = Array.from(new Set(standardIds)).slice(
      0,
      VALIDATION_LIMITS.ENTRY_STANDARD_IDS_MAX
    );
    await setDoc(doc(db, 'entries', entryId), {
      calendarId,
      date,
      topic: topic.trim().slice(0, VALIDATION_LIMITS.ENTRY_TOPIC_MAX),
      notes: notes.trim().slice(0, VALIDATION_LIMITS.ENTRY_NOTES_MAX),
      dayTag: dayTag.trim().slice(0, VALIDATION_LIMITS.ENTRY_DAY_TAG_MAX),
      standardIds: cleanIds,
      schoolYear: SCHOOL_YEAR,
      updatedBy: getStaffAttribution(user),
      updatedByUid: user.uid,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function applyEntryToDateRange(
  user: User,
  calendarId: string,
  dates: string[],
  topic: string,
  notes: string,
  dayTag: string,
  standardIds: string[]
): Promise<void> {
  const path = 'entries';
  try {
    const cleanIds = Array.from(new Set(standardIds)).slice(
      0,
      VALIDATION_LIMITS.ENTRY_STANDARD_IDS_MAX
    );
    const updatedBy = getStaffAttribution(user);
    const cleanTopic = topic.trim().slice(0, VALIDATION_LIMITS.ENTRY_TOPIC_MAX);
    const cleanNotes = notes.trim().slice(0, VALIDATION_LIMITS.ENTRY_NOTES_MAX);
    const cleanDayTag = dayTag.trim().slice(0, VALIDATION_LIMITS.ENTRY_DAY_TAG_MAX);

    for (let i = 0; i < dates.length; i += 15) {
      const chunk = dates.slice(i, i + 15);
      const batch = writeBatch(db);
      for (const date of chunk) {
        const entryId = `${calendarId}__${date}`;
        batch.set(doc(db, 'entries', entryId), {
          calendarId,
          date,
          topic: cleanTopic,
          notes: cleanNotes,
          dayTag: cleanDayTag,
          standardIds: cleanIds,
          schoolYear: SCHOOL_YEAR,
          updatedBy,
          updatedByUid: user.uid,
          updatedAt: serverTimestamp(),
        });
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteEntry(calendarId: string, date: string): Promise<void> {
  const entryId = `${calendarId}__${date}`;
  const path = `entries/${entryId}`;
  try {
    await deleteDoc(doc(db, 'entries', entryId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function updateStandardType(
  user: User,
  standardId: string,
  type: StandardType
): Promise<void> {
  const path = `standards/${standardId}`;
  try {
    await updateDoc(doc(db, 'standards', standardId), {
      type,
      updatedBy: getStaffAttribution(user),
      updatedByUid: user.uid,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function createStandard(
  user: User,
  calendarId: string,
  data: {
    code: string;
    description: string;
    gradeLevel: string;
    domain: string;
    type: StandardType;
    ngssModel: NgssModel;
  }
): Promise<void> {
  const standardId = makeStandardDocId(calendarId);
  const path = `standards/${standardId}`;
  try {
    await setDoc(doc(db, 'standards', standardId), {
      calendarId,
      code: data.code.trim().slice(0, VALIDATION_LIMITS.STANDARD_CODE_MAX),
      description: data.description.trim().slice(0, VALIDATION_LIMITS.STANDARD_DESC_MAX),
      gradeLevel: data.gradeLevel.trim().slice(0, VALIDATION_LIMITS.STANDARD_GRADE_MAX) || '6-8',
      domain: data.domain.trim().slice(0, VALIDATION_LIMITS.STANDARD_DOMAIN_MAX) || 'General',
      type: data.type,
      ngssModel: data.ngssModel,
      schoolYear: SCHOOL_YEAR,
      updatedBy: getStaffAttribution(user),
      updatedByUid: user.uid,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateStandard(
  user: User,
  standardId: string,
  data: {
    code: string;
    description: string;
    gradeLevel: string;
    domain: string;
    type: StandardType;
    ngssModel: NgssModel;
  }
): Promise<void> {
  const path = `standards/${standardId}`;
  try {
    await updateDoc(doc(db, 'standards', standardId), {
      code: data.code.trim().slice(0, VALIDATION_LIMITS.STANDARD_CODE_MAX),
      description: data.description.trim().slice(0, VALIDATION_LIMITS.STANDARD_DESC_MAX),
      gradeLevel: data.gradeLevel.trim().slice(0, VALIDATION_LIMITS.STANDARD_GRADE_MAX) || '6-8',
      domain: data.domain.trim().slice(0, VALIDATION_LIMITS.STANDARD_DOMAIN_MAX) || 'General',
      type: data.type,
      ngssModel: data.ngssModel,
      updatedBy: getStaffAttribution(user),
      updatedByUid: user.uid,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteStandard(standardId: string): Promise<void> {
  const path = `standards/${standardId}`;
  try {
    await deleteDoc(doc(db, 'standards', standardId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearCalendarStandards(standardIds: string[]): Promise<void> {
  const path = 'standards';
  try {
    for (let i = 0; i < standardIds.length; i += 150) {
      const chunk = standardIds.slice(i, i + 150);
      const batch = writeBatch(db);
      for (const id of chunk) {
        batch.delete(doc(db, 'standards', id));
      }
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function bulkImportStandards(
  user: User,
  calendarId: string,
  rows: ParsedStandardImportRow[],
  mode: 'append' | 'replace' = 'append',
  existingStandardIdsForCalendar: string[] = []
): Promise<number> {
  const path = 'standards';
  try {
    if (mode === 'replace' && existingStandardIdsForCalendar.length > 0) {
      await clearCalendarStandards(existingStandardIdsForCalendar);
    }

    const updatedBy = getStaffAttribution(user);
    for (let i = 0; i < rows.length; i += 15) {
      const chunk = rows.slice(i, i + 15);
      const batch = writeBatch(db);
      chunk.forEach((row, idx) => {
        const stdId = `${calendarId}__imp_${Date.now()}_${i + idx}`.slice(
          0,
          VALIDATION_LIMITS.ID_MAX
        );
        batch.set(doc(db, 'standards', stdId), {
          calendarId,
          code: row.code.slice(0, VALIDATION_LIMITS.STANDARD_CODE_MAX),
          description: row.description.slice(0, VALIDATION_LIMITS.STANDARD_DESC_MAX),
          gradeLevel: row.gradeLevel.slice(0, VALIDATION_LIMITS.STANDARD_GRADE_MAX),
          domain: row.domain.slice(0, VALIDATION_LIMITS.STANDARD_DOMAIN_MAX),
          type: row.type,
          ngssModel: row.ngssModel,
          schoolYear: SCHOOL_YEAR,
          updatedBy,
          updatedByUid: user.uid,
          updatedAt: serverTimestamp(),
        });
      });
      await batch.commit();
    }
    return rows.length;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function createCustomCalendar(
  user: User,
  name: string,
  category: CalendarCategory,
  isScience: boolean,
  nextOrder: number
): Promise<string> {
  const slug = slugifyCalendarId(name);
  const calendarId = `${slug}-${Math.random().toString(36).slice(2, 6)}`.slice(
    0,
    VALIDATION_LIMITS.ID_MAX
  );
  const path = `calendars/${calendarId}`;
  try {
    await setDoc(doc(db, 'calendars', calendarId), {
      id: calendarId,
      name: name.trim().slice(0, VALIDATION_LIMITS.CALENDAR_NAME_MAX),
      category,
      isScience,
      order: Math.min(Math.max(0, Math.round(nextOrder)), 1000),
      schoolYear: SCHOOL_YEAR,
      createdByUid: user.uid,
      updatedBy: getStaffAttribution(user),
      updatedAt: serverTimestamp(),
    });
    return calendarId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCalendar(calendarId: string): Promise<void> {
  const path = `calendars/${calendarId}`;
  try {
    await deleteDoc(doc(db, 'calendars', calendarId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function grantAdminAccess(
  currentUser: User,
  targetUid: string,
  targetEmail: string
): Promise<void> {
  const cleanUid = targetUid.trim();
  const path = `admins/${cleanUid}`;
  try {
    await setDoc(doc(db, 'admins', cleanUid), {
      uid: cleanUid,
      email: targetEmail.trim().slice(0, 120),
      grantedBy: getStaffAttribution(currentUser),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function revokeAdminAccess(targetUid: string): Promise<void> {
  const path = `admins/${targetUid}`;
  try {
    await deleteDoc(doc(db, 'admins', targetUid));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
