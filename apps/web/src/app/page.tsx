import Link from 'next/link';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <div className="max-w-3xl space-y-8">
        <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          AI-powered · Transparent · Institutional-grade
        </span>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          EduMetric — explainable scholarship intelligence.
        </h1>
        <p className="text-lg text-muted-foreground">
          A transparent evaluation ecosystem that always answers:{' '}
          <span className="font-semibold text-foreground">why this student got this ranking.</span>
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Sign in
          </Link>
          <Link
            href="/guest/leaderboard"
            className="rounded-md border px-5 py-2.5 text-sm font-medium hover:bg-muted"
          >
            View public leaderboard
          </Link>
        </div>
      </div>
    </main>
  );
}
