import {
  AlertCircle,
  AlertTriangle,
  Check,
  FileSpreadsheet,
  Upload,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CalendarDoc, StandardDoc } from '../types/pacing';
import { parseStandardsImport, type ParsedStandardImportRow } from '../utils/calendarUtils';
import { StandardCodePill } from './StandardBadge';

export type BulkImportMode = 'append' | 'replace';

interface BulkImportModalProps {
  open: boolean;
  calendars: CalendarDoc[];
  standards: StandardDoc[];
  defaultCalendarId: string;
  onClose: () => void;
  onImport: (
    calendarId: string,
    rows: ParsedStandardImportRow[],
    mode: BulkImportMode
  ) => Promise<void>;
}

const SAMPLE_CSV = `code,description,gradeLevel,domain,type,ngssModel
7.RP.A.3,Use proportional relationships to solve multistep ratio and percent problems.,7,Ratios & Proportional Relationships,essential,none
6.RP.A.3c,Find a percent of a quantity as a rate per 100 and solve problems finding the whole.,6,Ratios & Proportional Relationships,prerequisite,none
MS-ESS3-3,Apply scientific principles to design a method for monitoring and minimizing a human impact on the environment.,7,Earth & Space Science,supporting,integrated`;

export function BulkImportModal({
  open,
  calendars,
  standards,
  defaultCalendarId,
  onClose,
  onImport,
}: BulkImportModalProps) {
  const [targetCalendarId, setTargetCalendarId] = useState(defaultCalendarId);
  const [importMode, setImportMode] = useState<BulkImportMode>('append');
  const [rawText, setRawText] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setTargetCalendarId(defaultCalendarId);
      setImportMode('append');
      setImportError(null);
    }
  }, [open, defaultCalendarId]);

  if (!open) return null;

  const targetCalendar = calendars.find((c) => c.id === targetCalendarId);
  const targetExistingCount = standards.filter(
    (s) => s.calendarId === targetCalendarId
  ).length;

  const { rows, error } = rawText.trim()
    ? parseStandardsImport(rawText)
    : { rows: [], error: null };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setRawText(reader.result);
        setImportError(null);
      }
    };
    reader.readAsText(file);
  };

  const handleConfirmImport = async () => {
    if (rows.length === 0 || error) return;
    setImporting(true);
    setImportError(null);
    try {
      await onImport(targetCalendarId, rows, importMode);
      setRawText('');
      onClose();
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Unable to import standards.'
      );
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="no-print fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-slate-900/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Bulk Import Standards"
        className="relative z-10 w-full max-w-3xl bg-white border border-slate-200 rounded-xl shadow-xl flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Bulk Import Standards (JSON or CSV)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Expected fields: code, description, gradeLevel, domain, type, ngssModel
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close bulk import"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
            <div>
              <label
                htmlFor="import-calendar"
                className="block text-xs font-semibold text-slate-700 mb-1.5"
              >
                Target Calendar
              </label>
              <select
                id="import-calendar"
                value={targetCalendarId}
                onChange={(e) => setTargetCalendarId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
              >
                {calendars.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 sm:justify-end">
              <label className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                Upload .CSV / .JSON
                <input
                  type="file"
                  accept=".csv,.json,text/csv,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <button
                type="button"
                onClick={() => setRawText(SAMPLE_CSV)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Load sample CSV
              </button>
            </div>
          </div>

          {/* Import Mode Selector */}
          <div className="space-y-2">
            <span className="block text-xs font-semibold text-slate-700">
              Import Mode
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setImportMode('append')}
                className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                  importMode === 'append'
                    ? 'bg-indigo-50/70 border-indigo-600 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-semibold">
                  Append to Existing Standards
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                  Keep current {targetExistingCount} standards and add new ones
                </div>
              </button>

              <button
                type="button"
                onClick={() => setImportMode('replace')}
                className={`text-left p-3 rounded-lg border transition-colors cursor-pointer ${
                  importMode === 'replace'
                    ? 'bg-amber-50/80 border-amber-500 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="text-xs font-semibold">
                  Replace Existing Standards
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 tabular-nums">
                  Delete current {targetExistingCount} standards before importing
                </div>
              </button>
            </div>

            {importMode === 'replace' && targetExistingCount > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Importing will permanently remove all{' '}
                  <span className="font-semibold tabular-nums">{targetExistingCount}</span>{' '}
                  existing standards from{' '}
                  <span className="font-semibold">
                    {targetCalendar?.name || targetCalendarId}
                  </span>{' '}
                  and replace them with the imported list below.
                </span>
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="import-raw"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Paste JSON array or CSV rows
            </label>
            <textarea
              id="import-raw"
              rows={7}
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setImportError(null);
              }}
              placeholder={SAMPLE_CSV}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:bg-white focus:border-indigo-600"
            />
          </div>

          {(error || importError) && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{importError || error}</span>
            </div>
          )}

          {rows.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">
                  Preview ({rows.length} {rows.length === 1 ? 'standard' : 'standards'} ready)
                </span>
                <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                  <Check className="w-3.5 h-3.5" /> Validated
                </span>
              </div>
              <div className="border border-slate-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                    <tr>
                      <th className="px-3 py-2 font-semibold">Code</th>
                      <th className="px-3 py-2 font-semibold">Grade</th>
                      <th className="px-3 py-2 font-semibold">Domain</th>
                      <th className="px-3 py-2 font-semibold">Type</th>
                      <th className="px-3 py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {rows.slice(0, 50).map((r, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <StandardCodePill code={r.code} type={r.type} />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-slate-600">
                          {r.gradeLevel}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-slate-600">
                          {r.domain}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap capitalize text-slate-700">
                          {r.type}
                        </td>
                        <td className="px-3 py-2 text-slate-700 max-w-xs truncate">
                          {r.description}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={importing || rows.length === 0 || Boolean(error)}
            onClick={handleConfirmImport}
            className={`px-4 py-2 text-xs font-semibold text-white rounded-lg disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer ${
              importMode === 'replace'
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {importing
              ? 'Importing...'
              : importMode === 'replace'
              ? `Replace & Import ${rows.length} ${rows.length === 1 ? 'Standard' : 'Standards'}`
              : `Import ${rows.length} ${rows.length === 1 ? 'Standard' : 'Standards'}`}
          </button>
        </div>
      </div>
    </div>
  );
}
