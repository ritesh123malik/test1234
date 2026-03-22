import { describe, it, expect } from 'vitest';
import { analyzeSpeech } from '@/services/speech-analyzer';

describe('Speech Analyzer Service', () => {
    it('should correctly calculate word count and WPM', () => {
        const transcript = "This is a simple test transcript with eight words.";
        const duration = 15; // 15 seconds
        const metrics = analyzeSpeech(transcript, duration);
        
        expect(metrics.word_count).toBe(9);
        expect(metrics.words_per_minute).toBe(36); // 9 words / 0.25 min
    });

    it('should detect filler words correctly', () => {
        const transcript = "Um, like, this is basically a test you know.";
        const metrics = analyzeSpeech(transcript, 30);
        
        expect(metrics.filler_count).toBeGreaterThan(0);
        expect(metrics.filler_breakdown).toHaveProperty('um');
        expect(metrics.filler_breakdown).toHaveProperty('like');
        expect(metrics.filler_breakdown).toHaveProperty('basically');
        expect(metrics.filler_breakdown).toHaveProperty('you know');
    });

    it('should return empty metrics for empty transcript', () => {
        const metrics = analyzeSpeech("", 10);
        expect(metrics.word_count).toBe(0);
        expect(metrics.communication_score).toBe(0);
    });

    it('should assign correct pace label', () => {
        // Ideal pace
        const transcript = "The quick brown fox jumps over the lazy dog. ".repeat(20);
        const metrics = analyzeSpeech(transcript, 60); // ~180 words in 1 min
        expect(metrics.pace_label).toBe('slightly fast');
    });
});
