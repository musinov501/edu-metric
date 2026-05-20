import { LeaderboardView } from '@/components/leaderboard/leaderboard-view';

export const metadata = { title: 'Leaderboard · EduMetric' };

export default function MentorLeaderboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Full ranking. Click any student to see the explainable breakdown.
        </p>
      </header>
      <LeaderboardView />
    </div>
  );
}
