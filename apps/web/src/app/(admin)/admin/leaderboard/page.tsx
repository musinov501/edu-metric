import { LeaderboardView } from '@/components/leaderboard/leaderboard-view';

export const metadata = { title: 'Leaderboard · EduMetric' };

export default function AdminLeaderboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Full ranking with explainable breakdown for every student.
        </p>
      </header>
      <LeaderboardView />
    </div>
  );
}
