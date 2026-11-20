import type { Timestamp } from 'firebase/firestore';

export type CalendarCategory =
  | '6th Grade Core'
  | '7th Grade Core'
  | '8th Grade Core'
  | 'VAPA'
  | 'PE'
  | 'SDC';

export const CALENDAR_CATEGORIES: CalendarCategory[] = [
  '6th Grade Core',
  '7th Grade Core',
  '8th Grade Core',
  'VAPA',
  'PE',
  'SDC',
];

export type StandardType = 'essential' | 'supporting' | 'prerequisite' | 'unassigned';

export type NgssModel = 'integrated' | 'discipline-specific' | 'both' | 'none';

export type NgssFilter = 'integrated' | 'discipline-specific' | 'all';

export type ViewTab = 'home' | 'calendar' | 'triage' | 'coverage' | 'settings';

export type SyncState = 'idle' | 'saving' | 'saved' | 'error';

export interface CalendarDoc {
  id: string;
  name: string;
  category: CalendarCategory;
  isScience: boolean;
  order: number;
  schoolYear: '2026-2027';
  createdByUid: string;
  updatedBy: string;
  updatedAt?: Timestamp | null;
}

export interface StandardDoc {
  id: string;
  calendarId: string;
  code: string;
  description: string;
  gradeLevel: string;
  domain: string;
  type: StandardType;
  ngssModel: NgssModel;
  schoolYear: '2026-2027';
  updatedBy: string;
  updatedByUid: string;
  updatedAt?: Timestamp | null;
}

export interface EntryDoc {
  id: string;
  calendarId: string;
  date: string; // YYYY-MM-DD
  topic: string;
  notes: string;
  dayTag?: string;
  standardIds: string[];
  schoolYear: '2026-2027';
  updatedBy: string;
  updatedByUid: string;
  updatedAt?: Timestamp | null;
}

export interface AdminDoc {
  uid: string;
  email: string;
  grantedBy: string;
  createdAt?: Timestamp | null;
}

export const VALIDATION_LIMITS = {
  ID_MAX: 128,
  ID_PATTERN: /^[a-zA-Z0-9_-]+$/,
  CALENDAR_NAME_MAX: 80,
  STANDARD_CODE_MAX: 40,
  STANDARD_DESC_MAX: 1500,
  STANDARD_GRADE_MAX: 16,
  STANDARD_DOMAIN_MAX: 120,
  ENTRY_TOPIC_MAX: 160,
  ENTRY_NOTES_MAX: 2000,
  ENTRY_DAY_TAG_MAX: 32,
  ENTRY_STANDARD_IDS_MAX: 30,
  UPDATED_BY_MAX: 120,
  DATE_PATTERN: /^202[6-7]-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$/,
} as const;
