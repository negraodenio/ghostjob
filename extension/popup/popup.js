// extension/popup/popup.js

// Change this to your production URL when deploying
const API_BASE_URL = 'https://www.ghostproof.cv';

// Check for LinkedIn profile
async function checkLinkedInProfile() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const profileBtn = document.getElementById('save-profile-btn');

    if (tab?.url?.includes('linkedin.com/in/')) {
        if (profileBtn) profileBtn.classList.remove('hidden');
    } else {
        if (profileBtn) profileBtn.classList.add('hidden');
    }
}

// Load last result on popup open
document.addEventListener('DOMContentLoaded', async () => {
    checkLinkedInProfile();
    const data = await chrome.storage.local.get(['lastResult']);
    if (data.lastResult) {
        displayResults(data.lastResult);
    }

    const dashBtn = document.getElementById('view-dashboard');
    if (dashBtn) {
        dashBtn.onclick = () => {
            chrome.tabs.create({ url: `${API_BASE_URL}/dashboard` });
        };
    }
});

document.getElementById('save-profile-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('save-profile-btn');
    const subtitle = document.querySelector('.content .subtitle');
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');

    if (btn) btn.textContent = 'Scraping...';

    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const getText = (selector) => document.querySelector(selector)?.innerText?.trim() || '';

                // LinkedIn selectors change often, but these are common
                const fullName = getText('h1') || getText('.text-heading-xlarge');
                const title = getText('.text-body-medium') || getText('.pv-text-details__left-panel div');
                const about = getText('#about')?.parentElement?.innerText || '';

                // Try to find current company from experience section
                const experienceSection = document.querySelector('#experience')?.parentElement;
                const companyName = experienceSection?.querySelector('.t-14.t-black.t-normal span')?.innerText || '';

                return { fullName, title, about, companyName, url: window.location.href };
            },
        });

        const profileData = injectionResults[0].result;

        // Map to our UserInfo format
        const userInfo = {
            fullName: profileData.fullName,
            currentTitle: profileData.title,
            experience: `${profileData.companyName ? `Currently at ${profileData.companyName}\n\n` : ''}${profileData.about}`,
            email: '', // can't easily scrape email
            phone: '',
            yearsExperience: 0,
            linkedin: profileData.url
        };

        // Save to storage (Extension side)
        await chrome.storage.local.set({ ghostjob_profile: userInfo });

        // Sync to Web App side if open (localhost:3000 or ghostjob.app)
        const tabs = await chrome.tabs.query({});
        for (const t of tabs) {
            if (t.url?.includes('localhost:3000') || t.url?.includes('ghostproof.cv')) {
                await chrome.scripting.executeScript({
                    target: { tabId: t.id },
                    func: (data) => {
                        localStorage.setItem('ghostjob_profile_sync', JSON.stringify(data));
                        // Force a reload of the form state if possible, or just let it pick up on next render
                        window.dispatchEvent(new Event('storage'));
                    },
                    args: [userInfo]
                });
            }
        }

        if (btn) btn.textContent = 'Profile Synced! ✅';
        setTimeout(() => { if (btn) btn.textContent = 'Save My Profile 👤'; }, 2000);

    } catch (error) {
        console.error('LinkedIn scrape failed:', error);
        if (btn) btn.textContent = 'Failed to Save';
    }
});

function displayResults(data) {
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const analyzeBtn = document.getElementById('analyze-btn');
    const initialView = document.getElementById('initial-view');
    const container = document.querySelector('.extension-container');

    if (analyzeBtn) analyzeBtn.classList.add('hidden');
    if (initialView) initialView.classList.add('hidden');
    if (loading) loading.classList.add('hidden');
    if (result) result.classList.remove('hidden');

    const profileBtn = document.getElementById('save-profile-btn');
    if (profileBtn) profileBtn.classList.add('hidden');

    // Theme and Score Logic
    const scoreVal = data.ghost_score || 0;
    const scoreEl = document.getElementById('ghost-score');
    const verdictEl = document.getElementById('verdict');
    const companyEl = document.getElementById('company-name-display');
    const titleEl = document.getElementById('job-title-display');
    const circle = document.getElementById('score-circle');

    if (scoreEl) scoreEl.textContent = scoreVal;
    if (verdictEl) verdictEl.textContent = data.ghost_verdict.replace('_', ' ');
    if (companyEl) companyEl.textContent = data.company_name || 'Unknown Company';
    if (titleEl) titleEl.textContent = data.job_title || 'Unknown Position';

    // Apply Radial Progress — circumference = 2 * PI * 54 = 339.292
    if (circle) {
        const circumference = 339.292;
        const offset = circumference - (scoreVal / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    // Apply data-verdict for CSS theming
    let verdict = 'legit';
    if (scoreVal >= 61) verdict = 'ghost';
    else if (scoreVal >= 31) verdict = 'sus';
    document.body.setAttribute('data-verdict', verdict);

    // Update score label text
    const scoreLabelEl = document.getElementById('status-pill');
    if (scoreLabelEl) {
        const verdictLabels = { ghost: '👻 Ghost Job', sus: '🤔 Suspect', legit: '✅ Legit Job' };
        scoreLabelEl.textContent = verdictLabels[verdict] || data.ghost_verdict?.replace('_', ' ') || 'Ghost Score';
    }

    // Company badge icon per verdict
    const badge = document.getElementById('company-badge');
    if (badge) {
        const badgeIcons = { ghost: 'priority_high', sus: 'warning', legit: 'check' };
        badge.querySelector('.material-symbols-outlined').textContent = badgeIcons[verdict];
        badge.className = `company-badge${verdict === 'legit' ? ' success' : ''}`;
    }

    // Company Logo
    const logoImg = document.getElementById('company-logo');
    if (logoImg) {
        logoImg.src = data.company_logo || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.company_name || 'J')}&background=random&color=fff`;
    }

    // Recruiter & Posted Stats
    const recruiterEl = document.getElementById('recruiter-type');
    const postedEl = document.getElementById('posted-time');
    if (recruiterEl) recruiterEl.textContent = data.is_verified_recruiter ? 'Verified' : 'Direct';
    if (postedEl) postedEl.textContent = data.posted_hint || 'Recently';

    // Advice & Reasons
    const adviceEl = document.getElementById('ghost-advice');
    const adviceContainer = document.getElementById('advice-container');
    if (adviceEl && adviceContainer) {
        let adviceHtml = '';

        // 1. Show concerns OR positive summary
        if (data.top_reasons?.length && scoreVal > 25) {
            adviceHtml += `<p class="top-reasons">⚠️ ${data.top_reasons.slice(0, 2).join(' • ')}</p>`;
        } else if (scoreVal <= 25) {
            adviceHtml += `<p class="top-reasons" style="color: var(--mint)">✅ High authenticity detected</p>`;
        }

        // 2. Job Quality Bars
        if (data.job_quality) {
            adviceHtml += `
                <div class="quality-bar-container">
                    <div class="quality-bar-label"><span>JOB REALISM</span><span>${data.job_quality.realism}%</span></div>
                    <div class="quality-bar-bg"><div class="quality-bar-fill" style="width: ${data.job_quality.realism}%"></div></div>
                </div>
            `;
        }

        // 3. Specific Advice
        const mainAdvice = data.ghost_advice || data.recommendation?.next_steps || (scoreVal <= 25 ? "This job looks safe to apply for. Follow standard application procedures." : "Proceed with caution and research the company more deeply.");
        adviceHtml += `<p>${mainAdvice}</p>`;

        // 4. Confidence
        if (data.confidence_score !== undefined) {
            adviceHtml += `<p class="confidence">AI Confidence: ${data.confidence_score}%</p>`;
        }

        adviceEl.innerHTML = adviceHtml;
        adviceContainer.classList.remove('hidden');
    }

    // Actions Container
    const resultActions = document.getElementById('result-actions');
    if (resultActions) {
        resultActions.classList.remove('hidden');
    }

    // Report Link
    const fullReportBtn = document.getElementById('full-report-btn');
    if (fullReportBtn) {
        fullReportBtn.onclick = () => {
            chrome.tabs.create({ url: `${API_BASE_URL}/analyze/${data.id}` });
        };
    }
}

// Reset Extension to Initial State
function resetToInitial() {
    const result = document.getElementById('result');
    const initialView = document.getElementById('initial-view');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultActions = document.getElementById('result-actions');
    const errorDiv = document.getElementById('error');

    if (result) result.classList.add('hidden');
    if (resultActions) resultActions.classList.add('hidden');
    if (initialView) initialView.classList.remove('hidden');
    if (analyzeBtn) analyzeBtn.classList.remove('hidden');
    if (errorDiv) errorDiv.classList.add('hidden');

    document.body.removeAttribute('data-verdict');
    chrome.storage.local.remove(['lastResult']);
}

document.getElementById('new-scan-btn')?.addEventListener('click', resetToInitial);

document.getElementById('analyze-btn').addEventListener('click', async () => {
    const btn = document.getElementById('analyze-btn');
    const loading = document.getElementById('loading');
    const result = document.getElementById('result');
    const errorDiv = document.getElementById('error');
    const initialView = document.getElementById('initial-view');

    // Show loading state in body
    document.body.setAttribute('data-verdict', 'loading');
    initialView.classList.add('hidden');
    loading.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    result.classList.add('hidden');

    try {
        // 1. Get current tab URL and text
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // Check if it's a valid url to script on
        if (!tab.url || tab.url.startsWith('chrome://')) {
            throw new Error("Cannot analyze this page.");
        }

        // 1. Scraping Content & Meta
        const injectionResults = await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const getText = (sel) => document.querySelector(sel)?.innerText?.trim() || '';
                const getAllText = (sel) => Array.from(document.querySelectorAll(sel)).map(el => el.innerText.trim()).filter(Boolean);

                // Target the active job details panel if it exists (LinkedIn search view, collection view, etc.)
                const detailPanel = document.querySelector('.jobs-search__job-details--container') ||
                    document.querySelector('.jobs-search-two-pane__details') ||
                    document.querySelector('.jobs-details__main-content') ||
                    document.querySelector('.job-view-layout') ||
                    document.querySelector('main') ||
                    document.body;

                const selectors = {
                    title: [
                        '.job-details-jobs-unified-top-card__job-title', // Modern LinkedIn
                        '.jobs-unified-top-card__job-title',
                        '.top-card-layout__title',
                        '.job-details-inline-wrap h2',
                        '.t-24.t-bold',
                        'h1'
                    ],
                    company: [
                        '.job-details-jobs-unified-top-card__company-name',
                        '.jobs-unified-top-card__company-name',
                        '.jobs-unified-top-card__primary-description a',
                        '.topcard__org-name-link',
                        '.jobsearch-CompanyReview--primaryContact',
                        '[data-admin-ee-company-name]',
                        '.app-awareness-label',
                        '.t-16.t-black.t-normal'
                    ],
                    posted: [
                        '.job-details-jobs-unified-top-card__job-insight--highlight',
                        '.jobs-unified-top-card__job-insight--highlight',
                        '.topcard__flavor--metadata',
                        '.jobsearch-JobMetadataFooter',
                        '.tvm__list-item'
                    ],
                    description: [
                        '.jobs-description-content__text',
                        '.jobs-description',
                        '.show-more-less-html__markup',
                        '.jobsearch-JobComponent-description'
                    ]
                };

                const findField = (list, filterFn = null) => {
                    for (const s of list) {
                        const elements = detailPanel.querySelectorAll(s);
                        for (const el of elements) {
                            const text = el.innerText.trim();
                            if (text && (!filterFn || filterFn(text))) return text;
                        }
                    }
                    return '';
                };

                // Specific filters
                const isDate = (t) => t.includes('ago') || t.includes('atrás') || t.includes('posted') || t.includes('publicada') || /\d+[hdmy]/.test(t);

                // Find description specifically if possible
                let description = '';
                for (const ds of selectors.description) {
                    const el = detailPanel.querySelector(ds);
                    if (el) {
                        description = el.innerText.trim();
                        break;
                    }
                }
                if (!description) description = detailPanel.innerText || document.body.innerText;

                return {
                    description: description,
                    titleHint: findField(selectors.title, (t) => t.length > 3 && !isDate(t)),
                    companyHint: findField(selectors.company, (t) => t.length > 2 && !isDate(t)),
                    postedHint: findField(selectors.posted, isDate),
                    url: window.location.href
                };
            },
        });

        const { description, titleHint, companyHint, url, postedHint } = injectionResults[0].result;

        // 2. Call API
        const response = await fetch(`${API_BASE_URL}/api/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                job_description: description.substring(0, 15000),
                job_url: url,
                title_hint: titleHint,
                company_hint: companyHint,
                posted_hint: postedHint
            }),
        });

        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to analyze job.');
        }

        const data = await response.json();

        // Save to storage for "history" (reopening popup shows last result)
        await chrome.storage.local.set({ lastResult: data });

        // 3. Display Results
        displayResults(data);

    } catch (error) {
        loading.classList.add('hidden');
        document.getElementById('initial-view').classList.remove('hidden');
        errorDiv.textContent = error.message;
        errorDiv.classList.remove('hidden');
        setTimeout(() => errorDiv.classList.add('hidden'), 5000); // Auto-hide error
    }
});
