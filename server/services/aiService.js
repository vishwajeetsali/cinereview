import Groq from 'groq-sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const analyzeSentiment = async (reviewText) => {
    try {
        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'user',
                    content: `Analyze the sentiment of this movie review and respond ONLY in raw JSON format.
                    No extra text, no markdown, just raw JSON.
                    Format: { "sentiment": "positive" or "negative" or "mixed", "score": number between 0-100 }
                    Review: "${reviewText}"`
                }
            ]
        })

        const text = response.choices[0].message.content
        const clean = text.replace(/```json|```/g, '').trim()
        const parsed = JSON.parse(clean)

        if (!parsed.sentiment || parsed.score === undefined) {
            throw new Error('Invalid sentiment response shape')
        }

        return parsed
    } catch (error) {
        throw new Error(`Sentiment analysis failed: ${error.message}`)
    }
}

export const generateVerdict = async (reviews) => {
    try {
        const recent = reviews.slice(-20)
        const reviewTexts = recent.map((r, i) => `Review ${i + 1}: ${r.text}`).join('\n')

        const response = await groq.chat.completions.create({
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'user',
                    content: `Based on these movie reviews, write a 2-3 sentence community verdict summary.
                    Be objective and reflect the overall opinion.
                    Reviews:
                    ${reviewTexts}`
                }
            ]
        })

        return response.choices[0].message.content
    } catch (error) {
        throw new Error(`Verdict generation failed: ${error.message}`)
    }
}