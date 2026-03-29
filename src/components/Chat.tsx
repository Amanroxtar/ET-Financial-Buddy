import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Loader2, User, Bot, ArrowLeft, LayoutDashboard, MessageSquare } from 'lucide-react';
import FinancialDashboard from './FinancialDashboard';
import { DashboardData } from '../types/dashboard';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface ChatProps {
  onBack: () => void;
  userEmail?: string;
  fullName?: string;
  onDataUpdate?: (data: DashboardData) => void;
  initialData?: DashboardData | null;
  autoStartProfiling?: boolean;
  onShowReport?: (data: any) => void;
  reportData?: any;
}

export default function Chat({ 
  onBack, 
  userEmail = "niharikabhatia62@gmail.com", 
  fullName = "Guest User",
  onDataUpdate, 
  initialData,
  autoStartProfiling = false,
  onShowReport,
  reportData
}: ChatProps) {
  const [sessionId] = useState(() => crypto.randomUUID?.() || Math.random().toString(36).substring(2));
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Welcome! To build your personalized financial plan, we'll start with a quick profiling. It takes just 3-4 minutes and helps us tailor every recommendation to your specific goals. Ready to begin?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(initialData || null);
  const [view, setView] = useState<'chat' | 'dashboard'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasAutoStarted = useRef(false);

  // Sync internal state with prop if it changes
  useEffect(() => {
    if (initialData) {
      setDashboardData(initialData);
    }
  }, [initialData]);

  // Auto-start profiling if requested
  useEffect(() => {
    if (autoStartProfiling && messages.length === 1 && !isLoading && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      handleSend(undefined, "I'm ready to start my profiling!");
    }
  }, [autoStartProfiling, messages.length, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e?: FormEvent, overrideText?: string) => {
    e?.preventDefault();
    const messageText = overrideText || input;
    if (!messageText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!overrideText) setInput('');
    setIsLoading(true);

    try {
      let data;
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            chatInput: messageText,
            sessionId,
            email: userEmail
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to get response');
        }

        data = await response.json();
      } catch (webhookError) {
        console.warn('n8n Webhook failed, falling back to Gemini:', webhookError);
        
        // Smart Gemini Fallback - Can handle profiling and generate dashboard
        const genResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            { text: `You are Anaya, a helpful AI Financial Buddy for Economic Times. 
            Your goal is to profile the user and eventually generate a financial plan.
            
            Current User Email: ${userEmail}
            Current Session ID: ${sessionId}
            
            INSTRUCTIONS:
            1. If the user is starting profiling, ask them about their age, monthly income, current savings, and primary financial goals (e.g., retirement, buying a home, child's education).
            2. Be conversational. Ask one or two questions at a time.
            3. Once you have enough information (Age, Income, Savings, Goals), you MUST generate a complete financial plan.
            4. To generate the plan, your response MUST be a JSON object following this schema:
            {
              "bot_message": "A friendly message explaining that the plan is ready.",
              "user_summary": {
                "name": "string",
                "age": "string",
                "occupation": "string",
                "income": "string",
                "expenses": "string",
                "savings": "string",
                "risk_profile": "string",
                "goals": "string"
              },
              "health_score": 0-100 (number),
              "status": "string (e.g. Good, Average, Poor)",
              "financial_breakdown": {
                "savings_score": { "score": 0-100, "link": "https://www.etmoney.com/mutual-funds/equity/elss/38" },
                "investment_diversification_score": { "score": 0-100, "link": "https://www.etmoney.com/mutual-funds" },
                "retirement_rediness_score": { "score": 0-100, "link": "https://www.etmoney.com/nps" },
                "insurance_coverage_score": { "score": 0-100, "link": "https://www.etmoney.com/health-insurance" },
                "debt_health_score": { "score": 0-100, "link": "https://www.etmoney.com/credit-score" },
                "emergency_preparedness_score": { "score": 0-100, "link": "https://www.etmoney.com/fixed-deposit" }
              },
              "strengths": ["string"],
              "weaknesses": ["string"],
              "risks": ["string"],
              "insights": ["string"],
              "suggestions": ["string"],
              "recommendations": [
                { "type": "string", "action": "string", "priority": "High|Medium|Low", "link": "string" }
              ],
              "ideal_vs_current": [
                { "category": "string", "current": "string", "ideal": "string" }
              ],
              "monthly_plan": {
                "recommended_sip": "string",
                "emergency_fund_target": "string",
                "insurance_gap": "string"
              }
            }
            5. If you are not ready to generate the plan, return a JSON object with only the "bot_message" field.
            6. ALWAYS return valid JSON. Do not include markdown formatting like \`\`\`json.` },
            { text: `User Message: ${messageText}` }
          ],
          config: {
            responseMimeType: "application/json",
          }
        });
        
        try {
          data = JSON.parse(genResponse.text);
        } catch (parseError) {
          console.error('Gemini JSON Parse Error:', parseError);
          data = { bot_message: genResponse.text };
        }
      }
      
      // Handle different possible response formats
      let botText = "I'm sorry, I couldn't process that.";
      let potentialDashboard: DashboardData | null = null;
      
      const processItem = (item: any) => {
        if (item.bot_message || item.output || item.message || item.text) {
          botText = item.bot_message || item.output || item.message || item.text;
        }
        
        // Check if the item contains dashboard data
        if (item.user_summary && item.health_score !== undefined && item.financial_breakdown) {
          potentialDashboard = {
            user_summary: item.user_summary,
            health_score: item.health_score,
            status: item.status || 'Average',
            financial_breakdown: item.financial_breakdown,
            strengths: item.strengths || [],
            weaknesses: item.weaknesses || [],
            risks: item.risks || [],
            insights: item.insights || [],
            suggestions: item.suggestions || [],
            recommendations: item.recommendations || [],
            ideal_vs_current: item.ideal_vs_current || [],
            monthly_plan: item.monthly_plan || { recommended_sip: '₹0', emergency_fund_target: '₹0', insurance_gap: '₹0' }
          };
        } else if (item.dashboard) {
          potentialDashboard = item.dashboard;
        }
      };

      if (typeof data === 'string') {
        botText = data;
      } else if (Array.isArray(data) && data.length > 0) {
        processItem(data[0]);
      } else if (data && typeof data === 'object') {
        processItem(data);
      }

      if (potentialDashboard) {
        setDashboardData(potentialDashboard);
        onDataUpdate?.(potentialDashboard);
        setView('dashboard');
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting right now. Please try again later.",
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Panel - Branding (25%) */}
      <div className={`${view === 'dashboard' ? 'hidden' : 'hidden lg:flex lg:w-1/4'} bg-et-gray border-r border-gray-200 p-8 flex-col justify-between`}>
        <div>
          <button 
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-500 hover:text-et-red transition-colors mb-12 font-bold text-sm"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="space-y-6">
            <span className="inline-block bg-et-red text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
              Invest Smarter with AI
            </span>
            <h1 className="text-4xl font-serif font-bold text-et-dark leading-tight">
              Your AI Financial Buddy
            </h1>
            <p className="text-gray-600 leading-relaxed">
              Plan smarter, invest better, and secure your future with AI-powered financial guidance tailored just for you.
            </p>
          </div>
        </div>
        
        <div className="pt-8 border-t border-gray-300">
          <img 
            src="https://economictimes.indiatimes.com/photo/msid-74451948,quality-100/et-logo.jpg" 
            alt="ET Logo" 
            className="h-8 opacity-50 grayscale"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>

      {/* Right Panel - Chat (75% or 100%) */}
      <div className={`${view === 'dashboard' ? 'w-full' : 'w-full lg:w-3/4'} flex flex-col relative`}>
        {/* Mobile Header / Dashboard Header */}
        <div className="bg-white border-b border-gray-200 p-4 grid grid-cols-3 items-center">
          <div className="flex items-center">
            <button onClick={view === 'dashboard' ? () => setView('chat') : onBack} className="text-et-dark flex items-center space-x-2">
              <ArrowLeft size={24} />
              {view === 'dashboard' && <span className="hidden sm:inline text-sm font-bold uppercase tracking-widest">Back to Chat</span>}
            </button>
          </div>
          
          <div className="text-center">
            <span className="font-serif font-bold text-lg whitespace-nowrap">
              {view === 'chat' ? 'AI Financial Buddy' : `${fullName}'s Financial Dashboard`}
            </span>
          </div>

          <div className="flex justify-end">
            {dashboardData && view === 'chat' && (
              <button 
                onClick={() => setView('dashboard')}
                className="text-et-red"
              >
                <LayoutDashboard size={24} />
              </button>
            )}
          </div>
        </div>

        {/* View Toggle (Desktop) - Hidden in Dashboard View */}
        {dashboardData && view === 'chat' && (
          <div className="hidden lg:flex justify-center p-4 bg-white border-b border-gray-100 space-x-4">
            <button
              onClick={() => setView('chat')}
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all flex items-center space-x-2 ${
                view === 'chat' ? 'bg-et-red text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <MessageSquare size={14} />
              <span>Chat Assistant</span>
            </button>
            <button
              onClick={() => setView('dashboard')}
              className={`px-6 py-2 rounded-full font-bold text-xs uppercase tracking-widest transition-all flex items-center space-x-2 ${
                view === 'dashboard' ? 'bg-et-red text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <LayoutDashboard size={14} />
              <span>Financial Dashboard</span>
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative bg-gray-50/30">
          <AnimatePresence mode="wait">
            {view === 'chat' ? (
              <motion.div
                key="chat-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 md:p-8 space-y-6"
              >
                <AnimatePresence initial={false}>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end space-x-2`}>
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          msg.sender === 'user' ? 'bg-et-red text-white ml-2' : 'bg-et-dark text-white mr-2'
                        }`}>
                          {msg.sender === 'user' ? (
                            <span className="text-xs font-bold">{fullName.charAt(0).toUpperCase()}</span>
                          ) : (
                            <Bot size={16} />
                          )}
                        </div>
                        
                        <div className={`p-4 rounded-none shadow-sm ${
                          msg.sender === 'user' 
                            ? 'bg-et-red text-white rounded-br-none' 
                            : 'bg-white text-et-dark border border-gray-100 rounded-bl-none'
                        }`}>
                          <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          
                          {/* Special Progress Bar for Plan Generation */}
                          {msg.sender === 'bot' && (msg.text.toLowerCase().includes('generating your financial plan') || msg.text.toLowerCase().includes('building your plan')) && (
                            <div className="mt-4 space-y-2">
                              <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden relative">
                                <motion.div 
                                  className="absolute top-0 left-0 h-full bg-et-red"
                                  initial={{ width: "0%" }}
                                  animate={{ width: "100%" }}
                                  transition={{ 
                                    duration: 5, 
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                  }}
                                />
                                <motion.div 
                                  className="absolute top-0 left-0 h-full w-20 bg-white/40 blur-sm"
                                  animate={{ left: ["-20%", "120%"] }}
                                  transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity,
                                    ease: "linear"
                                  }}
                                />
                              </div>
                              <p className="text-[10px] text-et-red font-bold uppercase tracking-widest animate-pulse">Processing Market Data...</p>
                            </div>
                          )}

                          <span className={`text-[10px] mt-2 block opacity-50 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
                      <Loader2 className="animate-spin text-et-red" size={14} />
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Thinking...</span>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white min-h-full"
              >
                {dashboardData && (
                  <FinancialDashboard 
                    data={dashboardData} 
                    onShowReport={onShowReport || (() => {})} 
                    reportData={reportData}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Input Area - Hidden in Dashboard View */}
        {view === 'chat' && (
          <div className="p-4 md:p-6 bg-white border-t border-gray-100 transition-all">
            <form 
              onSubmit={handleSend}
              className="max-w-4xl mx-auto relative flex items-center"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your input"
                disabled={isLoading}
                className="w-full bg-gray-50 border border-gray-200 rounded-none px-6 py-4 pr-16 focus:outline-none focus:ring-2 focus:ring-et-red/20 focus:border-et-red transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="absolute right-2 p-3 bg-et-red text-white rounded-none hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:hover:bg-et-red"
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </button>
            </form>
            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">
              AI-powered financial guidance • Powered by ET Money Mentor
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
