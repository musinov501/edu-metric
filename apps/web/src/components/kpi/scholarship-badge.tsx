import { Badge } from '@/components/ui/badge';
import type { ScholarshipStatus } from '@/lib/api/types';

const LABEL: Record<ScholarshipStatus, string> = {
  ELIGIBLE: 'Eligible',
  AT_RISK: 'At Risk',
  REJECTED: 'Rejected',
  UNDER_REVIEW: 'Under Review',
};

const VARIANT: Record<ScholarshipStatus, 'success' | 'warning' | 'danger' | 'muted'> = {
  ELIGIBLE: 'success',
  AT_RISK: 'warning',
  REJECTED: 'danger',
  UNDER_REVIEW: 'muted',
};

export function ScholarshipBadge({ status }: { status: ScholarshipStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
