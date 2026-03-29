export interface DetailedReportData {
  executive_summary: string;
  health_score: {
    overall: number;
    status: string;
    verdict: string;
    sub_scores: {
      savings: { score: number; status: string; gap: string; fix: string };
      investment: { score: number; status: string; gap: string; fix: string };
      debt: { score: number; status: string; gap: string; fix: string };
      insurance: { score: number; status: string; gap: string; fix: string };
      emergency_fund: { score: number; status: string; gap: string; fix: string };
      tax_efficiency: { score: number; status: string; gap: string; fix: string };
    };
  };
  income_expense: {
    summary: string;
    savings_rate_current: string;
    savings_rate_recommended: string;
    expense_ratio: { fixed: string; variable: string };
    money_drains: string[];
    sustainability_check: string;
    stress_test: string;
  };
  savings: {
    summary: string;
    emergency_fund_months: number;
    emergency_fund_status: string;
    where_parked: string;
    vulnerability: string;
  };
  debt: {
    summary: string;
    total_outstanding: string;
    monthly_emi_total: string;
    emi_to_income_ratio: string;
    emi_status: string;
    most_expensive_debt: string;
    debt_freedom_timeline: string;
    action: string;
  };
  investments: {
    summary: string;
    current_portfolio: {
      asset_class: string;
      amount: string;
      allocation_pct: string;
    }[];
    asset_allocation_verdict: string;
    sip_adequacy: string;
    missing_investments: string[];
    equity_allocation_check: string;
  };
  insurance: {
    summary: string;
    life_cover_current: string;
    life_cover_recommended: string;
    life_cover_gap: string;
    health_cover_current: string;
    health_cover_recommended: string;
    health_cover_gap: string;
    critical_illness_cover: string;
    underinsurance_risk: string;
  };
  goals: {
    name: string;
    timeline: string;
    estimated_cost: string;
    feasibility: string;
    monthly_sip_required: string;
    gap_analysis: string;
    priority: string;
  }[];
  tax: {
    current_liability: string;
    unused_deductions: string;
    regime_recommendation: string;
    annual_tax_saving_possible: string;
    tax_saving_investments_advice: string;
  };
  strengths: {
    point: string;
    why_it_matters: string;
    how_to_build_on_it: string;
  }[];
  weaknesses: {
    point: string;
    consequence_if_ignored: string;
    first_step_to_fix: string;
  }[];
  risks: {
    name: string;
    probability: string;
    financial_impact: string;
    mitigation: string;
  }[];
  opportunities: {
    opportunity: string;
    ease: string;
    expected_benefit: string;
  }[];
  plan: {
    phase: string;
    action: string;
    why: string;
    how_much_how_often: string;
  }[];
  monthly_budget_blueprint: {
    system_name: string;
    allocations: {
      category: string;
      recommended_pct: string;
      recommended_amount: string;
      current_amount: string;
      gap: string;
    }[];
    recommended_sip: string;
    emergency_fund_monthly_contribution: string;
    insurance_annual_premium: string;
  };
  ideal_vs_current: {
    category: string;
    current: string;
    ideal: string;
    gap: string;
    urgency: string;
  }[];
  behavioral_advice: {
    money_patterns_identified: string[];
    psychological_trap: string;
    habits: string[];
    motivation: string;
  };
  recommendations: {
    type: string;
    why_this_for_you: string;
    suggested_amount: string;
    priority: string;
    estimated_benefit: string;
    link: string;
  }[];
  insights: string[];
  next_actions: {
    action: string;
    time_required: string;
    impact: string;
  }[];
}
