import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // API Routes
  app.post('/api/chat', async (req, res) => {
    const { chatInput, sessionId, email } = req.body;
    
    console.log('Proxying chat message to n8n:', { chatInput, sessionId, email });

    try {
      const webhookUrl = 'https://amangg1234.app.n8n.cloud/webhook/d4609656-aedd-4f6e-bdf4-f1b3348a12f5';
      console.log(`Sending POST request to: ${webhookUrl}`);
      
      const n8nResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          chatInput, 
          sessionId, 
          email,
          timestamp: new Date().toISOString()
        }),
      });

      console.log(`n8n Response Status: ${n8nResponse.status} ${n8nResponse.statusText}`);
      const responseText = await n8nResponse.text();
      console.log('n8n Raw Response:', responseText);
      
      if (!n8nResponse.ok) {
        console.warn('n8n Webhook Error, falling back to Gemini on server:', n8nResponse.status, responseText);
        
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

      if (!responseText) {
        throw new Error('Empty response from n8n');
      }

      try {
        const data = JSON.parse(responseText);
        console.log('n8n Response received:', data);
        
        // Normalize n8n response (often returns an array)
        let result = Array.isArray(data) ? data[0] : data;
        
        // Ensure bot_message is present for the frontend
        if (result && typeof result === 'object') {
          if (!result.bot_message) {
            result.bot_message = result.output || result.message || result.text || "Response received";
          }
        } else {
          // If result is not an object, wrap it
          result = { bot_message: String(result) };
        }
        
        res.json(result);
      } catch (jsonError) {
        console.warn('n8n Response is not JSON, sending as bot_message:', responseText);
        res.json({ bot_message: responseText });
      }
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
