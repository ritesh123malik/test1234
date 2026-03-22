const { fetchContests } = require('./lib/contests/api');

async function test() {
    console.log('Fetching contests...');
    try {
        const contests = await fetchContests();
        console.log(`Found ${contests.length} contests.`);
        if (contests.length > 0) {
            console.log('Sample:', contests[0]);
        } else {
            console.log('WARNING: No contests found even with fallbacks.');
        }
    } catch (err) {
        console.error('Test failed:', err);
    }
}

test();
