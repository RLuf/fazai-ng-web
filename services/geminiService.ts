
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const MODEL_NAME = 'gemini-3-pro-preview';
const THINKING_BUDGET = 32768;

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  /**
   * Dispatches the task using Spark Logic with knowledge of local infrastructure
   */
  async dispatchTask(task: string): Promise<{ type: 'trigger' | 'direct', content: string }> {
    const prompt = `
      Voce e a INTELIGENCIA PURA (Spark) do ecossistema FazAI-NG.
      Seu ambiente:
      - Host: Xeon Biprocessado (Fedora).
      - LLM Local: Ollama (home.rogerluft.com.br:11434).
      - Embeddings: Ollama (1536 dim).
      - Orquestrador: Maestro (home.rogerluft.com.br:11430) c/ Phi-3 e Qdrant.
      - Socket: /tmp/fazai-spark.sock.

      OBJETIVO: Ser o DESPACHANTE DE ELITE.
      
      ORDEM: "${task}"
      
      DIRETRIZES:
      1. Se a ordem exigir acao no hardware, rede ou Qdrant, use: >>> MAESTRO_TRIGGER: [ordem]
      2. Se for analise ou explicacao, responda em Portugues ASCII.
      3. Voce conhece o CLI 'fazai'.
      
      Pense profundamente (Thinking Mode).
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

  async reflectOnContext(context: string, results: any[]): Promise<any> {
    const prompt = `
      Analise os dados do Qdrant (home.rogerluft.com.br:11430) para o contexto: ${context}
      RESULTADOS: ${JSON.stringify(results)}
      
      Responda em JSON:
      {
        "was_productive": boolean,
        "key_insight": "string ASCII",
        "should_continue": boolean,
        "next_action": "string",
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
      return { was_productive: false, key_insight: "Erro local", should_continue: false };
    }
  }
}

export const gemini = new GeminiService();
