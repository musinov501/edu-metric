import { LeaderboardView } from '@/components/leaderboard/leaderboard-view';

export const metadata = { title: 'Leaderboard · EduMetric' };

export default function StudentLeaderboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Top performers across the cohort. Click anyone to see exactly why they ranked there.
        </p>
      </header>
      <LeaderboardView />
    </div>
  );
}
