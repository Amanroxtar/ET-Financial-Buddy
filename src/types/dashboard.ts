
export interface UserSummary {
  name: string;
  age: string;
  occupation?: string;
  income: string;
  expenses: string;
  savings: string;
  risk_profile: string;
  goals?: string;
}

export interface ScoreWithLink {
  score: number;
  link: string;
}

export interface FinancialBreakdown {
  savings_score: ScoreWithLink;
  investment_diversification_score: ScoreWithLink;
  retirement_rediness_score: ScoreWithLink;
  insurance_coverage_score: ScoreWithLink;
  debt_health_score: ScoreWithLink;
  emergency_preparedness_score: ScoreWithLink;
}

export interface Recommendation {
  type: string;
  action: string;
  link?: string;
  priority: 'High' | 'Medium' | 'Low' | string;
}

export interface IdealVsCurrent {
  category: string;
  current: string;
  ideal: string;
}

export interface MonthlyPlan {
  recommended_sip: string;
  emergency_fund_target: string;
  insurance_gap: string;
}

export interface DashboardData {
  user_summary: UserSummary;
  health_score: number;
  status: string;
  financial_breakdown: FinancialBreakdown;
  strengths: string[];
  weaknesses: string[];
  risks: string[];
  insights: string[];
  suggestions?: string[];
  recommendations: Recommendation[];
  ideal_vs_current: IdealVsCurrent[];
  monthly_plan: MonthlyPlan;
}

export interface ApiResponse {
  bot_message?: string;
  message?: string;
  output?: string;
  text?: string;
  dashboard?: DashboardData;
}
