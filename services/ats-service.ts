import pdf from 'pdf-parse';
import { getAIResponse } from '@/lib/ai-service';

export async function parseResume(buffer: Buffer): Promise<string> {
    try {
        const data = await pdf(buffer);
        return data.text;
    } catch (error) {
        console.error('PDF Parse Error:', error);
        throw new Error('Failed to parse resume PDF.');
    }
}

export async function scoreResume(resumeText: string, jobDescription: string, userId: string) {
    const prompt = `
        You are an expert ATS (Applicant Tracking System) and Senior Technical Recruiter.
        Analyze the following Resume against the Job Description.

        RESUME:
        ${resumeText.slice(0, 4000)}

        JOB DESCRIPTION:
        ${jobDescription.slice(0, 2000)}

        Provide a rigorous evaluation in JSON format:
        {
            "score": number (0-100),
            "match_reasons": string[], (Why it matches)
            "missing_keywords": string[], (Crucial skills/tools missing)
            "improvement_tips": string[], (Specific actionable advice)
            "jd_alignment": "Low" | "Medium" | "High"
        }
    `;

    const response = await getAIResponse(prompt, userId);

    // Clean JSON if needed (Groq sometimes adds markdown wrappers)
    const jsonStr = response.replace(/```json|```/g, '').trim();

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('AI JSON Parse Error:', e);
        // Fallback
        return {
            score: 0,
            match_reasons: ["Error parsing AI response"],
            missing_keywords: [],
            improvement_tips: ["Please try again."],
            jd_alignment: "Low"
        };
    }
}
