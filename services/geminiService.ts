import { GoogleGenAI } from "@google/genai";
import { MonthData } from "../types";

export const analyzeFinances = async (currentMonth: MonthData) => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API Key not found");
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Calculate totals for context
    const totalIncome = Object.values(currentMonth.income).reduce((a, b) => a + b, 0);
    const totalExpenses = currentMonth.expenses.reduce((acc, curr) => acc + curr.amount, 0);
    
    const prompt = `
      Você é um consultor financeiro pessoal sênior. Analise os dados financeiros deste mês para uma família.
      
      Contexto:
      Mês: ${currentMonth.monthName} / ${currentMonth.year}
      Renda Total: R$ ${totalIncome.toFixed(2)}
      Despesa Total: R$ ${totalExpenses.toFixed(2)}
      Saldo: R$ ${(totalIncome - totalExpenses).toFixed(2)}
      
      Detalhamento de Renda:
      ${JSON.stringify(currentMonth.income, null, 2)}
      
      Detalhamento de Despesas:
      ${JSON.stringify(currentMonth.expenses, null, 2)}
      
      Por favor, forneça:
      1. Um breve resumo da saúde financeira (1 parágrafo).
      2. Uma análise da proporção entre Essencial, Desejo e Investimento (regra 50/30/20).
      3. 3 dicas práticas e acionáveis para melhorar no próximo mês.
      
      Responda em formato HTML simples (sem tags html/body, apenas p, ul, li, strong) para ser exibido dentro de uma div.
      Seja encorajador mas direto.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error analyzing finances:", error);
    return "<p>Não foi possível gerar a análise no momento. Verifique sua chave de API.</p>";
  }
};