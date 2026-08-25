import { useState } from 'react';

import { getUserName } from '../lib/constants';

export default function HeaderBar({ title = 'Dashboard', actionLabel, onAction, userRole, user, onLogout }) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const userName = getUserName(user);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await onLogout?.();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="mb-6 flex flex-col gap-4 border-2 border-ink bg-paper p-4 shadow-brutal md:flex-row md:items-end md:justify-between">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ink/70">
          Ticketing dashboard
        </p>
        <h1 className="mt-2 font-display text-3xl font-black uppercase tracking-tight md:text-4xl">
          {title}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-ink/60">
            Logged in · {userName} · {userRole === 'it_staff' ? 'IT Staff' : 'Employee'}
          </p>
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="cursor-pointer border-2 border-ink bg-paper px-3 py-2 font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-ink transition-all duration-150 hover:-translate-y-0.5 hover:bg-alert hover:text-paper hover:shadow-md active:translate-y-0 disabled:cursor-wait disabled:opacity-60"
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>

      {actionLabel ? (
        <button
          type="button"
          onClick={onAction}
          className="cursor-pointer inline-flex items-center justify-center border-2 border-ink bg-go px-4 py-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-paper shadow-brutal-sm transition-all duration-150 hover:-translate-y-1 hover:shadow-lg active:translate-y-0"
        >
          {actionLabel}
        </button>
      ) : null}
    </header>
  );
}
