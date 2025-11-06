import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Transaction } from '../types';

let chat: Chat | null = null;

const getAiInstance = () => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set.");
    }
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

const getFinancialInsights = async (transactions: Transaction[]): Promise<string> => {
    const ai = getAiInstance();
    const simplifiedData = transactions.map(t => ({
        fecha: t.date.toISOString().split('T')[0],
        tipo: t.income > 0 ? 'ingreso' : 'gasto',
        categoria: t.category,
        monto: t.income > 0 ? t.income : t.expense
    }));
    
    const prompt = `
Eres un experto analista financiero. Analiza los siguientes datos de transacciones (en formato JSON simplificado) de un usuario y proporciona un informe conciso en español y en formato Markdown.

El informe debe incluir:
1.  **Resumen General:** Una breve descripción de la salud financiera general basada en los datos (ingresos vs. gastos, balance neto).
2.  **Insights Clave:** 3 a 5 puntos destacados y fáciles de entender sobre patrones de gasto, las categorías más significativas, o tendencias a lo largo del tiempo.
3.  **Recomendaciones Accionables:** 3 a 5 consejos prácticos y realistas para que el usuario pueda optimizar sus gastos, aumentar sus ahorros o mejorar su gestión financiera.

Sé amigable, alentador y profesional en tu tono.

Datos de Transacciones:
${JSON.stringify(simplifiedData.slice(0, 500), null, 2)}
`; // Slice to prevent exceeding token limits on very large files

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("No se pudieron generar los insights. Por favor, inténtalo de nuevo.");
    }
};

const startChat = (transactions: Transaction[]) => {
    const ai = getAiInstance();
    const simplifiedData = transactions.map(t => ({
        fecha: t.date.toISOString().split('T')[0],
        tipo: t.income > 0 ? 'ingreso' : 'gasto',
        categoria: t.category,
        monto: t.income > 0 ? t.income : t.expense
    }));

    const systemInstruction = `Eres un asistente financiero amigable y experto llamado 'FinancIA'. Tu propósito es responder preguntas del usuario basándote únicamente en los siguientes datos de transacciones. Sé conciso, claro y utiliza los datos para respaldar tus respuestas. No inventes información. Responde siempre en español. \n\nDATOS DE TRANSACCIONES:\n${JSON.stringify(simplifiedData.slice(0, 500), null, 2)}`;
    
    chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction,
        },
    });
};

const getChatResponse = async (message: string): Promise<string> => {
    if (!chat) {
        throw new Error("El chat no ha sido inicializado. Llama a startChat primero.");
    }
    try {
        const result: GenerateContentResponse = await chat.sendMessage({ message });
        return result.text;
    } catch (error) {
        console.error("Error sending chat message:", error);
        throw new Error("No se pudo obtener una respuesta del asistente.");
    }
};

export { getFinancialInsights, startChat, getChatResponse };