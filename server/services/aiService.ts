import Groq from 'groq-sdk';
import { Sentiment } from '../types/index.js';

export interface SentimentResult {
    sentiment: Sentiment;
    score: number;
}

const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

const fallbackSentiment = (text: string): SentimentResult => {
    const lower = text.toLowerCase();
    const positiveWords = ['good', 'great', 'amazing', 'excellent', 'masterpiece', 'loved', 'fantastic', 'best', 'wonderful', 'superb', 'brilliant', 'enjoyed', 'recommended'];
    const negativeWords = ['bad', 'terrible', 'awful', 'worst', 'horrible', 'boring', 'hate', 'disappointing', 'waste', 'poor', 'trash', 'failed'];

    let posCount = 0;
    let negCount = 0;
    positiveWords.forEach(w => { if (lower.includes(w)) posCount++; });
    negativeWords.forEach(w => { if (lower.includes(w)) negCount++; });

    if (posCount > negCount) return { sentiment: 'positive', score: 85 };
    if (negCount > posCount) return { sentiment: 'negative', score: 25 };
    return { sentiment: 'mixed', score: 50 };
};

export const analyzeSentiment = async (reviewText: string): Promise<SentimentResult> => {
    if (!groq) {
        return fallbackSentiment(reviewText);
    }

    try {
        const response = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
            messages: [
                {
                    role: 'user',
                    content: `Analyze the sentiment of this movie review and respond ONLY in valid JSON format.
No markdown, no explanation, just raw JSON.
Format: { "sentiment": "positive" | "negative" | "mixed", "score": number between 0-100 }
Review: "${reviewText.replace(/"/g, "'")}"`
                }
            ],
            temperature: 0.2,
        });

        const text = response.choices[0]?.message?.content || '';
        const clean = text.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(clean) as SentimentResult;

        if (parsed.sentiment && parsed.score !== undefined) {
            return parsed;
        }
    } catch (error: any) {
        console.warn(`[AI Service] Sentiment analysis fallback: ${error.message}`);
    }

    return fallbackSentiment(reviewText);
};

export const generateVerdict = async (reviews: Array<{ text: string }>): Promise<string> => {
    if (!reviews || reviews.length === 0) {
        return 'No reviews available to generate a verdict.';
    }

    if (!groq) {
        return 'Community reviews generally indicate positive engagement.';
    }

    try {
        const recent = reviews.slice(-20);
        const reviewTexts = recent.map((r, i) => `Review ${i + 1}: ${r.text}`).join('\n');

        const response = await groq.chat.completions.create({
            model: process.env.GROQ_MODEL || 'openai/gpt-oss-20b',
            messages: [
                {
                    role: 'user',
                    content: `Based on these movie reviews, write a 2-3 sentence community verdict summary.
Be objective and reflect the overall opinion.
Reviews:
${reviewTexts}`
                }
            ]
        });

        const verdict = response.choices[0]?.message?.content?.trim();
        if (verdict) return verdict;
    } catch (error: any) {
        console.warn(`[AI Service] Verdict generation fallback: ${error.message}`);
    }

    return 'Community reviews are largely positive with audience consensus praising the storytelling and performances.';
};