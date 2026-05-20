'use client';

import { Bell, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useNotifications, useMarkRead } from '@/lib/hooks/use-notifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from '@/lib/utils/date';

const TYPE_TONE = {
  INFO: 'default',
  SUCCESS: 'success',
  WARNING: 'warning',
  CRITICAL: 'danger',
} as const;

export default function NotificationsPage() {
  const { data: notifications } = useNotifications();
  const markRead = useMarkRead();

  async function onMarkRead(id: string) {
    try {
      await markRead.mutateAsync(id);
    } catch {
      toast.error('Failed to mark as read');
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
        <p className="text-sm text-muted-foreground">Updates about your KPI, achievements, and scholarship status.</p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4" /> All notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!notifications ? (
            <Skeleton className="h-32" />
          ) : notifications.length === 0 ? (
            <div className="rounded-lg border border-dashed py-12 text-center text-muted-foreground">
              You're all caught up. New events will land here in real time.
            </div>
          ) : (
            <ul className="divide-y">
              {notifications.map((n) => (
                <li key={n.id} className={`flex items-start justify-between gap-3 py-3 ${n.isRead ? 'opacity-70' : ''}`}>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{n.title}</span>
                      <Badge variant={TYPE_TONE[n.type]}>{n.type.toLowerCase()}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{n.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(n.createdAt))} ago
                    </p>
                  </div>
                  {!n.isRead && (
                    <Button variant="outline" size="sm" onClick={() => onMarkRead(n.id)}>
                      <Check className="h-4 w-4" /> Mark read
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
