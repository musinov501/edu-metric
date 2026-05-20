/**
 * AI/UI risk tier shown to the user (Group 6).
 * Computed from final KPI score.
 */
export type RiskLevel = 'EXCELLENT' | 'STRONG' | 'AT_RISK' | 'CRITICAL';

export const RISK_LEVEL_LABELS: Record<RiskLevel, string> = {
  EXCELLENT: 'Excellent',
  STRONG: 'Strong',
  AT_RISK: 'At Risk',
  CRITICAL: 'Critical',
};

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 80) return 'STRONG';
  if (score >= 70) return 'AT_RISK';
  return 'CRITICAL';
}
