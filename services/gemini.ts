import { GoogleGenAI } from "@google/genai";
import { addLead } from "./storage";

// Simple "RAG" Knowledge Base
const LEGAL_KNOWLEDGE = [
  {
    topic: "Контактная информация",
    content: "Адвокат Горбунов К.Э. принимает в офисе по адресу: г. Калининград, ул. Октябрьская, д. 8, оф. 502 (Специальный административный район Остров Октябрьский). Телефон: +7 (909) 776-88-59. Email: kgorbunov@exitumlaw.ru."
  },
  {
    topic: "Образование и статус",
    content: "Константин Горбунов окончил Военный Университет Министерства Обороны РФ в 2004 году с отличием. Является адвокатом филиала Московской специализированной коллегии адвокатов «Экзитум»."
  },
  {
    topic: "Дефолт по облигациям",
    content: "При техническом дефолте эмитенту дается 10 дней на исполнение обязательств. Мы занимаемся взысканием номинала облигаций и купонного дохода, а также представляем интересы групп владельцев облигаций (коллективные иски)."
  },
  {
    topic: "Банкротство и субсидиарная ответственность",
    content: "Мы сопровождаем процедуры банкротства: включение в реестр требований кредиторов (РТК), оспаривание сделок должника, привлечение бенефициаров к субсидиарной ответственности."
  },
  {
    topic: "Юридическое инвестирование",
    content: "Мы предлагаем формат работы 'Юридическое инвестирование': взыскание денежных средств за процент от реально полученного (Success Fee). Клиент не несет расходов на старте."
  },
  {
    topic: "Услуги",
    content: "Основные практики: корпоративные споры, банкротство эмитентов, споры по облигациям, защита частного капитала, анализ рисков (Due Diligence)."
  }
];

const findRelevantContext = (query: string): string => {
  const lowerQuery = query.toLowerCase();
  const relevantChunks = LEGAL_KNOWLEDGE.filter(chunk => 
    lowerQuery.includes(chunk.topic.toLowerCase()) || 
    chunk.content.toLowerCase().split(' ').some(word => word.length > 4 && lowerQuery.includes(word))
  );
  
  if (relevantChunks.length === 0) return "";
  
  return `ИСПОЛЬЗУЙ ЭТУ ИНФОРМАЦИЮ ИЗ БАЗЫ ЗНАНИЙ ДЛЯ ОТВЕТА:\n${relevantChunks.map(c => c.content).join('\n---\n')}\n`;
};

// Heuristic to detect phone numbers in Russian format
const extractPhone = (text: string): string | null => {
  const phoneRegex = /(\+7|8)[\s(-]*\d{3}[\s)-]*\d{3}[\s-]*\d{2}[\s-]*\d{2}/;
  const match = text.match(phoneRegex);
  return match ? match[0] : null;
};

export const generateResponse = async (userMessage: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Check for lead generation
    const extractedPhone = extractPhone(userMessage);
    if (extractedPhone) {
      addLead({
        name: "Пользователь из Чата",
        phone: extractedPhone,
        issue: "Указан в чате: " + userMessage.substring(0, 50) + "..."
      }, 'chat');
    }

    const context = findRelevantContext(userMessage);
    const systemInstruction = `
      Ты — виртуальный ассистент адвоката Горбунова К.Э. (МСКА «Экзитум»).
      Твой тон: профессиональный, сдержанный, вежливый, "дорогой" (Old Money vibe).
      Ты общаешься на русском языке.
      Офис находится в Калининграде (САР Остров Октябрьский), но работа ведется по всей РФ.
      
      Твоя цель: кратко консультировать по правовым вопросам (банкротство, облигации, корпоративные споры) и мотивировать записаться на консультацию.
      
      Если пользователь оставляет номер телефона, подтверди, что передал его адвокату.
      Не давай 100% гарантий результата, используй фразы "с высокой вероятностью", "судебная практика показывает".
      
      ${context ? context : "Если вопрос не касается права, вежливо верни разговор к юридической тематике."}
    `;

    const model = ai.models;
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    return response.text || "Извините, сейчас я не могу ответить. Пожалуйста, оставьте ваш номер телефона для связи.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Произошла техническая ошибка. Пожалуйста, свяжитесь с нами по телефону.";
  }
};