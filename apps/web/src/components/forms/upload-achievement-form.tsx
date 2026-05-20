'use client';

import { useState } from 'react';
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUploadAchievement, type UploadAchievementInput } from '@/lib/hooks/use-achievements';

const TYPES: UploadAchievementInput['type'][] = [
  'HACKATHON',
  'CERTIFICATE',
  'STARTUP',
  'VOLUNTEER',
  'MENTORING',
  'EMPLOYMENT',
  'OTHER',
];

const POINTS_KEYS: { key: string; label: string }[] = [
  { key: 'HACKATHON_PARTICIPATION', label: 'Hackathon Participation (+1)' },
  { key: 'HACKATHON_WINNER', label: 'Hackathon Winner (+3)' },
  { key: 'STARTUP_PROJECT', label: 'Startup Project (+5)' },
  { key: 'MENTORING_WEAK_STUDENTS', label: 'Mentoring Weak Students (+3)' },
  { key: 'PDP_ONLINE_CERTIFICATE', label: 'PDP Online Certificate (+2)' },
  { key: 'PDP_OFFLINE_CERTIFICATE', label: 'PDP Offline Certificate (+3)' },
  { key: 'NATIONAL_IT_CERTIFICATE', label: 'National IT Certificate (+2)' },
  { key: 'ENGLISH_CERTIFICATE', label: 'English Certificate (+3)' },
  { key: 'INTERNATIONAL_IT_CERTIFICATE', label: 'International IT Certificate (+5)' },
  { key: 'PDP_ECOSYSTEM_WORK', label: 'PDP Ecosystem Work (+2)' },
];

export function UploadAchievementForm() {
  const upload = useUploadAchievement();
  const [type, setType] = useState<UploadAchievementInput['type']>('CERTIFICATE');
  const [pointsKey, setPointsKey] = useState<string>('PDP_ONLINE_CERTIFICATE');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [externalLink, setExternalLink] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await upload.mutateAsync({
        type,
        title,
        description: description || undefined,
        externalLink: externalLink || undefined,
        pointsKey,
        // Local file hash placeholder until Cloudinary signing is wired:
        fileHash: title ? `local-${title}-${Date.now()}` : undefined,
      });
      toast.success('Achievement submitted — pending admin review');
      setTitle('');
      setDescription('');
      setExternalLink('');
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? // @ts-expect-error axios error shape
            (err.response?.data?.message ?? 'Upload failed')
          : 'Network error';
      toast.error(typeof message === 'string' ? message : 'Upload failed');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <select
            id="type"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={type}
            onChange={(e) => setType(e.target.value as UploadAchievementInput['type'])}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="pointsKey">Category</Label>
          <select
            id="pointsKey"
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
            value={pointsKey}
            onChange={(e) => setPointsKey(e.target.value)}
          >
            {POINTS_KEYS.map((p) => (
              <option key={p.key} value={p.key}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="JavaScript Bootcamp Completion"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          rows={3}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Short summary of what you accomplished"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="externalLink">External link (optional)</Label>
        <Input
          id="externalLink"
          type="url"
          value={externalLink}
          onChange={(e) => setExternalLink(e.target.value)}
          placeholder="https://example.com/certificate"
        />
      </div>

      <Button type="submit" disabled={upload.isPending}>
        {upload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {upload.isPending ? 'Submitting…' : 'Submit for review'}
      </Button>

      <p className="text-xs text-muted-foreground">
        File uploads route through Cloudinary; in this MVP we accept titles + descriptions and
        admins verify before points count.
      </p>
    </form>
  );
}
