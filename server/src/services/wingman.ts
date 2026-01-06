import { openai } from '../lib/openai';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WingmanService {

    // Generate a cute, contextual micro-question
    static async generateIcebreaker(context: { shield: string, timeOfDay: string }) {
        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    {
                        role: "system",
                        content: "You are Somnus (Wingman), a cute, mystical AI spirit. Ask a very short (4-6 words), engaging question to a user listening to a specific sound. Tone: Curious, gentle, intimate. No formal language."
                    },
                    {
                        role: "user",
                        content: `User is listening to: ${context.shield}. It is ${context.timeOfDay}. Ask something relevant to their mood.`
                    }
                ]
            });
            return response.choices[0].message.content || "Bu ses sana ne hissettiriyor?";
        } catch (e) {
            console.error("Wingman AI Error", e);
            return "Huzurlu hissediyor musun?";
        }
    }

    // Save answer and update sensory profile
    static async recordAnswer(userId: number, question: string, answer: string) {
        // In a real app, we'd append to a JSONB field or specialized table.
        // For MVP, we just log and maybe update a 'lastThought' field if we had one.
        console.log(`[Wingman] User ${userId} answered "${answer}" to "${question}"`);

        // Simple Logic: If answer is positive ("Yes"), bump tolerance or focus score
        if (answer.toLowerCase().includes('evet') || answer.toLowerCase().includes('yes')) {
            await prisma.user.update({
                where: { id: userId },
                data: { totalFocusMinutes: { increment: 5 } } // Reward interaction
            });
        }
    }

    // Find a frequency match (Similarity > 0.85)
    static async findFrequencyMatch(userId: number) {
        // Placeholder for pgvector logic if we had full embeddings here.
        // For now, finding someone in the same shield mode.
        return null;
    }
}
