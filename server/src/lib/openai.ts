import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
    console.warn("⚠️ OPENAI_API_KEY is missing. AI features will respond with mock data.");
}

export const openai = new OpenAI({
    apiKey: apiKey || 'mock-key', // Prevent crash on init if missing, handle errors in calls
});
