import { Link, Route, Routes } from "react-router-dom";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
    </Routes>
  );
}

function HomePage() {
  return (
    <main className="auth-wrap">
      <section className="w-full max-w-[420px] rounded-lg border border-line bg-surface px-8 py-7 shadow-[0_1px_2px_rgba(19,18,17,0.04)]">
        <p className="font-mono text-[11px] font-medium uppercase tracking-[0.16em] text-ink-3">
          Checkpoint 1
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-normal text-ink">
          TaskForge
        </h1>
        <p className="mt-3 text-sm leading-6 text-ink-2">
          A simple workspace for managing your work.
        </p>
        <div className="mt-7 border-t border-line pt-5">
          <Link
            className="inline-flex h-10 items-center justify-center rounded-[var(--r)] bg-accent px-4 text-sm font-medium text-accent-fg hover:bg-[var(--accent-hover)] focus-visible:outline-accent"
            to="/"
          >
            Frontend setup complete
          </Link>
        </div>
      </section>
    </main>
  );
}
