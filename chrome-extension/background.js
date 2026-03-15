chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'SAVE_QUESTION') {
        chrome.storage.local.get(['pi_token'], (result) => {
            const token = result.pi_token;
            if (!token) {
                sendResponse({ success: false, error: 'No token found. Please set your token in the extension popup.' });
                return;
            }

            // Default to localhost for development, can be updated for production
            const API_BASE = 'http://localhost:3000';

            fetch(`${API_BASE}/api/extension/save-question`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: request.payload,
                    token: token
                })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ success: false, error: data.error });
                    }
                })
                .catch(err => {
                    console.error('Save error details:', err);
                    sendResponse({ success: false, error: `Network error: ${err.message}. Please ensure the dev server is running at http://localhost:3000` });
                });
        });
        return true; // Keep message channel open for async response
    }
});
