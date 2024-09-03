import { GoogleGenerativeAI } from '@google/generative-ai';
import { TRANSLATE_PROMPT } from './prompts.js';
import {getApiKey} from './gemini-api-key.js'

const api = getApiKey();
const genAI = new GoogleGenerativeAI(api);
const sendMessageToGemini = async (prompt, content, shouldTranslate = false, isResponseJSON = false) => {
    // Create GenerativeModel instance
    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash", //Primary choice. If it returns a 500 error, fallback to 'gemini-1.5-pro' or 'gemini-1.0-pro'
        ...isResponseJSON && { generationConfig: { responseMimeType: "application/json" } }
    });

    let translatedContent = null;

    if (shouldTranslate) {
        const prompt = TRANSLATE_PROMPT + content;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        translatedContent = await response.text();
    }

    const result = await model.generateContent(prompt + (shouldTranslate ? translatedContent : content));
    const response = await result.response;
    const text = response.text();
    return isResponseJSON ? JSON.parse(text) : text;
};

export default sendMessageToGemini;