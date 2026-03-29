import { useState, useEffect, useRef, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface AnayaChatProps {
  email?: string;
}

export default function AnayaChat({ email = 'guest@etmoney.com' }: AnayaChatProps) {
  const [sessionId] = useState(() => crypto.randomUUID?.() || Math.random().toString(36).substring(2));
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm Anaya. To build your personalized financial plan, we'll start with a quick profiling. It takes just 3-4 minutes and helps us tailor every recommendation to your goals. Ready to begin?",
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput('');
    setIsLoading(true);

    console.log('AnayaChat: Sending request to API', {
      chatInput: currentInput,
      sessionId,
      email: email,
    });

    try {
      let data;
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chatInput: currentInput,
            sessionId,
            email: email,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || 'Failed to get response');
        }

        data = await response.json();
      } catch (webhookError) {
        console.warn('AnayaChat: n8n Webhook failed, falling back to Gemini:', webhookError);
        
        // Smart Gemini Fallback - Can handle profiling and generate dashboard
        const genResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: [
            { text: `You are Anaya, a helpful AI Financial Buddy for Economic Times. 
            Your goal is to profile the user and eventually generate a financial plan.
            
            Current User Email: ${email}
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
            { text: `User Message: ${currentInput}` }
          ],
          config: {
            responseMimeType: "application/json",
          }
        });
        
        try {
          data = JSON.parse(genResponse.text);
        } catch (parseError) {
          console.error('AnayaChat: Gemini JSON Parse Error:', parseError);
          data = { bot_message: genResponse.text };
        }
      }
      
      console.log('AnayaChat: API response received', data);

      // Handle different possible response formats
      let botText = "I'm sorry, I couldn't process that.";
      
      if (typeof data === 'string') {
        botText = data;
      } else if (data && typeof data === 'object') {
        // Use the normalized bot_message from the server
        botText = data.bot_message || data.output || data.message || data.text || botText;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botText,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('AnayaChat: Error sending message', error);
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
    <div className="fixed bottom-0 right-6 z-50 flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[350px] sm:w-[400px] h-[500px] bg-white shadow-2xl flex flex-col overflow-hidden border-x border-t border-gray-100 rounded-none"
          >
            {/* Header */}
            <div className="bg-[#E21B23] p-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg leading-tight">Anaya</h3>
                <p className="text-xs text-white/80">Your Financial Assistant</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-none text-sm ${
                      msg.sender === 'user'
                        ? 'bg-[#E21B23] text-white'
                        : 'bg-white text-gray-800 shadow-sm border border-gray-100'
                    }`}
                  >
                    {msg.text}
                    
                    {/* Special Progress Bar for Plan Generation */}
                    {msg.sender === 'bot' && (msg.text.toLowerCase().includes('generating your financial plan') || msg.text.toLowerCase().includes('building your plan')) && (
                      <div className="mt-3 space-y-1.5">
                        <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden relative">
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
                        </div>
                        <p className="text-[9px] text-et-red font-bold uppercase tracking-widest animate-pulse">Building Plan...</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white px-3 py-1.5 rounded-full shadow-sm border border-gray-100 flex items-center space-x-2">
                    <Loader2 className="animate-spin text-et-red" size={12} />
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about stocks, mutual funds..."
                disabled={isLoading}
                className="flex-1 bg-gray-100 border-none rounded-none px-4 py-2 text-sm focus:ring-2 focus:ring-[#E21B23] outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="bg-[#E21B23] text-white p-2 rounded-none hover:bg-[#c4161d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#E21B23] text-white flex items-center gap-2 px-4 py-3 rounded-none shadow-lg hover:bg-[#c4161d] transition-all group mb-0"
      >
        <MessageCircle size={24} className={isOpen ? 'hidden' : 'block'} />
        <X size={24} className={isOpen ? 'block' : 'hidden'} />
        <span className="font-medium">Ask Anaya</span>
      </motion.button>
    </div>
  );
}
