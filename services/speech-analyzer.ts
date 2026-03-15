/**
 * Speech Analysis Engine
 * Evaluates communication metrics from transcript text and audio duration.
 */

const FILLER_PATTERNS: Record<string, { regex: RegExp; weight: number; category: string }> = {
    // High penalty verbal hesitations (weight 3)
    'um': { regex: /\bum\b/gi, weight: 3, category: 'hesitation' },
    'uh': { regex: /\buh\b/gi, weight: 3, category: 'hesitation' },
    'er': { regex: /\ber\b/gi, weight: 3, category: 'hesitation' },
    'ah': { regex: /\bah\b/gi, weight: 3, category: 'hesitation' },
    'hmm': { regex: /\bhmm\b/gi, weight: 3, category: 'hesitation' },

    // Medium penalty discourse fillers (weight 2)
    'like': { regex: /\blike\b/gi, weight: 2, category: 'discourse' },
    'you know': { regex: /\byou know\b/gi, weight: 2, category: 'discourse' },
    'right': { regex: /\bright\b/gi, weight: 2, category: 'discourse' },
    'okay': { regex: /\bokay\b/gi, weight: 2, category: 'discourse' },
    'i mean': { regex: /\bi mean\b/gi, weight: 2, category: 'discourse' },
    'kind of': { regex: /\bkind of\b/gi, weight: 2, category: 'discourse' },
    'sort of': { regex: /\bsort of\b/gi, weight: 2, category: 'discourse' },

    // Low penalty thought fillers (weight 1)
    'basically': { regex: /\bbasically\b/gi, weight: 1, category: 'thought' },
    'literally': { regex: /\bliterally\b/gi, weight: 1, category: 'thought' },
    'actually': { regex: /\bactually\b/gi, weight: 1, category: 'thought' },
    'obviously': { regex: /\bobviously\b/gi, weight: 1, category: 'thought' },
    'so': { regex: /^so\b|\bso\b/gi, weight: 1, category: 'thought' },

    // High penalty padding phrases (weight 3)
    'at the end of the day': { regex: /\bat the end of the day\b/gi, weight: 3, category: 'padding' },
    'to be honest': { regex: /\bto be honest\b/gi, weight: 3, category: 'padding' },
    'you see': { regex: /\byou see\b/gi, weight: 3, category: 'padding' },
    'i think': { regex: /\bi think\b/gi, weight: 2, category: 'hedge' },
    'i guess': { regex: /\bi guess\b/gi, weight: 2, category: 'hedge' },
    'i believe': { regex: /\bi believe\b/gi, weight: 2, category: 'hedge' },
    'maybe': { regex: /\bmaybe\b/gi, weight: 2, category: 'hedge' },
    'perhaps': { regex: /\bperhaps\b/gi, weight: 1, category: 'hedge' },
};

const HEDGE_WORDS = ['think', 'guess', 'believe', 'maybe', 'perhaps',
    'might', 'could', 'possibly', 'probably', 'hopefully', 'assume', 'suppose'];

export interface SpeechMetrics {
    word_count: number;
    words_per_minute: number;
    filler_count: number;
    filler_rate_percent: number;
    filler_breakdown: Record<string, number>;
    vocabulary_richness: number;
    avg_sentence_length: number;
    hedge_rate: number;
    question_endings: number;
    pace_label: string;
    communication_score: number;
    feedback_tips: string[];
}

export function analyzeSpeech(
    transcript: string,
    audioDurationSeconds: number
): SpeechMetrics {
    if (!transcript || audioDurationSeconds <= 0) {
        return getEmptyMetrics();
    }

    const text = transcript.trim();

    // 1. Word Count
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;

    // 2. Speaking Rate (WPM)
    const durationMinutes = audioDurationSeconds / 60;
    const wpm = durationMinutes > 0
        ? Math.round(wordCount / durationMinutes)
        : 0;

    // 3. Filler Detection
    const fillerBreakdown: Record<string, number> = {};
    let fillerCount = 0;

    for (const [word, pattern] of Object.entries(FILLER_PATTERNS)) {
        const matches = text.match(pattern.regex);
        if (matches && matches.length > 0) {
            fillerBreakdown[word] = matches.length;
            fillerCount += matches.length;
        }
    }

    const fillerRate = wordCount > 0
        ? Math.round((fillerCount / wordCount) * 1000) / 10
        : 0;

    // 4. Vocabulary Richness (Type-Token Ratio)
    const cleanWords = words.map(w => w.toLowerCase().replace(/[^a-z]/g, ''))
        .filter(w => w.length > 2);
    const uniqueWords = new Set(cleanWords);
    const vocabRichness = cleanWords.length > 0
        ? Math.round((uniqueWords.size / cleanWords.length) * 1000) / 1000
        : 0;

    // 5. Sentence Analysis
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const sentenceLengths = sentences.map(s =>
        s.trim().split(/\s+/).filter(w => w.length > 0).length
    );
    const avgSentenceLen = sentenceLengths.length > 0
        ? Math.round(sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length * 10) / 10
        : 0;

    const questionEndings = (text.match(/\?/g) || []).length;

    // 6. Hedge Rate
    const hedgeCount = HEDGE_WORDS.reduce((count, word) => {
        const matches = text.match(new RegExp(`\\b${word}\\b`, 'gi'));
        return count + (matches ? matches.length : 0);
    }, 0);
    const hedgeRate = wordCount > 0 ? (hedgeCount / wordCount) * 100 : 0;

    // 7. Pace Label
    let paceLabel = 'ideal';
    if (wpm < 80) paceLabel = 'too slow';
    else if (wpm < 100) paceLabel = 'slow';
    else if (wpm > 200) paceLabel = 'too fast';
    else if (wpm > 170) paceLabel = 'slightly fast';

    // 8. Scores
    const pScore = _paceScore(wpm);
    const fScore = _fillerScore(fillerRate);
    const vScore = _vocabScore(vocabRichness);
    const cScore = _clarityScore(avgSentenceLen);
    const cfScore = _confScore(hedgeRate, questionEndings);

    const commScore = Math.round(
        (pScore * 0.25 + fScore * 0.30 + vScore * 0.15 + cScore * 0.15 + cfScore * 0.15) * 10
    ) / 10;

    // 9. Feedback Tips
    const tips: string[] = [];
    const topFillers = Object.entries(fillerBreakdown)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
    topFillers.forEach(([word, count]) => {
        if (count >= 3) tips.push(`Reduce '${word}' — used ${count} times`);
    });

    if (wpm > 170) tips.push(`Your pace is fast at ${wpm} WPM — aim for 120-160`);
    if (wpm < 100 && wpm > 0) tips.push(`Your pace is slow at ${wpm} WPM — aim for 120-160`);
    if (vocabRichness < 0.55 && wordCount > 20) tips.push('Vary your vocabulary — too many repeated words');
    if (avgSentenceLen > 35) tips.push('Break long sentences into shorter ones for clarity');
    if (avgSentenceLen < 8 && wordCount > 10) tips.push('Expand your answers — short sentences seem rushed');
    if (hedgeRate > 5) tips.push('Avoid hedge phrases like "I think" — speak with conviction');

    return {
        word_count: wordCount,
        words_per_minute: wpm,
        filler_count: fillerCount,
        filler_rate_percent: fillerRate,
        filler_breakdown: fillerBreakdown,
        vocabulary_richness: vocabRichness,
        avg_sentence_length: avgSentenceLen,
        hedge_rate: Math.round(hedgeRate * 100) / 100,
        question_endings: questionEndings,
        pace_label: paceLabel,
        communication_score: commScore,
        feedback_tips: tips,
    };
}

function _paceScore(wpm: number): number {
    if (wpm >= 120 && wpm <= 160) return 10;
    if (wpm >= 100 && wpm <= 170) return 8;
    if (wpm >= 80 && wpm < 100) return 5;
    if (wpm > 170 && wpm <= 200) return 5;
    return 3;
}

function _fillerScore(rate: number): number {
    if (rate <= 2) return 10;
    if (rate <= 4) return 8;
    if (rate <= 6) return 6;
    if (rate <= 10) return 4;
    return 2;
}

function _vocabScore(ratio: number): number {
    if (ratio >= 0.75) return 10;
    if (ratio >= 0.65) return 8;
    if (ratio >= 0.55) return 6;
    if (ratio >= 0.45) return 4;
    return 2;
}

function _clarityScore(len: number): number {
    if (len >= 15 && len <= 25) return 10;
    if (len >= 10 && len <= 30) return 8;
    if (len >= 7 && len <= 35) return 5;
    return 2;
}

function _confScore(hedgeRate: number, qEndings: number): number {
    return Math.max(1, Math.round(10 - Math.min(4, hedgeRate * 0.5) - Math.min(3, qEndings)));
}

function getEmptyMetrics(): SpeechMetrics {
    return {
        word_count: 0, words_per_minute: 0, filler_count: 0, filler_rate_percent: 0,
        filler_breakdown: {}, vocabulary_richness: 0, avg_sentence_length: 0, hedge_rate: 0,
        question_endings: 0, pace_label: 'unknown', communication_score: 0, feedback_tips: []
    };
}
