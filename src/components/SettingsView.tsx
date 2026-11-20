import type { User } from 'firebase/auth';
import { Lock, Plus, Shield, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { ALLOWED_DOMAIN, BOOTSTRAP_ADMIN_EMAIL } from '../config/authConfig';
import { SEED_CALENDARS } from '../data/seedData';
import {
  CALENDAR_CATEGORIES,
  VALIDATION_LIMITS,
  type AdminDoc,
  type CalendarCategory,
  type CalendarDoc,
} from '../types/pacing';

interface SettingsViewProps {
  user: User;
  isAdmin: boolean;
  calendars: CalendarDoc[];
  admins: AdminDoc[];
  onCreateCalendar: (
    name: string,
    category: CalendarCategory,
    isScience: boolean
  ) => Promise<void>;
  onDeleteCalendar: (calendarId: string) => Promise<void>;
  onGrantAdmin: (uid: string, email: string) => Promise<void>;
  onRevokeAdmin: (uid: string) => Promise<void>;
}

const SEED_CALENDAR_IDS = new Set(SEED_CALENDARS.map((c) => c.id));

export function SettingsView({
  user,
  isAdmin,
  calendars,
  admins,
  onCreateCalendar,
  onDeleteCalendar,
  onGrantAdmin,
  onRevokeAdmin,
}: SettingsViewProps) {
  const [courseName, setCourseName] = useState('');
  const [category, setCategory] = useState<CalendarCategory>('VAPA');
  const [isScience, setIsScience] = useState(false);
  const [creating, setCreating] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [confirmDeleteCalId, setConfirmDeleteCalId] = useState<string | null>(null);

  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [grantingAdmin, setGrantingAdmin] = useState(false);

  const handleAddCalendar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim() || !isAdmin) return;
    setCreating(true);
    setStatusMsg(null);
    try {
      await onCreateCalendar(courseName, category, isScience);
      setStatusMsg(`Added "${courseName.trim()}" and switched to it.`);
      setCourseName('');
      setIsScience(false);
    } finally {
      setCreating(false);
    }
  };

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminUid.trim() || !newAdminEmail.trim() || !isAdmin) return;
    setGrantingAdmin(true);
    try {
      await onGrantAdmin(newAdminUid.trim(), newAdminEmail.trim());
      setNewAdminUid('');
      setNewAdminEmail('');
    } finally {
      setGrantingAdmin(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Add New Calendar Section */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Settings & Department Calendars
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage course pacing calendars, district domain access, and administrator roles.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600">
            Role: {isAdmin ? 'Administrator' : 'Staff Editor'}
          </span>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <h2 className="text-sm font-bold text-slate-900 mb-3">+ Add Calendar</h2>

          {!isAdmin && (
            <div className="mb-4 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              Adding or removing department calendars is restricted to administrators (currently{' '}
              <span className="font-mono">{BOOTSTRAP_ADMIN_EMAIL}</span> or designated admins).
              Your UID for admin assignment: <span className="font-mono">{user.uid}</span>
            </div>
          )}

          <form
            onSubmit={handleAddCalendar}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
          >
            <div className="sm:col-span-5">
              <label
                htmlFor="new-cal-name"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Course / Calendar Name
              </label>
              <input
                id="new-cal-name"
                type="text"
                required
                disabled={!isAdmin}
                maxLength={VALIDATION_LIMITS.CALENDAR_NAME_MAX}
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                placeholder="e.g., 7th Grade ELD or VAPA Choir"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 disabled:bg-slate-100"
              />
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="new-cal-cat"
                className="block text-xs font-semibold text-slate-700 mb-1"
              >
                Department Category
              </label>
              <select
                id="new-cal-cat"
                disabled={!isAdmin}
                value={category}
                onChange={(e) => setCategory(e.target.value as CalendarCategory)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 disabled:bg-slate-100"
              >
                {CALENDAR_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 pb-2">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  disabled={!isAdmin}
                  checked={isScience}
                  onChange={(e) => setIsScience(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                CA NGSS Science
              </label>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={!isAdmin || creating || !courseName.trim()}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                {creating ? 'Adding...' : 'Add Calendar'}
              </button>
            </div>
          </form>

          {statusMsg && (
            <p className="mt-3 text-xs font-medium text-emerald-700">{statusMsg}</p>
          )}
        </div>
      </div>

      {/* Existing Calendars Directory */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            Active 2026–2027 Calendars ({calendars.length})
          </h2>
        </div>
        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {calendars.map((cal) => {
            const isSeed = SEED_CALENDAR_IDS.has(cal.id);
            return (
              <div
                key={cal.id}
                className="px-6 py-2.5 flex items-center justify-between gap-4 text-sm"
              >
                <div className="min-w-0 flex items-center gap-3">
                  <span className="font-medium text-slate-900 truncate">{cal.name}</span>
                  <span className="text-xs text-slate-500">
                    {cal.category}
                    {cal.isScience ? ' · CA NGSS' : ''}
                  </span>
                </div>
                <div className="shrink-0">
                  {isAdmin && !isSeed && (
                    confirmDeleteCalId === cal.id ? (
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            void onDeleteCalendar(cal.id);
                            setConfirmDeleteCalId(null);
                          }}
                          className="px-2 py-1 text-xs font-semibold text-white bg-red-600 rounded hover:bg-red-700 cursor-pointer"
                        >
                          Confirm delete
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteCalId(null)}
                          className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteCalId(cal.id)}
                        aria-label={`Remove ${cal.name}`}
                        className="p-1 text-slate-400 hover:text-red-600 rounded cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Domain Access Control & Admins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Lock className="w-4 h-4 text-slate-500" />
            <h2>District Domain Lock (`ALLOWED_DOMAIN`)</h2>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Current setting:{' '}
            <span className="font-mono font-semibold text-slate-900">
              {ALLOWED_DOMAIN ? `@${ALLOWED_DOMAIN}` : 'Open for testing (any verified Google account)'}
            </span>
          </p>
          <p className="text-xs text-slate-500 leading-relaxed">
            Access control is enforced in both{' '}
            <span className="font-mono">src/config/authConfig.ts</span> and{' '}
            <span className="font-mono">firestore.rules</span> (<span className="font-mono">allowedDomain()</span>).
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Shield className="w-4 h-4 text-slate-500" />
            <h2>Administrators</h2>
          </div>

          <div className="text-xs text-slate-600 space-y-1">
            <div>
              Primary Admin: <span className="font-mono">{BOOTSTRAP_ADMIN_EMAIL}</span>
            </div>
            {admins.map((a) => (
              <div key={a.uid} className="flex items-center justify-between py-1">
                <span className="font-mono text-slate-700">
                  {a.email} ({a.uid.slice(0, 8)}…)
                </span>
                {isAdmin && a.uid !== user.uid && (
                  <button
                    type="button"
                    onClick={() => void onRevokeAdmin(a.uid)}
                    className="text-xs text-red-600 hover:underline cursor-pointer"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>

          {isAdmin && (
            <form onSubmit={handleGrantAdmin} className="pt-3 border-t border-slate-100 space-y-2">
              <div className="text-xs font-semibold text-slate-700">Grant Admin Access</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={newAdminUid}
                  onChange={(e) => setNewAdminUid(e.target.value)}
                  placeholder="Staff Firebase UID"
                  className="px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                />
                <input
                  type="email"
                  required
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="Staff Email"
                  className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                />
              </div>
              <button
                type="submit"
                disabled={grantingAdmin}
                className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 cursor-pointer disabled:opacity-50"
              >
                {grantingAdmin ? 'Granting...' : 'Add Admin'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
