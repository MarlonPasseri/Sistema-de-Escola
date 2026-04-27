import { RiskLevel, InterventionStatus } from './enums';

export interface RiskFactor {
  code: string;
  description: string;
  points: number;
  severity: RiskLevel;
}

export interface RiskScore {
  id: string;
  studentId: string;
  score: number;
  level: RiskLevel;
  factors: RiskFactor[];
  calculatedAt: string;
}

export interface StudentRiskSummary {
  studentId: string;
  studentName: string;
  className: string;
  score: number;
  level: RiskLevel;
  mainFactor: string;
  lastInterventionStatus?: InterventionStatus;
  lastActionDate?: string;
}

export interface InterventionPlan {
  id: string;
  schoolId: string;
  studentId: string;
  riskScoreId: string;
  status: InterventionStatus;
  reason: string;
  goal: string;
  ownerUserId: string;
  startDate: string;
  reviewDate: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}
