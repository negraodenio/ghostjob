// extension/popup/popup.js

// Change this to your production URL when deploying
const API_BASE_URL = 'http://localhost:3000';

document.getElementById('analyze-btn').addEventListener('click', async () => {
    const btn = document.getElementById('analyze-btn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    const content = document.getElementById('content');

    // Hide initial info, show loading
    btn.classList.add('hidden');
    content.querySelector('.subtitle').classList.add('hidden');
    loading.classList.remove('hidden');
    errorDiv.classList.add('hidden');

    try {
        // 1. Get current tab URL and text
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Check if it's a valid url to script on
        if (!tab.url || tab.url.startsWith('chrome://')) {
            throw new Error("Cannot analyze this page.");
        }

        // Extract page text via scripting
        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => document.body.innerText,
        });

        const pageText = injectionResults[0].result;

        // We send the current URL as a priority to be scraped by Jina if the text is somehow not clean
        // But page text is a good fallback

        // 2. Call GhostJob API
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                job_description: pageText.substring(0, 15000), // pass body text
                job_url: tab.url, // Pass URL so API can use Jina if it prefers
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to analyze job.');
        }

        const data = await response.json();

        // 3. Display Results
        loading.classList.add('hidden');
        result.classList.remove('hidden');

        const scoreEl = document.getElementById('ghost-score');
        const verdictEl = document.getElementById('verdict');
        const headlineEl = document.getElementById('headline');

        scoreEl.textContent = `${data.ghost_score}%`;
        verdictEl.textContent = data.ghost_verdict.replace('_', ' ').toUpperCase();
        headlineEl.textContent = data.ghost_headline;

        // Colors based on score
        scoreEl.className = 'score';
        if (data.ghost_score >= 61) {
            scoreEl.classList.add('color-ghost');
            verdictEl.classList.add('color-ghost');
        } else if (data.ghost_score >= 31) {
            scoreEl.classList.add('color-sus');
            verdictEl.classList.add('color-sus');
        } else {
            scoreEl.classList.add('color-legit');
            verdictEl.classList.add('color-legit');
        }

        // Set up full report link
        document.getElementById('full-report-btn').onclick = () => {
            chrome.tabs.create({ url: `${API_BASE_URL}/analyze/${data.id}` });
        };

    } catch (error) {
        loading.classList.add('hidden');
        btn.classList.remove('hidden');
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
    }
});
