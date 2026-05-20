import { LeaderboardView } from '@/components/leaderboard/leaderboard-view';

export const metadata = { title: 'Public Leaderboard · EduMetric' };

export default function GuestLeaderboardPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Public Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Transparent ranking across all students. No login required.
        </p>
      </header>
      <LeaderboardView />
    </div>
  );
}
