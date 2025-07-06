// Main JavaScript for the website

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const navLinks = document.getElementById('nav-links');

    if (mobileMenuButton && navLinks) {
        mobileMenuButton.addEventListener('click', function() {
            navLinks.classList.toggle('active');
        });
    }

    // Initialize cookie consent
    initCookieConsent();

    // Load popular articles in footer
    loadPopularArticles();

    // Add smooth scrolling
    initSmoothScrolling();

    // Initialize animations on scroll
    initScrollAnimations();
});

// Cookie consent management - moved to cookie-consent.js
function initCookieConsent() {
    // Legacy function kept for compatibility
    // New cookie consent system handles this automatically
}

// Load popular articles for footer
async function loadPopularArticles() {
    try {
        const articles = await supabaseClient.getArticles({ limit: 5 });
        const popularArticlesList = document.getElementById('popular-articles');
        
        if (popularArticlesList && articles.length > 0) {
            popularArticlesList.innerHTML = articles.map(article => `
                <li><a href="/${article.category}/${article.url_slug}.html" class="footer-link">
                    ${article.title}
                </a></li>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading popular articles:', error);
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all elements with animation classes
    document.querySelectorAll('.animate-fade-in, .animate-fade-up, .animate-scale-in').forEach(el => {
        observer.observe(el);
    });
}

// Utility function to create loading spinner
function createLoadingSpinner() {
    return '<div class="flex justify-center py-8"><div class="spinner"></div></div>';
}

// Utility function to show error message
function showError(message) {
    return `
        <div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
            <p>${message}</p>
        </div>
    `;
}

// Format number with German locale
function formatNumber(num) {
    return new Intl.NumberFormat('de-DE').format(num);
}

// Debounce function for search and other inputs
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Copy to clipboard functionality
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('In die Zwischenablage kopiert!');
        }).catch(err => {
            console.error('Failed to copy:', err);
        });
    } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('In die Zwischenablage kopiert!');
        } catch (err) {
            console.error('Failed to copy:', err);
        }
        document.body.removeChild(textArea);
    }
}

// Toast notification
function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background: var(--color-gray-900);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-xl);
        z-index: 1000;
        animation: fade-in 0.3s ease;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'fade-out 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, duration);
}

// Add fade-out animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fade-out {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    .cookie-consent {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        border-top: 1px solid var(--color-gray-200);
        padding: 1.5rem;
        box-shadow: var(--shadow-xl);
        z-index: 1000;
    }
    
    .cookie-content {
        max-width: 1280px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
    }
    
    .cookie-buttons {
        display: flex;
        gap: 1rem;
        flex-shrink: 0;
    }
    
    @media (max-width: 768px) {
        .cookie-content {
            flex-direction: column;
            text-align: center;
        }
    }
    
    .article-category-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: var(--radius-full);
        color: white;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }
    
    .article-card {
        display: block;
        text-decoration: none;
        color: inherit;
        height: 100%;
    }
    
    .article-card:hover {
        transform: translateY(-4px);
    }
    
    .nav-dropdown {
        position: relative;
    }
    
    .nav-dropdown-menu {
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border: 1px solid var(--color-gray-200);
        border-radius: var(--radius-lg);
        box-shadow: var(--shadow-lg);
        padding: 0.5rem 0;
        min-width: 200px;
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s ease;
    }
    
    .nav-dropdown:hover .nav-dropdown-menu {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
    }
    
    /* Additional styles for data visualizations */
    .bar-chart-bar {
        transition: opacity 0.3s ease;
    }
    
    .bar-chart-bar:hover {
        opacity: 1 !important;
    }
`;
document.head.appendChild(style);