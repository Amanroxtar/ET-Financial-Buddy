
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Wallet, 
  PiggyBank, 
  AlertCircle, 
  ArrowRight,
  Zap,
  Target,
  BarChart3,
  User,
  ShieldAlert,
  CreditCard,
  Briefcase,
  Target as GoalIcon,
  ShieldHalf,
  Lightbulb,
  Compass,
  Activity,
  Milestone,
  Scale,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle2,
  CalendarDays,
  PieChart,
  Layers
} from 'lucide-react';
import { DashboardData } from '../types/dashboard';
import PremiumUnlock from './PremiumUnlock';

interface DashboardProps {
  data: DashboardData;
  onShowReport: (data: any) => void;
  reportData?: any;
}

const getStatusColor = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('good') || s.includes('excellent') || s.includes('high') || s.includes('aligned')) return '#10b981'; // Green
  if (s.includes('average') || s.includes('moderate') || s.includes('fair')) return '#f59e0b'; // Orange
  return '#ef4444'; // Red
};

const getStatusBg = (status: string) => {
  const s = status.toLowerCase();
  if (s.includes('good') || s.includes('excellent') || s.includes('high') || s.includes('aligned')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (s.includes('average') || s.includes('moderate') || s.includes('fair')) return 'bg-amber-50 text-amber-700 border-amber-100';
  return 'bg-red-50 text-red-700 border-red-100';
};

export default function FinancialDashboard({ data, onShowReport, reportData }: DashboardProps) {
  const { 
    user_summary, 
    health_score, 
    status, 
    financial_breakdown, 
    insights, 
    suggestions,
    recommendations, 
    ideal_vs_current,
  } = data;

  // Calculate savings rate if not provided directly
  const incomeNum = parseFloat(user_summary.income.replace(/[^\d.]/g, '')) || 0;
  const expensesNum = parseFloat(user_summary.expenses.replace(/[^\d.]/g, '')) || 0;
  const savingsRate = incomeNum > 0 ? Math.round(((incomeNum - expensesNum) / incomeNum) * 100) : 0;

  return (
    <div className="max-w-7xl mx-auto p-3 md:p-6 space-y-4 bg-gray-50 font-sans text-et-dark min-h-screen">
      {/* TOP ROW: KEY METRICS */}
      {reportData && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-600 text-white p-4 rounded-none flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-emerald-900/10 border border-emerald-500"
        >
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-full">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest">Full Report Unlocked</h3>
              <p className="text-xs text-emerald-100">Your comprehensive financial strategy is ready for viewing.</p>
            </div>
          </div>
          <button 
            onClick={() => onShowReport(reportData)}
            className="w-full sm:w-auto bg-white text-emerald-600 px-6 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-50 transition-all flex items-center justify-center space-x-2 shadow-sm"
          >
            <span>View Full Detailed Report</span>
            <ArrowRight size={14} />
          </button>
        </motion.div>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Health Score Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-4 rounded-none border border-gray-200 shadow-sm flex items-center justify-between"
        >
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Health Score</p>
            <p className="text-3xl font-serif font-black" style={{ color: getStatusColor(status) }}>{health_score}</p>
            <p className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${getStatusBg(status)}`}>{status}</p>
          </div>
          <div className="relative w-16 h-16">
            <svg className="w-full h-full -rotate-90">
              <circle cx="32" cy="32" r="28" fill="transparent" stroke="#f3f4f6" strokeWidth="6" />
              <motion.circle
                cx="32" cy="32" r="28" fill="transparent"
                stroke={getStatusColor(status)}
                strokeWidth="6"
                strokeDasharray={2 * Math.PI * 28}
                initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - health_score / 100) }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
          </div>
        </motion.div>

        {/* Income Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-4 rounded-none border border-gray-200 shadow-sm flex items-center space-x-4"
        >
          <div className="p-2 bg-blue-50 rounded-lg"><Wallet className="text-blue-500" size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Income</p>
            <p className="text-xl font-serif font-bold">{user_summary.income}</p>
          </div>
        </motion.div>

        {/* Expenses Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-4 rounded-none border border-gray-200 shadow-sm flex items-center space-x-4"
        >
          <div className="p-2 bg-red-50 rounded-lg"><CreditCard className="text-red-500" size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Monthly Expenses</p>
            <p className="text-xl font-serif font-bold">{user_summary.expenses}</p>
          </div>
        </motion.div>

        {/* Savings Rate Card */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-4 rounded-none border border-gray-200 shadow-sm flex items-center space-x-4"
        >
          <div className="p-2 bg-emerald-50 rounded-lg"><TrendingUp className="text-emerald-500" size={20} /></div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Savings Rate</p>
            <p className="text-xl font-serif font-bold">{savingsRate}%</p>
          </div>
        </motion.div>
      </section>

      {/* SECOND ROW: USER SNAPSHOT */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Name', value: user_summary.name, icon: User },
          { label: 'Age', value: `${user_summary.age} Yrs`, icon: BarChart3 },
          { label: 'Occupation', value: user_summary.occupation || 'Professional', icon: Briefcase },
          { label: 'Risk Profile', value: user_summary.risk_profile, icon: ShieldHalf },
          { label: 'Goals', value: user_summary.goals || 'Wealth Creation', icon: GoalIcon },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + idx * 0.05 }}
            className="bg-white px-3 py-2 rounded-none border border-gray-100 flex items-center space-x-2"
          >
            <item.icon size={14} className="text-gray-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-0.5">{item.label}</p>
              <p className="text-[11px] font-bold text-et-dark truncate">{item.value}</p>
            </div>
          </motion.div>
        ))}
      </section>

      {/* THIRD ROW: FINANCIAL HEALTH BREAKDOWN */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { name: 'Savings', data: financial_breakdown.savings_score, icon: PiggyBank, insight: 'Excellent buffer' },
          { name: 'Insurance Coverage', data: financial_breakdown.insurance_coverage_score, icon: ShieldCheck, insight: 'Needs top-up' },
          { name: 'Investment Diversification', data: financial_breakdown.investment_diversification_score, icon: TrendingUp, insight: 'Diversify more' },
          { name: 'Debt Health', data: financial_breakdown.debt_health_score, icon: Wallet, insight: 'Manageable' },
          { name: 'Emergency Preparedness', data: financial_breakdown.emergency_preparedness_score, icon: AlertCircle, insight: 'Safety Net' },
          { name: 'Retirement Rediness', data: financial_breakdown.retirement_rediness_score, icon: Target, insight: 'Future Readiness' },
        ].map((item, idx) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 + idx * 0.05 }}
            className="bg-white p-3 rounded-none border border-gray-100 shadow-sm space-y-2"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <item.icon className="text-et-red" size={16} />
                <span className="text-[10px] font-bold text-et-dark uppercase">{item.name}</span>
              </div>
              <span className="text-xs font-serif font-black text-et-red">{item.data.score}%</span>
            </div>
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${item.data.score}%` }}
                className="h-full bg-et-red"
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[9px] text-gray-500 font-medium italic truncate">{item.insight}</p>
              <button 
                onClick={() => window.open(item.data.link, '_blank')}
                className="p-1 bg-red-50 hover:bg-et-red hover:text-white rounded-full transition-all text-et-red shrink-0"
              >
                <ArrowRight size={10} />
              </button>
            </div>
          </motion.div>
        ))}
      </section>

      {/* SWOT SECTION: STRENGTHS, WEAKNESSES, RISKS */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Strengths */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-1">
            <ArrowUpCircle className="text-emerald-500" size={16} />
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Strengths</h2>
          </div>
          <div className="bg-emerald-50/30 border border-emerald-100 rounded-none p-3 space-y-2">
            {data.strengths?.map((s, i) => (
              <div key={i} className="flex items-start space-x-2">
                <div className="w-1 h-1 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                <p className="text-[10px] text-emerald-900 font-medium leading-tight">{s}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Weaknesses */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-1">
            <ArrowDownCircle className="text-amber-500" size={16} />
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Weaknesses</h2>
          </div>
          <div className="bg-amber-50/30 border border-amber-100 rounded-none p-3 space-y-2">
            {data.weaknesses?.map((w, i) => (
              <div key={i} className="flex items-start space-x-2">
                <div className="w-1 h-1 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <p className="text-[10px] text-amber-900 font-medium leading-tight">{w}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Risks */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-1">
            <ShieldAlert className="text-red-500" size={16} />
            <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Risks</h2>
          </div>
          <div className="bg-red-50/30 border border-red-100 rounded-none p-3 space-y-2">
            {data.risks?.map((r, i) => (
              <div key={i} className="flex items-start space-x-2">
                <div className="w-1 h-1 rounded-full bg-red-500 mt-1.5 shrink-0" />
                <p className="text-[10px] text-red-900 font-medium leading-tight">{r}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INSIGHTS & SUGGESTIONS ROW */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Key Insights */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 px-1">
            <Lightbulb className="text-et-red" size={18} />
            <h2 className="text-sm font-serif font-bold uppercase tracking-widest">Key Insights</h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {insights.slice(0, 3).map((insight, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + idx * 0.1 }}
                className="bg-white p-3 rounded-none border-l-2 border-et-red shadow-sm flex items-center space-x-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-et-red shrink-0" />
                <p className="text-[11px] text-gray-700 font-medium leading-relaxed">{insight}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pro Suggestions */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 px-1">
            <Compass className="text-emerald-500" size={18} />
            <h2 className="text-sm font-serif font-bold uppercase tracking-widest">Pro Suggestions</h2>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {(suggestions || []).slice(0, 3).map((suggestion, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + idx * 0.1 }}
                className="bg-emerald-50/50 p-3 rounded-none border-l-2 border-emerald-500 shadow-sm flex items-center space-x-3"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                <p className="text-[11px] text-emerald-900 font-medium leading-relaxed">{suggestion}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ACTIONS SECTION */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2 px-1">
          <Activity className="text-et-red" size={18} />
          <h2 className="text-sm font-serif font-bold uppercase tracking-widest">Required Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.slice(0, 3).map((rec, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 + idx * 0.1 }}
              className="bg-white p-5 rounded-none border border-gray-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">{rec.type}</span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                    rec.priority === 'High' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {rec.priority}
                  </span>
                </div>
                <h3 className="text-sm font-serif font-bold text-et-dark leading-snug">
                  {rec.action}
                </h3>
              </div>
              
              <button 
                onClick={() => rec.link && window.open(rec.link, '_blank')}
                className="w-full py-3 bg-et-red text-white rounded-none font-bold text-[10px] uppercase tracking-widest flex items-center justify-center space-x-2 hover:bg-red-700 transition-colors disabled:opacity-50"
                disabled={!rec.link}
              >
                <span>Start Now</span>
                <ArrowRight size={12} />
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* MONTHLY PLAN SECTION */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2 px-1">
          <Milestone className="text-et-red" size={18} />
          <h2 className="text-sm font-serif font-bold uppercase tracking-widest">Monthly Roadmap</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white p-4 rounded-none border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Recommended SIP</p>
            <p className="text-xl font-serif font-bold text-emerald-600">{data.monthly_plan?.recommended_sip || '₹0'}</p>
          </div>
          <div className="bg-white p-4 rounded-none border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Emergency Target</p>
            <p className="text-xl font-serif font-bold text-blue-600">{data.monthly_plan?.emergency_fund_target || '₹0'}</p>
          </div>
          <div className="bg-white p-4 rounded-none border border-gray-100 shadow-sm flex flex-col justify-center items-center text-center space-y-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Insurance Gap</p>
            <p className="text-xl font-serif font-bold text-red-600">{data.monthly_plan?.insurance_gap || '₹0'}</p>
          </div>
        </div>
      </section>

      {/* SIXTH ROW: IDEAL VS CURRENT MINI VIEW */}
      <section className="space-y-3">
        <div className="flex items-center space-x-2 px-1">
          <Scale className="text-et-red" size={18} />
          <h2 className="text-sm font-serif font-bold uppercase tracking-widest">Gap Analysis</h2>
        </div>
        <div className="bg-white rounded-none border border-gray-100 shadow-sm overflow-hidden">
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 px-4 py-2">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Category</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Current</span>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Ideal</span>
          </div>
          <div className="divide-y divide-gray-50">
            {ideal_vs_current.slice(0, 4).map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 px-4 py-2.5 items-center hover:bg-gray-50/50 transition-colors">
                <span className="text-[13px] font-bold text-et-dark">{item.category}</span>
                <span className="text-[12px] text-red-500 font-bold">{item.current}</span>
                <span className="text-[12px] text-emerald-600 font-bold">{item.ideal}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {!reportData && <PremiumUnlock data={data} onShowReport={onShowReport} />}

      <footer className="text-center pt-4 pb-2">
        <p className="text-[8px] text-gray-400 font-bold uppercase tracking-[0.3em]">
          Economic Times Financial Intelligence • Powered by Anaya AI
        </p>
      </footer>
    </div>
  );
}
