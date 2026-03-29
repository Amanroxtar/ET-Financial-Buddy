
import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  ShieldCheck, 
  Wallet, 
  PiggyBank, 
  LogOut, 
  PlusCircle, 
  ArrowRight,
  Bell
} from 'lucide-react';
import { DashboardData } from '../types/dashboard';
import FinancialDashboard from './FinancialDashboard';

interface DashboardProps {
  userEmail: string;
  fullName: string;
  onLogout: () => void;
  onGeneratePlan: () => void;
  dashboardData: DashboardData | null;
  onShowReport: (data: any) => void;
  reportData: any;
}

export default function Dashboard({ userEmail, fullName, onLogout, onGeneratePlan, dashboardData, onShowReport, reportData }: DashboardProps) {
  const hasPlans = !!dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-et-dark">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-4 md:px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center space-x-2">
          <div className="bg-et-red text-white p-1.5 rounded-lg">
            <TrendingUp size={20} />
          </div>
          <span className="font-serif font-bold text-xl tracking-tight">ET Money Mentor</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-et-red transition-colors">
            <Bell size={20} />
          </button>
          <div className="h-8 w-px bg-gray-200 mx-2"></div>
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold leading-none">{fullName}</p>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">{userEmail}</p>
            </div>
            <div className="w-10 h-10 bg-et-red rounded-full flex items-center justify-center border border-et-red/10 shadow-sm">
              <span className="text-white font-bold text-lg">{fullName.charAt(0).toUpperCase()}</span>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="p-2 text-gray-400 hover:text-et-red transition-colors"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Personalized Greeting */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-et-dark leading-tight">
            Hi {fullName.split(' ')[0]},
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Welcome to your Economic Times Financial Intelligence dashboard!
          </p>
        </motion.div>

        {!hasPlans ? (
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full"
          >
            <div className="bg-white border border-gray-300 rounded-none p-12 md:p-20 text-center space-y-8 w-full shadow-sm">
              <div className="w-24 h-24 bg-gray-50 rounded-none flex items-center justify-center mx-auto border border-gray-100">
                <PlusCircle className="text-gray-300" size={48} />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-serif font-bold text-gray-800 uppercase tracking-tight">No plans generated yet</h2>
                <p className="text-gray-500 text-lg max-w-md mx-auto leading-relaxed">
                  Your personalized financial roadmap is waiting. Talk to our AI assistant to build your first plan.
                </p>
              </div>
              <button 
                onClick={onGeneratePlan}
                className="bg-et-red hover:bg-red-700 text-white px-12 py-5 rounded-none font-bold text-sm uppercase tracking-widest shadow-xl shadow-red-900/10 transition-all hover:scale-[1.02] active:scale-95"
              >
                Start Profiling Now
              </button>
            </div>
          </motion.section>
        ) : (
          <FinancialDashboard 
            data={dashboardData!} 
            onShowReport={onShowReport} 
            reportData={reportData}
          />
        )}
      </main>

      <footer className="max-w-7xl mx-auto p-8 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em]">
          Economic Times Financial Intelligence • Secure & Encrypted
        </p>
      </footer>
    </div>
  );
}
