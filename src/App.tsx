import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { getCurrentUser, logout } from './services/auth';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ResetPassword from './components/ResetPassword';
import Chat from './components/Chat';
import DetailedReport from './components/DetailedReport';
import { Loader2 } from 'lucide-react';
import { DashboardData } from './types/dashboard';

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'AUTH' | 'DASHBOARD' | 'RESET_PASSWORD' | 'CHAT' | 'REPORT'>('AUTH');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [autoStartProfiling, setAutoStartProfiling] = useState(false);

  // Reset autoStartProfiling when leaving CHAT view
  useEffect(() => {
    if (view !== 'CHAT') {
      setAutoStartProfiling(false);
    }
  }, [view]);

  useEffect(() => {
    console.log('App: Initializing session check');
    
    // Check if we are on the reset password path
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    if (path === '/reset-password' || (hash && hash.includes('type=recovery'))) {
      console.log('App: Reset password route detected');
      setView('RESET_PASSWORD');
    }

    // Check active session on load
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('App: Initial session', session);
        setSession(session);
        
        if (session) {
          const user = await getCurrentUser();
          if (user) {
            // Only set to DASHBOARD if we are currently at AUTH
            // Use functional update to avoid dependency on 'view'
            setView(prev => prev === 'AUTH' ? 'DASHBOARD' : prev);
          } else {
            console.warn('App: Session exists but user fetch failed, clearing session');
            setSession(null);
            setView('AUTH');
          }
        }
      } catch (err) {
        console.error('App: Session initialization error', err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('App: Auth state changed', event, session);
      setSession(session);
      
      if (event === 'PASSWORD_RECOVERY') {
        setView('RESET_PASSWORD');
      } else if (event === 'SIGNED_IN') {
        // Only redirect to dashboard if we are currently on the AUTH screen
        // This prevents jumping back from CHAT or other views
        setView(currentView => {
          if (currentView === 'AUTH') return 'DASHBOARD';
          return currentView;
        });
      } else if (event === 'SIGNED_OUT') {
        setView('AUTH');
      }
    });

    return () => subscription.unsubscribe();
  }, []); // Remove [view] dependency to prevent re-running on every view change

  const handleLogout = async () => {
    try {
      await logout();
      setSession(null);
      setView('AUTH');
    } catch (err) {
      console.error('App: Logout failed', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="animate-spin text-et-red" size={48} />
          <span className="text-et-red font-bold uppercase tracking-widest text-xs">
            ET Money Mentor
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans antialiased">
      {view === 'RESET_PASSWORD' ? (
        <ResetPassword 
          onSuccess={() => {
            window.history.replaceState({}, document.title, "/");
            setView('AUTH');
          }}
          onBack={() => {
            window.history.replaceState({}, document.title, "/");
            setView('AUTH');
          }}
        />
      ) : view === 'CHAT' ? (
        <Chat 
          onBack={() => {
            setAutoStartProfiling(false);
            setView('DASHBOARD');
          }} 
          userEmail={session?.user?.email}
          fullName={session?.user?.user_metadata?.full_name || 'Guest User'}
          onDataUpdate={setDashboardData}
          initialData={dashboardData}
          autoStartProfiling={autoStartProfiling}
          onShowReport={(data) => {
            setReportData(data);
            setView('REPORT');
          }}
          reportData={reportData}
        />
      ) : view === 'REPORT' ? (
        <DetailedReport 
          report={reportData} 
          onBack={() => setView('DASHBOARD')} 
        />
      ) : view === 'DASHBOARD' ? (
        <Dashboard 
          userEmail={session?.user?.email || 'guest@etmoney.com'} 
          fullName={session?.user?.user_metadata?.full_name || 'Guest User'}
          onLogout={handleLogout} 
          onGeneratePlan={() => {
            setAutoStartProfiling(true);
            setView('CHAT');
          }}
          dashboardData={dashboardData}
          onShowReport={(data) => {
            setReportData(data);
            setView('REPORT');
          }}
          reportData={reportData}
        />
      ) : (
        <Auth 
          onAuthSuccess={() => setView('DASHBOARD')} 
        />
      )}
    </div>
  );
}
