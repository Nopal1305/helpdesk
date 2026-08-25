import HeaderBar from './HeaderBar';

export default function DashboardLayout({ title, actionLabel, onAction, children, userRole, user, onLogout }) {
  return (
    <div className="min-h-screen bg-orange-100 p-4 text-ink md:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-none border-2 border-ink bg-paper p-4 shadow-brutal md:p-6">
          <HeaderBar title={title} actionLabel={actionLabel} onAction={onAction} userRole={userRole} user={user} onLogout={onLogout} />
          <main className="mt-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
