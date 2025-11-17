import { GoogleGenAI, Type } from '@google/genai';
import type { User, Feedback } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. AI features will not work.");
}
const ai = new GoogleGenAI({ apiKey: API_KEY });

// Define a simple chat history type
type ChatMessage = {
    role: 'user' | 'model';
    parts: string;
};

export const geminiService = {
  suggestPeers: async (currentUser: User, allUsers: User[]): Promise<string[]> => {
    if (!API_KEY) return Promise.resolve([allUsers[2].name, allUsers[3].name, allUsers[4].name]); // Mock data
    
    const otherUsers = allUsers.filter(u => u.id !== currentUser.id)
      .map(({ name, department }) => ({ name, department }));

    const prompt = `
      From the following list of employees, suggest 3-5 relevant peers for ${currentUser.name} who is in the ${currentUser.department} department. Prioritize colleagues from the same or adjacent departments.
      Employee list: ${JSON.stringify(otherUsers)}
      Return the answer as a JSON array of strings, where each string is just the employee's name.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
            }
        }
      });
      const resultText = response.text.trim();
      return JSON.parse(resultText);
    } catch (error) {
      console.error('Error suggesting peers:', error);
      return [];
    }
  },

  rephraseTone: async (text: string): Promise<string> => {
    if (!API_KEY) {
        if (text.toLowerCase().includes('bad') || text.toLowerCase().includes('terrible')) {
            return Promise.resolve(`Instead of saying "${text}", you could try: "There's an opportunity for improvement in this area. For example..." (AI suggestion)`);
        }
        return Promise.resolve('');
    }
    
    if (text.trim().length < 15) { // Don't run on very short text
        return Promise.resolve('');
    }

    const prompt = `
      Analyze the tone of the following feedback meant for a peer.
      If the tone is perceived as overly negative, harsh, or not constructive, provide a single, rephrased alternative that is more positive and helpful.
      If the original feedback is already constructive and positive, or is neutral, respond with just the word "OK".
      Do not include explanations.

      Original feedback: "${text}"
      
      Response:
    `;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        const result = response.text.trim();
        return result === 'OK' ? '' : result;
    } catch (error) {
        console.error('Error rephrasing tone:', error);
        return '';
    }
  },

  summarizeFeedback: async (feedbackArray: Feedback[], userName: string): Promise<{ strengths: string; growth: string; themes: string[] }> => {
     if (!API_KEY || feedbackArray.length === 0) return Promise.resolve({
        strengths: "AI Summary: Excels in collaboration and project leadership.",
        growth: "AI Summary: Could focus more on detail-oriented QA before final delivery.",
        themes: ["Collaboration", "Leadership", "Quality Assurance"]
     });

    const feedbackForPrompt = feedbackArray.map(f => ({
      strengths: `Situation: ${f.strengths.situation}. Behavior: ${f.strengths.behavior}. Impact: ${f.strengths.impact}.`,
      growthOpportunities: `Situation: ${f.growthOpportunities.situation}. Behavior: ${f.growthOpportunities.behavior}. Impact: ${f.growthOpportunities.impact}.`,
      vibeComment: f.vibeComment
    }));

    const prompt = `
      Summarize the following peer feedback for ${userName}.
      Analyze the strengths and growth opportunities provided by their peers. The feedback is in Situation-Behavior-Impact format.
      Identify 3-5 key themes that emerge from the comments.
      Feedback data: ${JSON.stringify(feedbackForPrompt)}
      
      Return the result as a JSON object with three keys: "strengths", "growth", and "themes" (an array of strings).
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    strengths: { type: Type.STRING },
                    growth: { type: Type.STRING },
                    themes: { type: Type.ARRAY, items: {type: Type.STRING} }
                }
            }
        }
      });
      const resultText = response.text.trim();
      return JSON.parse(resultText);
    } catch (error) {
      console.error('Error summarizing feedback:', error);
      return { strengths: '', growth: '', themes: [] };
    }
  },

  getAdminAdvice: async (metrics: object): Promise<string> => {
    if (!API_KEY) return Promise.resolve("AI Advisor: Participation is strong in Engineering. Consider running a workshop on constructive feedback for the Design department to boost their engagement and vibe scores.");

    const prompt = `
      As an expert HR advisor for a tech company, analyze the following quarterly peer review metrics.
      Metrics: ${JSON.stringify(metrics)}
      
      Provide 2-3 actionable, concise, and strategic recommendations to improve team culture, performance, and retention.
      Format the response as a single block of Markdown text.
    `;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt
      });
      return response.text.trim();
    } catch (error) {
      console.error('Error getting admin advice:', error);
      return 'Could not retrieve AI-powered advice at this time.';
    }
  },
  
  getFeedbackThemes: async (feedbackArray: Feedback[]): Promise<string[]> => {
    if (!API_KEY || feedbackArray.length === 0) return Promise.resolve(['collaboration', 'communication', 'leadership', 'innovation', 'mentorship']);
    
    const feedbackForPrompt = feedbackArray.map(f => ({
        strengths: `Situation: ${f.strengths.situation}. Behavior: ${f.strengths.behavior}. Impact: ${f.strengths.impact}.`,
        growthOpportunities: `Situation: ${f.growthOpportunities.situation}. Behavior: ${f.growthOpportunities.behavior}. Impact: ${f.growthOpportunities.impact}.`
    }));

    const prompt = `
      From the following collection of peer feedback, identify the 5-7 most common themes.
      Feedback data: ${JSON.stringify(feedbackForPrompt)}
      Return a JSON array of strings.
    `;
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
        });
        return JSON.parse(response.text.trim());
    } catch (error) {
        console.error('Error getting feedback themes:', error);
        return [];
    }
  },
  
  getFeedbackCoachAdvice: async (history: ChatMessage[]): Promise<string> => {
      if (!API_KEY) return Promise.resolve("I'm here to help! To give great feedback, try using the Situation-Behavior-Impact (SBI) model. For example, 'In yesterday's meeting (Situation), you presented the data very clearly (Behavior), which helped us make a quick decision (Impact).'");
      
      const chat = ai.chats.create({
          model: 'gemini-2.5-flash',
          config: {
              systemInstruction: `You are a helpful and friendly AI coach specializing in corporate peer feedback. Your goal is to provide concise, actionable advice to employees on how to write and receive feedback constructively. You are an expert in models like SBI (Situation-Behavior-Impact). Keep your answers brief and encouraging.`
          }
      });
      
      try {
          const lastMessage = history[history.length - 1];
          const result = await chat.sendMessage({ message: lastMessage.parts });
          return result.text.trim();
      } catch (error) {
          console.error('Error getting feedback coach advice:', error);
          return "I'm having a little trouble thinking right now. Please try again in a moment.";
      }
  }
};