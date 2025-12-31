
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const MODEL_NAME = 'gemini-3-pro-preview';
const THINKING_BUDGET = 32768;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Dispatches the task using Spark Logic
   */
  async dispatchTask(task: string): Promise<{ type: 'trigger' | 'direct', content: string }> {
    const prompt = `
      Voce e a INTELIGENCIA PURA (Spark) conectada ao socket do FazAI.
      Seu objetivo e ser o DESPACHANTE DE ELITE.
      
      ORDEM RECEBIDA: "${task}"
      
      DIRETRIZES:
      1. Se a ordem exigir alteracao no sistema (criar arquivo, instalar, monitorar, redes), repasse para o MAESTRO.
         -> Saida: >>> MAESTRO_TRIGGER: [ordem normalizada]
      2. Se for consulta de conhecimento, analise de texto ou duvida, responda diretamente em Portugues ASCII.
      
      Pense profundamente (Thinking Mode ativo).
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: THINKING_BUDGET }
        },
      });

      const text = response.text || "";
      if (text.includes('>>> MAESTRO_TRIGGER:')) {
        return { type: 'trigger', content: text.split('>>> MAESTRO_TRIGGER:')[1].trim() };
      }
      return { type: 'direct', content: text };
    } catch (error) {
      console.error("Gemini Dispatch Error:", error);
      throw error;
    }
  }

  /**
   * Runs an agentic loop simulation (Search -> Reflect -> Generate)
   */
  async reflectOnContext(context: string, results: any[]): Promise<any> {
    const prompt = `
      Voce e o sistema de reflexao agentico do FazAI. 
      Analise os resultados do Qdrant e o contexto atual.
      
      CONTEXTO: ${context}
      RESULTADOS: ${JSON.stringify(results)}
      
      Responda estritamente em JSON:
      {
        "was_productive": boolean,
        "key_insight": "insight principal em Portugues ASCII",
        "should_continue": boolean,
        "next_action": "proxima acao recomendada",
        "confidence": 0.0-1.0
      }
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          thinkingConfig: { thinkingBudget: THINKING_BUDGET },
          responseMimeType: "application/json"
        },
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Gemini Reflection Error:", error);
      return { was_productive: false, key_insight: "Erro na reflexao", should_continue: false };
    }
  }
}

export const gemini = new GeminiService();
