export type RiskLevel = 'EXCELLENT' | 'STRONG' | 'AT_RISK' | 'CRITICAL';

export function riskLevelFor(score: number): RiskLevel {
  if (score >= 90) return 'EXCELLENT';
  if (score >= 80) return 'STRONG';
  if (score >= 70) return 'AT_RISK';
  return 'CRITICAL';
}
