// Enhanced Cookie Consent Management System - EU Law Compliant 2025

(function() {
    'use strict';

    // Cookie categories
    const COOKIE_CATEGORIES = {
        necessary: {
            name: 'Notwendige Cookies',
            description: 'Diese Cookies sind für die Grundfunktionen der Website erforderlich.',
            required: true
        },
        functional: {
            name: 'Funktionale Cookies',
            description: 'Diese Cookies ermöglichen erweiterte Funktionen und Personalisierung.',
            required: false
        },
        analytics: {
            name: 'Analyse Cookies',
            description: 'Diese Cookies helfen uns zu verstehen, wie Besucher die Website nutzen.',
            required: false
        },
        marketing: {
            name: 'Marketing Cookies',
            description: 'Diese Cookies werden verwendet, um Werbung relevanter zu machen.',
            required: false
        }
    };

    // Cookie consent storage
    const CONSENT_COOKIE_NAME = 'cookie_consent';
    const CONSENT_COOKIE_DAYS = 365;

    // Get current consent status
    function getConsent() {
        const consent = getCookie(CONSENT_COOKIE_NAME);
        if (consent) {
            try {
                return JSON.parse(consent);
            } catch (e) {
                return null;
            }
        }
        return null;
    }

    // Set consent
    function setConsent(consentData) {
        const data = {
            timestamp: new Date().toISOString(),
            categories: consentData,
            version: '1.0'
        };
        setCookie(CONSENT_COOKIE_NAME, JSON.stringify(data), CONSENT_COOKIE_DAYS);
        applyConsent(consentData);
    }

    // Apply consent (block/allow cookies based on user choice)
    function applyConsent(consentData) {
        // Block or allow Google Analytics based on consent
        if (window.gtag) {
            if (consentData.analytics) {
                window.gtag('consent', 'update', {
                    'analytics_storage': 'granted'
                });
            } else {
                window.gtag('consent', 'update', {
                    'analytics_storage': 'denied'
                });
            }
        }

        // Block or allow marketing cookies
        if (consentData.marketing) {
            // Enable marketing scripts
            enableMarketingScripts();
        } else {
            // Disable marketing scripts
            disableMarketingScripts();
        }

        // Trigger custom event for other scripts to listen to
        window.dispatchEvent(new CustomEvent('cookieConsentUpdated', { detail: consentData }));
    }

    // Cookie helper functions
    function setCookie(name, value, days) {
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = name + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Lax;Secure';
    }

    function getCookie(name) {
        const nameEQ = name + '=';
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    function deleteCookie(name) {
        document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
    }

    // Create cookie banner HTML
    function createCookieBanner() {
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'cookie-consent-banner';
        banner.setAttribute('role', 'dialog');
        banner.setAttribute('aria-label', 'Cookie-Einstellungen');
        
        banner.innerHTML = `
            <div class="cookie-consent-content">
                <div class="cookie-consent-text">
                    <h2>Cookie-Einstellungen</h2>
                    <p>Wir verwenden Cookies, um Ihre Erfahrung zu verbessern. Sie können auswählen, welche Kategorien Sie zulassen möchten.</p>
                </div>
                
                <div class="cookie-consent-categories">
                    <div class="cookie-category">
                        <label class="cookie-category-label">
                            <input type="checkbox" id="consent-necessary" checked disabled>
                            <div>
                                <strong>Notwendige Cookies</strong>
                                <p>Immer aktiv</p>
                            </div>
                        </label>
                    </div>
                    
                    <div class="cookie-category">
                        <label class="cookie-category-label">
                            <input type="checkbox" id="consent-functional">
                            <div>
                                <strong>Funktionale Cookies</strong>
                                <p>Erweiterte Funktionen</p>
                            </div>
                        </label>
                    </div>
                    
                    <div class="cookie-category">
                        <label class="cookie-category-label">
                            <input type="checkbox" id="consent-analytics">
                            <div>
                                <strong>Analyse Cookies</strong>
                                <p>Website-Statistiken</p>
                            </div>
                        </label>
                    </div>
                    
                    <div class="cookie-category">
                        <label class="cookie-category-label">
                            <input type="checkbox" id="consent-marketing">
                            <div>
                                <strong>Marketing Cookies</strong>
                                <p>Personalisierte Werbung</p>
                            </div>
                        </label>
                    </div>
                </div>
                
                <div class="cookie-consent-actions">
                    <button class="btn-cookie-settings" onclick="showCookieSettings()">Einstellungen</button>
                    <button class="btn-cookie-reject" onclick="rejectAllCookies()">Alle ablehnen</button>
                    <button class="btn-cookie-accept-selected" onclick="acceptSelectedCookies()">Auswahl speichern</button>
                    <button class="btn-cookie-accept-all" onclick="acceptAllCookies()">Alle akzeptieren</button>
                </div>
                
                <div class="cookie-consent-links">
                    <a href="/datenschutz.html">Datenschutzerklärung</a> | 
                    <a href="/cookie-richtlinien.html">Cookie-Richtlinien</a>
                </div>
            </div>
        `;
        
        return banner;
    }

    // Create cookie settings button for footer
    function createCookieSettingsButton() {
        const button = document.createElement('button');
        button.id = 'cookie-settings-button';
        button.className = 'cookie-settings-button';
        button.innerHTML = '🍪 Cookie-Einstellungen';
        button.onclick = showCookieSettings;
        button.setAttribute('aria-label', 'Cookie-Einstellungen öffnen');
        return button;
    }

    // Show cookie settings
    window.showCookieSettings = function() {
        const existingBanner = document.getElementById('cookie-consent-banner');
        if (existingBanner) {
            existingBanner.style.display = 'block';
        } else {
            const banner = createCookieBanner();
            document.body.appendChild(banner);
        }
        
        // Load current settings
        const consent = getConsent();
        if (consent && consent.categories) {
            document.getElementById('consent-functional').checked = consent.categories.functional || false;
            document.getElementById('consent-analytics').checked = consent.categories.analytics || false;
            document.getElementById('consent-marketing').checked = consent.categories.marketing || false;
        }
    };

    // Accept all cookies
    window.acceptAllCookies = function() {
        const consent = {
            necessary: true,
            functional: true,
            analytics: true,
            marketing: true
        };
        setConsent(consent);
        hideCookieBanner();
        showToast('Alle Cookies akzeptiert');
    };

    // Reject all cookies (except necessary)
    window.rejectAllCookies = function() {
        const consent = {
            necessary: true,
            functional: false,
            analytics: false,
            marketing: false
        };
        setConsent(consent);
        hideCookieBanner();
        showToast('Nur notwendige Cookies akzeptiert');
    };

    // Accept selected cookies
    window.acceptSelectedCookies = function() {
        const consent = {
            necessary: true,
            functional: document.getElementById('consent-functional').checked,
            analytics: document.getElementById('consent-analytics').checked,
            marketing: document.getElementById('consent-marketing').checked
        };
        setConsent(consent);
        hideCookieBanner();
        showToast('Cookie-Einstellungen gespeichert');
    };

    // Hide cookie banner
    function hideCookieBanner() {
        const banner = document.getElementById('cookie-consent-banner');
        if (banner) {
            banner.style.display = 'none';
        }
    }

    // Enable marketing scripts
    function enableMarketingScripts() {
        // Add marketing scripts here when consent is given
        // Example: Load Facebook Pixel, Google Ads, etc.
    }

    // Disable marketing scripts
    function disableMarketingScripts() {
        // Remove marketing cookies and prevent scripts from loading
        // List common marketing cookies to delete
        const marketingCookies = ['_fbp', '_fbc', 'fr', 'tr', '_gcl_au', '_gcl_aw'];
        marketingCookies.forEach(cookie => deleteCookie(cookie));
    }

    // Initialize on DOM ready
    function init() {
        // Check if consent exists
        const consent = getConsent();
        
        if (!consent) {
            // Show cookie banner
            const banner = createCookieBanner();
            document.body.appendChild(banner);
        } else {
            // Apply existing consent
            applyConsent(consent.categories);
        }
        
        // Add cookie settings button to footer
        const footer = document.querySelector('.footer');
        if (footer) {
            const settingsButton = createCookieSettingsButton();
            footer.appendChild(settingsButton);
        }
        
        // Set default consent mode for Google Analytics (if present)
        if (window.gtag) {
            window.gtag('consent', 'default', {
                'analytics_storage': consent ? (consent.categories.analytics ? 'granted' : 'denied') : 'denied',
                'ad_storage': consent ? (consent.categories.marketing ? 'granted' : 'denied') : 'denied'
            });
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

// CSS for cookie consent banner
const cookieConsentStyles = `
<style>
.cookie-consent-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    border-top: 2px solid var(--color-violet-600);
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    z-index: 9999;
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from {
        transform: translateY(100%);
    }
    to {
        transform: translateY(0);
    }
}

.cookie-consent-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.cookie-consent-text {
    margin-bottom: 1.5rem;
}

.cookie-consent-text h2 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: var(--color-gray-900);
}

.cookie-consent-text p {
    color: var(--color-gray-600);
    margin: 0;
}

.cookie-consent-categories {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
}

.cookie-category {
    background: var(--color-gray-50);
    padding: 1rem;
    border-radius: 0.5rem;
    border: 1px solid var(--color-gray-200);
}

.cookie-category-label {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
    cursor: pointer;
}

.cookie-category-label input[type="checkbox"] {
    margin-top: 0.25rem;
}

.cookie-category-label strong {
    display: block;
    font-size: 0.875rem;
    color: var(--color-gray-900);
    margin-bottom: 0.25rem;
}

.cookie-category-label p {
    font-size: 0.75rem;
    color: var(--color-gray-600);
    margin: 0;
}

.cookie-consent-actions {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
}

.cookie-consent-actions button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-cookie-settings {
    background: var(--color-gray-200);
    color: var(--color-gray-700);
}

.btn-cookie-settings:hover {
    background: var(--color-gray-300);
}

.btn-cookie-reject {
    background: white;
    color: var(--color-gray-700);
    border: 1px solid var(--color-gray-300);
}

.btn-cookie-reject:hover {
    background: var(--color-gray-50);
}

.btn-cookie-accept-selected {
    background: var(--color-violet-600);
    color: white;
}

.btn-cookie-accept-selected:hover {
    background: var(--color-violet-700);
}

.btn-cookie-accept-all {
    background: var(--color-green-600);
    color: white;
}

.btn-cookie-accept-all:hover {
    background: var(--color-green-700);
}

.cookie-consent-links {
    font-size: 0.875rem;
    color: var(--color-gray-600);
}

.cookie-consent-links a {
    color: var(--color-violet-600);
    text-decoration: underline;
}

.cookie-settings-button {
    position: fixed;
    bottom: 2rem;
    left: 2rem;
    background: var(--color-violet-600);
    color: white;
    border: none;
    padding: 0.75rem 1.25rem;
    border-radius: 2rem;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    transition: all 0.2s;
    z-index: 100;
}

.cookie-settings-button:hover {
    background: var(--color-violet-700);
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(124, 58, 237, 0.4);
}

@media (max-width: 768px) {
    .cookie-consent-categories {
        grid-template-columns: 1fr;
    }
    
    .cookie-consent-actions {
        flex-direction: column;
    }
    
    .cookie-consent-actions button {
        width: 100%;
    }
    
    .cookie-settings-button {
        bottom: 1rem;
        left: 1rem;
        font-size: 0.75rem;
        padding: 0.5rem 1rem;
    }
}
</style>
`;

// Inject styles
document.head.insertAdjacentHTML('beforeend', cookieConsentStyles);