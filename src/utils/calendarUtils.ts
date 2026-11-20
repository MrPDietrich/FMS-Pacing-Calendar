import type { NgssFilter, NgssModel, StandardDoc } from '../types/pacing';

export interface SchoolMonth {
  key: string; // YYYY-MM
  label: string; // August 2026
  shortLabel: string; // Aug 2026
  year: number;
  monthIndex: number; // 0-indexed (7 = August)
}

export const SCHOOL_YEAR_MONTHS: SchoolMonth[] = [
  { key: '2026-08', label: 'August 2026', shortLabel: 'Aug 2026', year: 2026, monthIndex: 7 },
  { key: '2026-09', label: 'September 2026', shortLabel: 'Sep 2026', year: 2026, monthIndex: 8 },
  { key: '2026-10', label: 'October 2026', shortLabel: 'Oct 2026', year: 2026, monthIndex: 9 },
  { key: '2026-11', label: 'November 2026', shortLabel: 'Nov 2026', year: 2026, monthIndex: 10 },
  { key: '2026-12', label: 'December 2026', shortLabel: 'Dec 2026', year: 2026, monthIndex: 11 },
  { key: '2027-01', label: 'January 2027', shortLabel: 'Jan 2027', year: 2027, monthIndex: 0 },
  { key: '2027-02', label: 'February 2027', shortLabel: 'Feb 2027', year: 2027, monthIndex: 1 },
  { key: '2027-03', label: 'March 2027', shortLabel: 'Mar 2027', year: 2027, monthIndex: 2 },
  { key: '2027-04', label: 'April 2027', shortLabel: 'Apr 2027', year: 2027, monthIndex: 3 },
  { key: '2027-05', label: 'May 2027', shortLabel: 'May 2027', year: 2027, monthIndex: 4 },
  { key: '2027-06', label: 'June 2027', shortLabel: 'Jun 2027', year: 2027, monthIndex: 5 },
];

export function getDefaultMonthKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const currentKey = `${y}-${m}`;
  const found = SCHOOL_YEAR_MONTHS.find((sm) => sm.key === currentKey);
  if (found) return found.key;
  if (currentKey < '2026-08') return '2026-08';
  return '2027-06';
}

export function getTodayIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface CalendarCell {
  dateStr: string; // YYYY-MM-DD
  dayNumber: number;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
}

/**
 * Generates calendar grid weeks starting on Monday.
 * When showWeekends is false, each week has 5 cells (Mon-Fri).
 * Weeks that fall completely outside the month (e.g. Sat/Sun only) are omitted in Mon-Fri mode.
 */
export function buildMonthGrid(
  year: number,
  monthIndex: number,
  showWeekends: boolean
): CalendarCell[][] {
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  // Monday = 0, Tuesday = 1, ..., Sunday = 6
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7;
  const gridStart = new Date(year, monthIndex, 1 - startOffset);

  const endOffset = (7 - ((lastDayOfMonth.getDay() + 6) % 7) - 1 + 7) % 7;
  const gridEnd = new Date(year, monthIndex + 1, lastDayOfMonth.getDate() + endOffset);

  const weeks: CalendarCell[][] = [];
  const cursor = new Date(gridStart);

  while (cursor <= gridEnd) {
    const week: CalendarCell[] = [];
    for (let i = 0; i < 7; i++) {
      const cellDate = new Date(cursor);
      const dayOfWeek = cellDate.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const y = cellDate.getFullYear();
      const m = String(cellDate.getMonth() + 1).padStart(2, '0');
      const d = String(cellDate.getDate()).padStart(2, '0');
      const cell: CalendarCell = {
        dateStr: `${y}-${m}-${d}`,
        dayNumber: cellDate.getDate(),
        isCurrentMonth: cellDate.getMonth() === monthIndex,
        isWeekend,
        dayOfWeek,
      };
      if (showWeekends || !isWeekend) {
        week.push(cell);
      }
      cursor.setDate(cursor.getDate() + 1);
    }

    if (showWeekends) {
      weeks.push(week);
    } else {
      // Only include weekday rows where at least 1 weekday belongs to this month
      if (week.some((c) => c.isCurrentMonth)) {
        weeks.push(week);
      }
    }
  }

  return weeks;
}

export function formatLongDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getDatesInRange(
  startDateStr: string,
  endDateStr: string,
  includeWeekends: boolean
): string[] {
  const [sy, sm, sd] = startDateStr.split('-').map(Number);
  const [ey, em, ed] = endDateStr.split('-').map(Number);
  const start = new Date(sy, sm - 1, sd);
  const end = new Date(ey, em - 1, ed);
  if (end < start) return [startDateStr];

  const dates: string[] = [];
  const cursor = new Date(start);
  let safety = 0;
  while (cursor <= end && safety < 60) {
    const dow = cursor.getDay();
    const isWeekend = dow === 0 || dow === 6;
    if (includeWeekends || !isWeekend) {
      const y = cursor.getFullYear();
      const m = String(cursor.getMonth() + 1).padStart(2, '0');
      const d = String(cursor.getDate()).padStart(2, '0');
      const iso = `${y}-${m}-${d}`;
      if (iso >= '2026-08-01' && iso <= '2027-06-30') {
        dates.push(iso);
      }
    }
    cursor.setDate(cursor.getDate() + 1);
    safety++;
  }
  return dates;
}

export function matchesNgssFilter(
  standard: Pick<StandardDoc, 'ngssModel'>,
  isScienceCalendar: boolean,
  ngssFilter: NgssFilter
): boolean {
  if (!isScienceCalendar || ngssFilter === 'all') {
    return true;
  }
  if (standard.ngssModel === 'none' || standard.ngssModel === 'both') {
    return true;
  }
  return standard.ngssModel === ngssFilter;
}

export interface ParsedStandardImportRow {
  code: string;
  description: string;
  gradeLevel: string;
  domain: string;
  type: 'essential' | 'supporting' | 'prerequisite' | 'unassigned';
  ngssModel: NgssModel;
}

function normalizeType(val: string | undefined): ParsedStandardImportRow['type'] {
  const v = (val || '').trim().toLowerCase();
  if (v === 'essential' || v === 'supporting' || v === 'prerequisite' || v === 'unassigned') {
    return v;
  }
  return 'unassigned';
}

function normalizeNgss(val: string | undefined): NgssModel {
  const v = (val || '').trim().toLowerCase();
  if (v === 'integrated' || v === 'discipline-specific' || v === 'both' || v === 'none') {
    return v;
  }
  if (v === 'preferred integrated') return 'integrated';
  return 'none';
}

function parseCsvLines(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        row.push(field.trim());
        field = '';
      } else if (ch === '\r' && next === '\n') {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = '';
        i++;
      } else if (ch === '\n' || ch === '\r') {
        row.push(field.trim());
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += ch;
      }
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field.trim());
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.length > 0));
}

export function parseStandardsImport(rawText: string): {
  rows: ParsedStandardImportRow[];
  error: string | null;
} {
  const trimmed = rawText.trim();
  if (!trimmed) {
    return { rows: [], error: 'Paste JSON or CSV data, or upload a file.' };
  }

  // Try JSON first if it starts with [ or {
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    try {
      const parsed = JSON.parse(trimmed);
      const list = Array.isArray(parsed) ? parsed : [parsed];
      const rows: ParsedStandardImportRow[] = [];
      for (const item of list) {
        if (!item || typeof item !== 'object') continue;
        const code = String(item.code || '').trim();
        const description = String(item.description || '').trim();
        if (!code || !description) continue;
        rows.push({
          code: code.slice(0, 40),
          description: description.slice(0, 1500),
          gradeLevel: String(item.gradeLevel || '6-8').trim().slice(0, 16) || '6-8',
          domain: String(item.domain || 'General').trim().slice(0, 120) || 'General',
          type: normalizeType(item.type),
          ngssModel: normalizeNgss(item.ngssModel),
        });
      }
      if (rows.length === 0) {
        return {
          rows: [],
          error: 'No valid standard objects found. Each object needs at least "code" and "description".',
        };
      }
      return { rows, error: null };
    } catch {
      return { rows: [], error: 'Invalid JSON syntax. Please check brackets and quotes.' };
    }
  }

  // CSV parsing
  const csvRows = parseCsvLines(trimmed);
  if (csvRows.length === 0) {
    return { rows: [], error: 'No rows found in CSV input.' };
  }

  const headerRow = csvRows[0].map((h) => h.toLowerCase());
  const hasHeader =
    headerRow.includes('code') && (headerRow.includes('description') || headerRow.includes('desc'));

  const dataRows = hasHeader ? csvRows.slice(1) : csvRows;
  const colIdx = {
    code: hasHeader ? headerRow.indexOf('code') : 0,
    description: hasHeader
      ? headerRow.indexOf('description') !== -1
        ? headerRow.indexOf('description')
        : headerRow.indexOf('desc')
      : 1,
    gradeLevel: hasHeader ? headerRow.indexOf('gradelevel') : 2,
    domain: hasHeader ? headerRow.indexOf('domain') : 3,
    type: hasHeader ? headerRow.indexOf('type') : 4,
    ngssModel: hasHeader ? headerRow.indexOf('ngssmodel') : 5,
  };

  const rows: ParsedStandardImportRow[] = [];
  for (const r of dataRows) {
    const code = (r[colIdx.code] || '').trim();
    const description = (r[colIdx.description] || '').trim();
    if (!code || !description) continue;
    rows.push({
      code: code.slice(0, 40),
      description: description.slice(0, 1500),
      gradeLevel:
        (colIdx.gradeLevel >= 0 ? r[colIdx.gradeLevel] : '')?.trim().slice(0, 16) || '6-8',
      domain:
        (colIdx.domain >= 0 ? r[colIdx.domain] : '')?.trim().slice(0, 120) || 'General',
      type: normalizeType(colIdx.type >= 0 ? r[colIdx.type] : undefined),
      ngssModel: normalizeNgss(colIdx.ngssModel >= 0 ? r[colIdx.ngssModel] : undefined),
    });
  }

  if (rows.length === 0) {
    return {
      rows: [],
      error:
        'No valid CSV rows found. Expected columns: code,description,gradeLevel,domain,type,ngssModel',
    };
  }

  return { rows, error: null };
}
