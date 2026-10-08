import Link from "next/link";

export function AppShell({
  children,
  actions,
}: {
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="shell">
      <header className="no-print mb-6 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-[var(--line)] bg-[var(--bg-elevated)] text-lg">
            ●
          </span>
          <span>
            <strong className="block text-sm tracking-wide">Who That Dome</strong>
            <span className="text-xs text-[var(--muted)]">Musik-Gesellschaftsspiel</span>
          </span>
        </Link>
        {actions}
      </header>
      {children}
    </div>
  );
}
