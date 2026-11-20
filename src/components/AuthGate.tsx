import { CalendarDays, Lock, LogOut, ShieldCheck } from 'lucide-react';
import { ALLOWED_DOMAIN } from '../config/authConfig';

interface AuthGateProps {
  loading: boolean;
  domainBlockedEmail: string | null;
  authError: string | null;
  onSignIn: () => void;
  onSignOut: () => void;
}

export function AuthGate({
  loading,
  domainBlockedEmail,
  authError,
  onSignIn,
  onSignOut,
}: AuthGateProps) {
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl p-8">
          <div className="h-5 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="mt-3 h-4 w-72 bg-slate-100 rounded animate-pulse" />
          <div className="mt-6 h-11 w-full bg-slate-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-xl p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
            <CalendarDays className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              2026–2027 Pacing Calendar
            </h1>
            <p className="text-sm text-slate-500">
              Middle School Essential Standards & Department Planning
            </p>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-100">
          {domainBlockedEmail ? (
            <div className="space-y-4">
              <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Lock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-900">
                  <p className="font-semibold">District account required</p>
                  <p className="mt-1 text-amber-800">
                    Signed in as <span className="font-mono">{domainBlockedEmail}</span>, but access
                    is currently restricted to <span className="font-mono">@{ALLOWED_DOMAIN}</span>{' '}
                    staff accounts.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onSignOut}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                Sign out and switch Google account
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              <p className="text-sm text-slate-600 leading-relaxed">
                Sign in with your staff Google account to view all 22 department pacing calendars,
                classify Essential and Prerequisite standards, and collaborate in real time during
                PLC meetings.
              </p>

              {authError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-800">
                  {authError}
                </div>
              )}

              <button
                type="button"
                onClick={onSignIn}
                className="w-full inline-flex items-center justify-center gap-3 px-4 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="currentColor"
                    d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81Z"
                  />
                </svg>
                Sign in with Google
              </button>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-slate-400 shrink-0" />
                <span>
                  {ALLOWED_DOMAIN
                    ? `Restricted to @${ALLOWED_DOMAIN} verified staff accounts.`
                    : 'Testing mode: any verified Google account is permitted.'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
