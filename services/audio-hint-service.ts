import { getAIResponse } from '@/lib/ai-service';

export async function generateAudioHint(context: { problem_text: string, current_code?: string }, userId: string) {
    const prompt = `
        You are a subtle companion AI for a programmer. 
        Provide a cryptic but helpful 1-sentence tactical hint for the following problem. 
        Don't give the answer. Use a metaphor if possible. 
        
        PROBLEM: ${context.problem_text}
        ${context.current_code ? `USER CODE: ${context.current_code}` : ''}

        Voice-optimized hint (plain text, no symbols):
    `;

    const hint = await getAIResponse(prompt, userId);
    return hint.trim();
}
