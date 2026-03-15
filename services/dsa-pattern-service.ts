import { getAIResponse } from '@/lib/ai-service';

export async function identifyDSAPattern(input: { code?: string, description?: string }, userId: string) {
    const prompt = `
        You are a Competitive Programming Coach. 
        Identify the primary DSA Pattern (e.g., Sliding Window, Monotonic Stack, Disjoint Set Union, etc.) for the following:
        
        ${input.description ? `PROBLEM DESCRIPTION: ${input.description}` : ''}
        ${input.code ? `CODE SNIPPET: ${input.code}` : ''}

        Provide a response in JSON format:
        {
            "pattern_name": string,
            "confidence": number (0-100),
            "logic_explanation": string, (Why this pattern fits)
            "template_snippet": string, (A generic code template for this pattern in C++)
            "common_pitfalls": string[],
            "complexity": { "time": string, "space": string },
            "similar_problems": string[]
        }
    `;

    const response = await getAIResponse(prompt, userId);
    const jsonStr = response.replace(/```json|```/g, '').trim();

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('DSA Pattern AI Error:', e);
        return { error: 'Failed to identify pattern.' };
    }
}

export const KNOWN_PATTERNS = [
    { id: 'sliding-window', name: 'Sliding Window', description: 'Used for problems involving arrays or strings where a contiguous sub-segment is considered.' },
    { id: 'two-pointers', name: 'Two Pointers', description: 'Searching pairs in sorted arrays or linked lists.' },
    { id: 'fast-slow-pointers', name: 'Fast & Slow Pointers', description: 'Cycle detection or middle finding in linked lists.' },
    { id: 'merge-intervals', name: 'Merge Intervals', description: 'Handling overlapping intervals.' },
    { id: 'cyclic-sort', name: 'Cyclic Sort', description: 'Arrays containing numbers in a range.' },
    { id: 'top-k', name: 'Top K Elements', description: 'Finding K largest/smallest elements using Heaps.' },
    { id: 'bfs-dfs', name: 'Tree/Graph Traversal', description: 'Level order or path finding.' },
];
