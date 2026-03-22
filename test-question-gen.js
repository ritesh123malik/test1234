import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { generatePracticeQuestions } from './lib/ai-service.ts';

async function test() {
    try {
        console.log('Generating questions...');
        const questions = await generatePracticeQuestions(
            'Data Structures & Algorithms',
            'Easy',
            5,
            ['Arrays & Strings', 'Linked Lists']
        );
        console.log('✅ Success! Generated', questions.length, 'questions.');
        console.log(JSON.stringify(questions[0], null, 2));
    } catch (error) {
        console.error('❌ Failed:', error.message);
    }
}

test();
