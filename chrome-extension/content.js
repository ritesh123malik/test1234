// Injected into leetcode.com/problems/* and geeksforgeeks.org/problems/*
(function () {
    const PLATFORMS = {
        'leetcode.com': 'leetcode',
        'geeksforgeeks.org': 'gfg'
    };

    const getPlatform = () => {
        const host = window.location.hostname;
        for (const [key, val] of Object.entries(PLATFORMS)) {
            if (host.includes(key)) return val;
        }
        return 'custom';
    };

    // Wait for the page title to load
    const waitForTitle = setInterval(() => {
        let title = '';
        let difficulty = 'Medium';
        const platform = getPlatform();

        if (platform === 'leetcode') {
            const titleEl = document.querySelector('[data-cy="question-title"]') || document.querySelector('.text-title-large');
            if (titleEl) title = titleEl.innerText;
            difficulty = document.querySelector('div[class*="text-difficulty-"]')?.innerText || 'Medium';
        } else if (platform === 'gfg') {
            const titleEl = document.querySelector('.problems_header_content__title__1_9_N h3') || document.querySelector('.problems-unsolved h3');
            if (titleEl) title = titleEl.innerText;
            difficulty = document.querySelector('.problems_header_description_difficulty__3S_0_')?.innerText || 'Medium';
        }

        if (!title) return;
        clearInterval(waitForTitle);

        // Build the question metadata
        const questionData = {
            title: title.trim(),
            url: window.location.href,
            platform,
            difficulty: difficulty.trim(),
        };

        // Inject the button
        const btnId = 'pi-save-button';
        if (document.getElementById(btnId)) return;

        const btn = document.createElement('button');
        btn.id = btnId;
        btn.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5v14"/></svg>
        Save to placement-intel
      </div>
    `;
        btn.style.cssText = `
      position: fixed; bottom: 30px; right: 30px; z-index: 99999;
      background: #2563eb; color: white; border: none; border-radius: 12px;
      padding: 12px 20px; font-size: 13px; font-weight: 800; cursor: pointer;
      box-shadow: 0 10px 25px -5px rgba(37, 99, 235, 0.4);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    `;
        btn.onmouseover = () => { btn.style.transform = 'translateY(-2px) scale(1.02)'; btn.style.backgroundColor = '#1d4ed8'; };
        btn.onmouseout = () => { btn.style.transform = 'translateY(0) scale(1)'; btn.style.backgroundColor = '#2563eb'; };

        btn.onclick = () => {
            btn.innerText = 'Syncing...';
            btn.disabled = true;
            chrome.runtime.sendMessage({ type: 'SAVE_QUESTION', payload: questionData }, (response) => {
                if (response?.success) {
                    btn.innerText = 'Saved!';
                    btn.style.backgroundColor = '#10b981';
                    setTimeout(() => {
                        btn.innerHTML = 'Save again?';
                        btn.disabled = false;
                        btn.style.backgroundColor = '#2563eb';
                    }, 3000);
                } else {
                    btn.innerText = 'Error (Check Login)';
                    btn.style.backgroundColor = '#ef4444';
                    setTimeout(() => {
                        btn.innerHTML = 'Retry?';
                        btn.disabled = false;
                        btn.style.backgroundColor = '#2563eb';
                    }, 3000);
                }
            });
        };
        document.body.appendChild(btn);
    }, 1000);
})();
