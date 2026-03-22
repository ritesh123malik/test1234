import Groq from 'groq-sdk';

// Lazy initialization of Groq client
let groqInstance: Groq | null = null;

export function getGroqClient() {
    if (!groqInstance) {
        const apiKey = process.env.GROQ_API_KEY;
        
        if (!apiKey && typeof window === 'undefined') {
            // Log a loud error on the server if the key is missing
            console.error('MISSING GROQ_API_KEY: AI features will not work. Add this to your Vercel/environment variables.');
        }

        groqInstance = new Groq({
            apiKey: apiKey || 'placeholder_key_for_build_safety',
        });
    }
    return groqInstance;
}

// Current Groq models as of 2026
const MODELS = {
    // Latest Llama models
    LLAMA_3_3_70B: 'llama-3.3-70b-versatile',
    LLAMA_3_1_8B: 'llama-3.1-8b-instant',
    LLAMA_3_1_70B: 'llama-3.1-70b-versatile',
    LLAMA_3_1_405B: 'llama-3.1-405b-reasoning',
    
    // Mixtral models
    MIXTRAL_8x7B: 'mixtral-8x7b-32768', // Keep constant but mark for fallback update

    // Gemma models
    GEMMA_2_9B: 'gemma2-9b-it',

    // specialized/new
    QWEN_2_5_32B: 'qwen-2.5-32b',
    
    // Specialized models
    WHISPER: 'whisper-large-v3-turbo'
};

export interface GroqOptions {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    response_format?: { type: 'json_object' | 'text' };
}

export async function generateWithGroq(
    prompt: string,
    systemPrompt: string = 'You are a helpful AI assistant.',
    model: string = MODELS.LLAMA_3_3_70B,
    options: GroqOptions = {}
) {
    const { 
        temperature = 0.7, 
        max_tokens = 4000, 
        top_p = 0.95, 
        response_format 
    } = options;

    if (!process.env.GROQ_API_KEY) {
        throw new Error('AI Service misconfigured: Missing GROQ_API_KEY. Please check your environment variables.');
    }

    try {
        console.log(`Using Groq model: ${model}`);

        const completion = await getGroqClient().chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: prompt }
            ],
            model: model,
            temperature: temperature,
            max_tokens: max_tokens,
            top_p: top_p,
            ...(response_format && { response_format })
        });

        return completion.choices[0]?.message?.content || '';
    } catch (error: any) {
        console.error('Groq API error:', error);

        // If model fails or is decommissioned, try fallback to a reliable production model
        if (
            (error.status === 400 && error.error?.code === 'model_decommissioned') ||
            (error.status === 404) ||
            (error.status === 429) // Rate limit fallback
        ) {
            if (model !== MODELS.LLAMA_3_1_8B) {
                console.log(`Model ${model} failed, trying fallback to Llama 3.1 8B...`);
                return generateWithGroq(prompt, systemPrompt, MODELS.LLAMA_3_1_8B, options);
            }
        }

        throw error;
    }
}

// Specialized functions with fallback models
export async function generateRoadmap(company: string, role: string, experience: string, duration: string) {
    const prompt = `Create a detailed ${duration}-week interview preparation roadmap for ${company} for a ${role} position.
  
  Experience level: ${experience}
  
  Include:
  1. Weekly breakdown of topics to study
  2. Key LeetCode problems to practice each week
  3. System design concepts to cover
  4. Behavioral preparation tips
  5. Resources and practice strategies
  
  Format the response in markdown with clear sections.`;

    const systemPrompt = 'You are an expert interview coach specializing in tech placements.';

    try {
        // Try latest Llama first
        return await generateWithGroq(prompt, systemPrompt, MODELS.LLAMA_3_3_70B);
    } catch (error) {
        console.log('Primary model failed, trying Mixtral...');
        // Fallback to Mixtral
        return await generateWithGroq(prompt, systemPrompt, MODELS.MIXTRAL_8x7B);
    }
}

export async function explainProblem(problem: string, difficulty: string) {
    const prompt = `Explain this ${difficulty} LeetCode problem: ${problem}
  
  Provide:
  1. Problem understanding
  2. Approach
  3. Complexity analysis
  4. Example walkthrough`;

    const systemPrompt = 'You are a LeetCode expert tutor. Provide clear explanations with examples.';

    try {
        return await generateWithGroq(prompt, systemPrompt, MODELS.LLAMA_3_1_8B, { temperature: 0.5 });
    } catch (error) {
        return await generateWithGroq(prompt, systemPrompt, MODELS.LLAMA_3_3_70B, { temperature: 0.5 });
    }
}

export async function generateHint(problem: string) {
    const prompt = `Give a subtle hint for this problem without revealing the full solution: ${problem}`;
    const systemPrompt = 'You are a helpful coding tutor. Provide hints that guide but don\'t give away the answer.';

    return generateWithGroq(prompt, systemPrompt, MODELS.LLAMA_3_1_8B, { temperature: 0.3 }); // Using 8B for hints
}

export async function debugCode(code: string, language: string, userId: string = 'anonymous') {
    const prompt = `Debug this ${language} code and suggest fixes:\n\n${code}`;
    const systemPrompt = 'You are a debugging expert. Identify issues and explain how to fix them.';

    return generateWithGroq(prompt, systemPrompt, MODELS.LLAMA_3_1_8B);
}

export async function analyzeResume(resumeText: string) {
    const prompt = `Analyze this resume for SDE roles at top tech companies. Respond ONLY with this exact JSON format:
{
  "score": <integer 0-100, ATS and quality score>,
  "summary": "<2-3 sentence overall assessment, be honest>",
  "strengths": ["<specific strength>", "<specific strength>", "<specific strength>"],
  "improvements": ["<specific actionable improvement>", "<specific actionable improvement>", "<specific actionable improvement>", "<specific actionable improvement>"],
  "missing_keywords": ["<missing tech keyword>", "<missing tech keyword>", "..."]
}

Resume text:
${resumeText}`;

    const systemPrompt = `You are an expert ATS resume reviewer and technical recruiter for top tech companies in India. 
          Analyze resumes for Software Development Engineer (SDE) roles. Be specific, actionable, and honest.
          Always respond with valid JSON only — no markdown, no explanation outside the JSON.`;

    return generateWithGroq(prompt, systemPrompt, MODELS.LLAMA_3_3_70B, { temperature: 0.3 });
}

export async function getAIResponse(prompt: string, userId: string = 'anonymous', systemPrompt: string = "You're a LeetCode expert.") {
    return generateWithGroq(prompt, systemPrompt, MODELS.LLAMA_3_3_70B);
}

export async function generatePracticeQuestions(
    topic: string,
    difficulty: string = 'Medium',
    count: number = 5,
    subtopics: string[] = [],
    mode: 'company' | 'topic' = 'topic',
    format: 'coding' | 'mcq' | 'mixed' = 'mcq'
) {
    const diffInstruction = difficulty === 'Mixed'
        ? 'Mix easy, medium, and hard difficulties evenly across questions.'
        : `All questions should be ${difficulty} difficulty.`;

    const subtopicContext = subtopics.length > 0 
        ? `Focus explicitly on these subtopics (distribute questions evenly across them): ${subtopics.join(', ')}.`
        : `Cover general aspects and common subtopics within ${topic}.`;

    const formatInstruction = {
        coding: `Generate exactly ${count} LeetCode-style coding problems. Each must have "type": "coding".`,
        mcq: `Generate exactly ${count} multiple-choice questions. Each must have "type": "mcq".`,
        mixed: `Generate exactly ${count} questions — roughly half LeetCode-style coding and half MCQ. Assign "type": "coding" or "type": "mcq" accordingly.`
    }[format];

    const context = mode === 'company' 
        ? `You are simulating a technical interview at ${topic}. Questions should reflect ${topic}'s typical interview style, focus areas, and difficulty level.`
        : `You are testing depth in the technical domain: ${topic}.`;

    const prompt = `${context}
    ${formatInstruction}
    ${diffInstruction}
    ${subtopicContext}

    Return ONLY a valid JSON object with a "questions" key containing the array of questions. 
    
    For CODING questions ("type": "coding"):
    - "title": string (LeetCode style)
    - "difficulty": "Easy" | "Medium" | "Hard"
    - "topic": string
    - "description": string (Include constraints here or separately)
    - "examples": array of { "input": string, "output": string, "explanation": string }
    - "constraints": array of strings
    - "solution_approach": string (3-4 sentences)
    - "hint": string (one sentence)

    For MCQ questions ("type": "mcq"):
    - "question": string
    - "options": array of 4 strings
    - "answer": integer (0-3)
    - "explanation": string
    - "difficulty": "Easy" | "Medium" | "Hard"
    - "subtopic": string

    Be highly technical and accurate. Return ONLY valid JSON.`;

    const systemPrompt = 'You are a professional technical interviewer for top-tier tech companies. Always respond with valid JSON.';

    // Always use 8B model for question generation to ensure reliability and stay within Edge timeout (25s)
    // 70B is too slow for generating multiple objects in a single pass at the edge.
    const modelToUse = MODELS.LLAMA_3_1_8B;

    const response = await generateWithGroq(prompt, systemPrompt, modelToUse, {
        temperature: 0.7,
        response_format: { type: 'json_object' }
    });

    try {
        const parsed = JSON.parse(response);
        return parsed.questions || parsed || [];
    } catch (e) {
        console.error('Failed to parse AI response as JSON:', response);
        throw new Error('AI failed to generate a valid question set.');
    }
}

export async function generateSolutionApproach(problem: string, userId: string = 'anonymous') {
    const prompt = `Generate a detailed step-by-step solution approach for this LeetCode problem: ${problem}`;
    const systemPrompt = 'You are a LeetCode expert. Provide a conceptual algorithmic approach without writing the exact code out entirely.';
    return generateWithGroq(prompt, systemPrompt, MODELS.LLAMA_3_3_70B);
}

export async function getHint(problem: string, userId: string = 'anonymous') {
    return generateHint(problem);
}

export async function streamWithGroq(
    prompt: string,
    systemPrompt: string = 'You are a helpful AI assistant.',
    model: string = MODELS.LLAMA_3_3_70B,
    options: GroqOptions = {}
) {
    const { 
        temperature = 0.7, 
        max_tokens = 4000, 
        top_p = 0.95,
    } = options;

    return getGroqClient().chat.completions.create({
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
        ],
        model: model,
        temperature: temperature,
        max_tokens: max_tokens,
        top_p: top_p,
        stream: true,
    });
}

// Export models for use elsewhere
export { MODELS };
