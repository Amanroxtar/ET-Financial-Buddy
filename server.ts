import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function startServer() {
  const app = express();
  const PORT = 8080;

  app.use(express.json());

  // API Routes
  app.post('/api/chat', async (req, res) => {
    const { chatInput, sessionId, email } = req.body;
    
    console.log('Proxying chat message to n8n:', { chatInput, sessionId, email });

    try {
      const n8nResponse = await fetch('https://nik0018.app.n8n.cloud/webhook/878665de-dd47-440f-85a3-a27513c5ef65/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatInput, sessionId, email }),
      });

      if (!n8nResponse.ok) {
        const errorText = await n8nResponse.text();
        console.warn('n8n Webhook Error, falling back to Gemini on server:', n8nResponse.status, errorText);
        
        // Server-side Gemini Fallback
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
            { text: `User Message: ${chatInput}` }
          ],
          config: {
            responseMimeType: "application/json",
          }
        });

        try {
          const data = JSON.parse(genResponse.text);
          return res.json(data);
        } catch (parseError) {
          console.error('Server Gemini JSON Parse Error:', parseError);
          return res.json({ bot_message: genResponse.text });
        }
      }

      const data = await n8nResponse.json();
      console.log('n8n Response received:', data);
      res.json(data);
    } catch (error) {
      console.error('Server Proxy Error, falling back to Gemini:', error);
      
      // Final fallback if even fetch fails
      try {
        const genResponse = await ai.models.generateContent({
          model: "gemini-3-flash-preview",
          contents: `You are Anaya, a helpful AI Financial Buddy for Economic Times. Provide expert financial guidance. User Message: ${chatInput}`,
        });
        return res.json({ bot_message: genResponse.text });
      } catch (geminiError) {
        console.error('Final Gemini Fallback Error:', geminiError);
        res.status(500).json({ error: 'Internal server error while proxying request' });
      }
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
