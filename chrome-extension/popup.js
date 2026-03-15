document.addEventListener('DOMContentLoaded', () => {
    const tokenInput = document.getElementById('token');
    const saveBtn = document.getElementById('save');
    const statusDiv = document.getElementById('status');

    // Load existing token
    chrome.storage.local.get(['pi_token'], (result) => {
        if (result.pi_token) {
            tokenInput.value = result.pi_token;
            showStatus('Workspace Connected', 'success');
        }
    });

    saveBtn.addEventListener('click', () => {
        const token = tokenInput.value.trim();
        if (!token) {
            showStatus('Token required', 'error');
            return;
        }

        chrome.storage.local.set({ pi_token: token }, () => {
            showStatus('Settings Updated', 'success');
            saveBtn.innerText = 'Connected_Confirmed';
            setTimeout(() => { saveBtn.innerText = 'Update_Settings'; }, 2000);
        });
    });

    function showStatus(text, type) {
        statusDiv.innerText = text;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
    }
});
