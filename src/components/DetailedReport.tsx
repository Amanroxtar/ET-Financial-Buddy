import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, TrendingUp, AlertTriangle, Lightbulb, 
  Calendar, PieChart, ArrowUpRight, 
  CheckCircle, Shield, Briefcase, Activity,
  ArrowLeft, Download, Mail,
  Lock, Award, Percent,
  Zap, Brain, ListChecks, Info, Loader2
} from 'lucide-react';
import { DetailedReportData } from '../types/report';

interface DetailedReportProps {
  report: DetailedReportData;
  onBack: () => void;
}

const WhatsAppIcon = ({ className = "" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export default function DetailedReport({ report, onBack }: DetailedReportProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfResponse, setPdfResponse] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating && !isSuccess && progress < 95) {
      interval = setInterval(() => {
        setProgress(prev => {
          const increment = Math.random() * 5;
          return Math.min(prev + increment, 95);
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isGenerating, isSuccess, progress]);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    setProgress(0);
    setError(null);
    setIsSuccess(false);
    setPdfUrl(null);
    setPdfResponse(null);

    try {
      const response = await fetch('https://amangg317.app.n8n.cloud/webhook/eb01def9-52cd-4ad3-bda6-aa2099f09e50', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(report),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText || 'Failed to generate PDF'}`);
      }

      const data = await response.json();
      console.log('PDF Generation Response:', data);
      
      // Handle both array and object responses
      const result = Array.isArray(data) ? data[0] : data;
      
      if (result && result.url) {
        setPdfUrl(result.url);
        setPdfResponse(data);
        setProgress(100);
        setIsSuccess(true);
        // Close overlay on success so user sees the new buttons on the page
        setTimeout(() => setIsGenerating(false), 1000);
      } else {
        console.error('Unexpected response structure:', data);
        throw new Error('The PDF generator did not return a valid download link.');
      }

    } catch (err) {
      console.error('PDF Generation Error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      // Keep isGenerating true to show the error in the overlay
    }
  };

  const handleDownload = async () => {
    if (pdfUrl) {
      try {
        // Attempt to fetch the file to force a download (works if CORS is configured)
        const response = await fetch(pdfUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Full_Detailed_Report.pdf');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        // Fallback: Open in new tab if fetch fails (likely CORS restriction)
        window.open(pdfUrl, '_blank');
      }
    }
  };

  const handleEmail = async () => {
    if (!pdfUrl) return;
    if (!email || !email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setIsEmailSending(true);
    setEmailError(null);
    setEmailSent(false);

    try {
      const url = new URL('https://amangg317.app.n8n.cloud/webhook/4a1dceb0-9a91-432c-b245-76eabe6216e9');
      url.searchParams.append('email', email);
      url.searchParams.append('pdfUrl', pdfUrl);
      if (pdfResponse) {
        url.searchParams.append('pdfData', JSON.stringify(pdfResponse));
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to send email. Please try again.');
      }

      setEmailSent(true);
      setEmail('');
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : 'Failed to send email');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleWhatsApp = () => {
    if (pdfUrl) {
      const message = `Check out my comprehensive financial audit report generated by Economic Times Financial Intelligence: ${pdfUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-white text-et-dark font-sans relative"
    >
      <AnimatePresence>
        {isGenerating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-et-dark/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
          >
            <div className="max-w-md w-full space-y-8">
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 border-2 border-et-red/20 rounded-full mx-auto"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-serif font-bold text-white">{Math.round(progress)}%</span>
                </div>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-tight">
                  {error ? 'Generation Failed' : (isSuccess ? 'Report Generated!' : 'Generating Your PDF')}
                </h2>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {error ? error : (isSuccess 
                    ? 'Your comprehensive financial audit has been successfully compiled.' 
                    : 'Our AI is compiling your personalized financial audit into a professional PDF document. This may take a moment.')}
                </p>
              </div>

              {!isSuccess && !error && (
                <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-et-red"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                  />
                </div>
              )}

              {error && (
                <div className="flex flex-col gap-3 pt-4">
                  <button 
                    onClick={handleGeneratePDF}
                    className="bg-et-red text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl"
                  >
                    Try Again
                  </button>
                  <button 
                    onClick={() => {
                      setIsGenerating(false);
                      setError(null);
                    }}
                    className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-white transition-colors pt-2"
                  >
                    Cancel
                  </button>
                </div>
              )}

              {isSuccess && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mb-2">
                    <CheckCircle size={32} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-serif font-bold text-white uppercase tracking-tight">Report Ready!</h2>
                  <p className="text-gray-400 text-sm">Your financial audit has been successfully compiled.</p>
                </motion.div>
              )}

              <div className="flex items-center justify-center space-x-4 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <div className="flex items-center space-x-2">
                  <Shield size={12} className="text-emerald-500" />
                  <span>Secure Processing</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-gray-700" />
                <div className="flex items-center space-x-2">
                  <Brain size={12} className="text-et-red" />
                  <span>AI Compilation</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <button 
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-500 hover:text-et-red transition-colors group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest">Back to Dashboard</span>
        </button>
        
        <div className="flex items-center space-x-4">
          {pdfUrl && (
            <button 
              onClick={handleDownload}
              className="p-2 text-gray-400 hover:text-et-red transition-colors hidden sm:block" 
              title="Download PDF"
            >
              <Download size={20} />
            </button>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden">
        {/* Background Decorative Image - Blurred */}
        <div className="absolute top-0 left-0 w-full h-[600px] -z-10 opacity-10">
          <img 
            src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop" 
            alt="Wealth Growth" 
            className="w-full h-full object-cover blur-xl scale-110"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white" />
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
          {/* Report Header */}
          <header className="text-center space-y-6 border-b border-gray-100 pb-12 relative">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 opacity-[0.03] select-none pointer-events-none">
              <span className="text-9xl font-serif font-black tracking-tighter uppercase">CONFIDENTIAL</span>
            </div>
            
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-et-red text-white text-[10px] font-bold uppercase tracking-[0.3em]">
              <Lock size={10} />
              <span>Premium Intelligence Report</span>
            </div>
            
            <h1 className="text-4xl md:text-7xl font-serif font-bold leading-tight tracking-tight">
              Comprehensive <span className="italic text-et-red">Financial Audit</span>
            </h1>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-12 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <div className="flex items-center space-x-2">
              <Calendar size={14} />
              <span>Generated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Shield size={14} />
              <span>Verified by ET Financial AI</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText size={14} />
              <span>Ref: ET-PRIME-{Math.floor(Math.random() * 1000000)}</span>
            </div>
          </div>
        </header>

        {/* Executive Summary & Score */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center space-x-3 text-et-red">
              <FileText size={24} />
              <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Executive Summary</h2>
            </div>
            <div className="bg-white/50 backdrop-blur-sm p-8 border-l-4 border-et-red shadow-sm">
              <p className="text-xl text-gray-700 leading-relaxed font-serif italic">
                "{report.executive_summary || 'No summary available.'}"
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="bg-emerald-50/50 p-4 border border-emerald-100">
                <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">Verdict</div>
                <p className="text-sm font-medium text-emerald-900">{report.health_score?.verdict || 'N/A'}</p>
              </div>
              <div className="bg-amber-50/50 p-4 border border-amber-100">
                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-1">Status</div>
                <p className="text-sm font-medium text-amber-900">{report.health_score?.status || 'N/A'}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-et-dark text-white p-8 flex flex-col items-center justify-center text-center space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-et-red/10 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="74"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-white/10"
                />
                <motion.circle
                  cx="80"
                  cy="80"
                  r="74"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={464.7}
                  initial={{ strokeDashoffset: 464.7 }}
                  animate={{ strokeDashoffset: 464.7 - (464.7 * (report.health_score?.overall || 0)) / 100 }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="text-et-red"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-5xl font-serif font-black">{report.health_score?.overall || 0}</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-gray-400">Health Score</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 w-full pt-4 border-t border-white/10">
              {report.health_score?.sub_scores && Object.entries(report.health_score.sub_scores).slice(0, 4).map(([key, value]) => (
                <div key={key} className="text-left">
                  <div className="text-[8px] font-bold uppercase tracking-tighter text-gray-500">{key.replace('_', ' ')}</div>
                  <div className="text-xs font-bold">{value.score}/100</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Core Analysis Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200 border border-gray-200">
          {[
            { title: 'Income & Expense', icon: <Activity size={20} />, content: report.income_expense?.summary },
            { title: 'Savings & Liquidity', icon: <TrendingUp size={20} />, content: report.savings?.summary },
            { title: 'Debt Management', icon: <AlertTriangle size={20} />, content: report.debt?.summary },
            { title: 'Insurance Coverage', icon: <Shield size={20} />, content: report.insurance?.summary },
            { title: 'Investment Strategy', icon: <PieChart size={20} />, content: report.investments?.summary },
            { title: 'Tax Efficiency', icon: <Percent size={20} />, content: report.tax?.regime_recommendation },
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 space-y-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3 text-et-red">
                {item.icon}
                <h3 className="text-xs font-bold uppercase tracking-widest">{item.title}</h3>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">{item.content || 'Data not available for this section.'}</p>
            </div>
          ))}
        </div>

        {/* Strengths & Weaknesses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-center space-x-3 text-emerald-600">
              <CheckCircle size={24} />
              <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Key Strengths</h2>
            </div>
            <div className="space-y-6">
              {report.strengths?.map((s, i) => (
                <div key={i} className="border-l-2 border-emerald-500 pl-6 space-y-2">
                  <h4 className="font-bold text-et-dark">{s.point}</h4>
                  <p className="text-sm text-gray-500">{s.why_it_matters}</p>
                  <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Action: {s.how_to_build_on_it}</p>
                </div>
              )) || <p className="text-sm text-gray-400 italic">No specific strengths identified.</p>}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center space-x-3 text-et-red">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Critical Weaknesses</h2>
            </div>
            <div className="space-y-6">
              {report.weaknesses?.map((w, i) => (
                <div key={i} className="border-l-2 border-et-red pl-6 space-y-2">
                  <h4 className="font-bold text-et-dark">{w.point}</h4>
                  <p className="text-sm text-gray-500">{w.consequence_if_ignored}</p>
                  <p className="text-[10px] font-bold text-et-red uppercase tracking-widest">Fix: {w.first_step_to_fix}</p>
                </div>
              )) || <p className="text-sm text-gray-400 italic">No critical weaknesses identified.</p>}
            </div>
          </div>
        </div>

        {/* Risks & Opportunities */}
        <div className="bg-et-dark text-white p-12 rounded-none grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-center space-x-3 text-red-400">
              <AlertTriangle size={24} />
              <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Identified Risks</h2>
            </div>
            <div className="space-y-6">
              {report.risks?.map((r, i) => (
                <div key={i} className="space-y-2 bg-white/5 p-4 border-l border-red-400/30">
                  <div className="flex justify-between items-start">
                    <div className="text-sm font-bold text-white">{r.name}</div>
                    <span className={`text-[8px] px-1.5 py-0.5 font-bold uppercase tracking-widest rounded-sm ${
                      r.probability === 'High' ? 'bg-red-500/20 text-red-400' : 
                      r.probability === 'Medium' ? 'bg-amber-500/20 text-amber-400' : 
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {r.probability} Prob.
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">Impact: {r.financial_impact}</div>
                  <div className="text-[10px] text-emerald-400/80 italic">Mitigation: {r.mitigation}</div>
                </div>
              )) || <p className="text-sm text-gray-400 italic">No immediate risks identified.</p>}
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center space-x-3 text-emerald-400">
              <Lightbulb size={24} />
              <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Growth Opportunities</h2>
            </div>
            <div className="space-y-4">
              {report.opportunities?.map((o, i) => (
                <div key={i} className="flex items-start space-x-3 text-sm text-gray-300 bg-white/5 p-4">
                  <ArrowUpRight size={16} className="mt-1 flex-shrink-0 text-emerald-400" />
                  <div className="space-y-1">
                    <div className="font-bold text-white">{o.opportunity}</div>
                    <div className="flex items-center space-x-4 text-[10px] text-gray-500 uppercase tracking-widest">
                      <span>Ease: {o.ease}</span>
                      <span className="text-emerald-400/60">Benefit: {o.expected_benefit}</span>
                    </div>
                  </div>
                </div>
              )) || <p className="text-sm text-gray-400 italic">No specific opportunities identified.</p>}
            </div>
          </div>
        </div>

        {/* Ideal vs Current Comparison */}
        <div className="space-y-8">
          <div className="flex items-center space-x-3 text-et-red">
            <PieChart size={24} />
            <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Gap Analysis: Ideal vs Current</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 border-y border-gray-200">
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Category</th>
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Current</th>
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Ideal</th>
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Gap</th>
                  <th className="text-left p-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Urgency</th>
                </tr>
              </thead>
              <tbody>
                {report.ideal_vs_current?.map((item, i) => (
                  <tr key={i} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-bold text-sm">{item.category}</td>
                    <td className="p-4 text-sm text-gray-500">{item.current}</td>
                    <td className="p-4 text-sm text-et-dark font-medium">{item.ideal}</td>
                    <td className="p-4 text-sm text-et-red font-bold">{item.gap}</td>
                    <td className="p-4">
                      <span className={`text-[8px] px-2 py-1 font-bold uppercase tracking-widest rounded-full ${
                        item.urgency === 'High' ? 'bg-red-100 text-red-600' : 
                        item.urgency === 'Medium' ? 'bg-amber-100 text-amber-600' : 
                        'bg-emerald-100 text-emerald-600'
                      }`}>
                        {item.urgency}
                      </span>
                    </td>
                  </tr>
                )) || (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-sm text-gray-400 italic">No gap analysis data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Strategic Roadmap */}
        <div className="space-y-12">
          <div className="flex items-center space-x-3 text-et-red">
            <Briefcase size={24} />
            <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Strategic Roadmap</h2>
          </div>
          <div className="space-y-12">
            {report.plan?.map((p, i) => (
              <div key={i} className="relative pl-12">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
                <div className="absolute left-[-4px] top-0 w-2 h-2 rounded-full bg-et-red" />
                <div className="space-y-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-et-red">{p.phase}</div>
                  <h4 className="text-xl font-serif font-bold">{p.action}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed max-w-3xl">{p.why}</p>
                  <div className="inline-block bg-gray-100 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                    Frequency: {p.how_much_how_often}
                  </div>
                </div>
              </div>
            )) || <p className="text-sm text-gray-400 italic">No roadmap data available.</p>}
          </div>
        </div>

        {/* Monthly Budgetary Plan */}
        <div className="bg-gray-50 p-12 space-y-8">
          <div className="flex items-center space-x-3 text-et-red">
            <Calendar size={24} />
            <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Monthly Budget Blueprint: {report.monthly_budget_blueprint?.system_name || 'N/A'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {report.monthly_budget_blueprint?.allocations?.map((item, i) => (
              <div key={i} className="bg-white p-6 border border-gray-100 shadow-sm space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">{item.category}</span>
                  <span className="text-xs font-bold text-et-red">{item.recommended_pct}</span>
                </div>
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Recommended</div>
                    <div className="text-lg font-serif font-bold">{item.recommended_amount}</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-[10px] text-gray-400 uppercase tracking-tighter">Current</div>
                    <div className="text-sm font-medium text-gray-500">{item.current_amount}</div>
                  </div>
                </div>
                {item.gap !== "0" && (
                  <div className="pt-2 border-t border-gray-50 text-[10px] font-bold text-amber-600 uppercase tracking-widest">
                    Gap: {item.gap}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-gray-200">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Recommended SIP</div>
              <div className="text-lg font-serif font-bold text-emerald-600">{report.monthly_budget_blueprint?.recommended_sip || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Emergency Fund Contrib.</div>
              <div className="text-lg font-serif font-bold text-amber-600">{report.monthly_budget_blueprint?.emergency_fund_monthly_contribution || 'N/A'}</div>
            </div>
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Insurance Premium</div>
              <div className="text-lg font-serif font-bold text-et-red">{report.monthly_budget_blueprint?.insurance_annual_premium || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* Behavioral Advice & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="flex items-center space-x-3 text-et-red">
              <Brain size={24} />
              <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Behavioral Blueprint</h2>
            </div>
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 border-l-4 border-et-red italic font-serif text-lg text-gray-700">
                “{report.behavioral_advice?.motivation || 'Financial freedom is a journey, not a destination.'}”
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Money Patterns</h4>
                  <ul className="space-y-2">
                    {report.behavioral_advice?.money_patterns_identified?.map((pattern, i) => (
                      <li key={i} className="text-sm flex items-center space-x-2">
                        <div className="w-1 h-1 rounded-full bg-et-red" />
                        <span>{pattern}</span>
                      </li>
                    )) || <li className="text-sm text-gray-400 italic">No patterns identified.</li>}
                  </ul>
                </div>
                <div className="space-y-3">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Psychological Trap</h4>
                  <p className="text-sm text-et-red font-medium">{report.behavioral_advice?.psychological_trap || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center space-x-3 text-et-red">
              <Award size={24} />
              <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Smart Recommendations</h2>
            </div>
            <div className="space-y-4">
              {report.recommendations?.map((rec, i) => (
                <div key={i} className="bg-white border border-gray-100 p-4 hover:shadow-lg transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-et-red">{rec.type}</div>
                      <div className="font-bold text-et-dark">{rec.why_this_for_you}</div>
                    </div>
                    <span className={`text-[8px] px-2 py-1 font-bold uppercase tracking-widest rounded-sm ${
                      rec.priority === 'High' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Suggested: <span className="font-bold text-et-dark">{rec.suggested_amount}</span></span>
                    <span className="text-emerald-600 font-bold">{rec.estimated_benefit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights & Next Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-1 space-y-8">
            <div className="flex items-center space-x-3 text-et-red">
              <Zap size={24} />
              <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Key Insights</h2>
            </div>
            <div className="space-y-4">
              {report.insights?.map((insight, i) => (
                <div key={i} className="flex items-start space-x-3 p-4 bg-gray-50 border-r-4 border-gray-200">
                  <Info size={16} className="mt-1 flex-shrink-0 text-et-red" />
                  <p className="text-sm text-gray-600 leading-relaxed">{insight}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center space-x-3 text-et-red">
              <ListChecks size={24} />
              <h2 className="text-xl font-serif font-bold uppercase tracking-tight">Immediate Next Actions</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {report.next_actions?.map((item, i) => (
                <div key={i} className="p-6 bg-white border border-gray-100 hover:border-et-red hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-8 h-8 bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-et-red group-hover:text-white transition-colors">
                      0{i + 1}
                    </div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">{item.time_required}</span>
                  </div>
                  <h4 className="font-bold text-et-dark mb-2">{item.action}</h4>
                  <p className="text-xs text-emerald-600 font-medium italic">Impact: {item.impact}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Final Actions Section */}
        <div className="pt-12 border-t border-gray-100">
          <div className="bg-et-dark p-12 text-center space-y-8 relative overflow-hidden">
            {/* Blurred Image Background for Action Box */}
            <div className="absolute inset-0 opacity-20 -z-10">
              <img 
                src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?q=80&w=2071&auto=format&fit=crop" 
                alt="Wealth Growth" 
                className="w-full h-full object-cover blur-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            
            <div className="space-y-4 relative z-10">
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Ready to take the next step?</h2>
              <p className="text-gray-400 text-sm max-w-xl mx-auto">
                Generate this financial personal report as a PDF to keep a permanent record of your analysis and recommendations.
              </p>
            </div>

            <div className="flex flex-col items-center justify-center gap-6 relative z-10 max-w-2xl mx-auto w-full">
              {error && (
                <p className="text-red-400 text-xs font-bold uppercase tracking-widest mb-2">{error}</p>
              )}
              
              {!isSuccess ? (
                <button 
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className="w-full sm:w-auto flex items-center justify-center space-x-3 bg-et-red text-white px-12 py-4 text-xs font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-900/20 disabled:opacity-50"
                >
                  {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                  <span>{isGenerating ? 'Generating...' : 'Generate PDF'}</span>
                </button>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <button 
                      onClick={handleDownload}
                      className="w-full flex items-center justify-center space-x-3 bg-white text-et-dark px-6 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-100 transition-all shadow-xl"
                    >
                      <Download size={18} />
                      <span>Download PDF</span>
                    </button>

                    <button 
                      onClick={handleWhatsApp}
                      className="w-full flex items-center justify-center space-x-3 bg-emerald-600 text-white px-6 py-4 text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl"
                    >
                      <WhatsAppIcon className="w-5 h-5" />
                      <span>WhatsApp</span>
                    </button>
                    
                    <div className="flex flex-col space-y-2">
                      <div className="flex gap-2">
                        <input 
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter email for PDF"
                          className="flex-1 bg-white/10 border border-white/20 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-et-red transition-colors"
                        />
                        <button 
                          onClick={handleEmail}
                          disabled={isEmailSending}
                          className="bg-et-red text-white px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl disabled:opacity-50 flex items-center gap-2"
                        >
                          {isEmailSending ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
                          <span>{isEmailSending ? 'Send' : 'Email'}</span>
                        </button>
                      </div>
                      {emailError && <p className="text-[10px] text-red-400 font-bold uppercase tracking-widest text-left">{emailError}</p>}
                      {emailSent && <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest text-left">Email sent successfully!</p>}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <div className="pt-4 flex items-center justify-center space-x-4 text-[8px] font-bold uppercase tracking-[0.2em] text-gray-500">
              <div className="flex items-center space-x-1">
                <Shield size={10} />
                <span>Secure Transfer</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-700" />
              <div className="flex items-center space-x-1">
                <Award size={10} />
                <span>Certified Analysis</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="pt-16 border-t border-gray-100 text-center space-y-6">
          <div className="flex justify-center items-center space-x-8">
            <img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" alt="India" className="w-6 h-4 opacity-50 grayscale" referrerPolicy="no-referrer" />
            <div className="h-4 w-px bg-gray-200" />
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-300">Economic Times Financial Intelligence</span>
          </div>
          <p className="text-[8px] text-gray-400 max-w-2xl mx-auto leading-relaxed uppercase tracking-widest">
            Disclaimer: This report is generated using advanced AI models based on the data provided. It should be used for informational purposes only and does not constitute formal financial advice. Please consult with a certified financial planner for critical decisions.
          </p>
        </footer>
      </div>
    </div>
  </motion.div>
);
}
