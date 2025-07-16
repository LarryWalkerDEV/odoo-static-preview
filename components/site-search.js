/**
 * Site Search Component - Instant Search with Fuzzy Matching
 * Standalone component for searching through 200+ articles
 */

class SiteSearch {
  constructor(options = {}) {
    this.options = {
      searchInput: options.searchInput || '#search-input',
      searchResults: options.searchResults || '#search-results',
      searchOverlay: options.searchOverlay || '#search-overlay',
      openButton: options.openButton || '#search-button',
      closeButton: options.closeButton || '#search-close',
      minChars: options.minChars || 2,
      maxResults: options.maxResults || 10,
      ...options
    };
    
    this.articles = [];
    this.isOpen = false;
    this.currentIndex = -1;
    
    this.init();
  }

  init() {
    this.createSearchInterface();
    this.bindEvents();
    this.loadArticles();
  }

  createSearchInterface() {
    // Create search overlay if it doesn't exist
    if (!document.querySelector(this.options.searchOverlay)) {
      const overlay = document.createElement('div');
      overlay.id = 'search-overlay';
      overlay.className = 'search-overlay';
      overlay.innerHTML = `
        <div class="search-modal">
          <div class="search-header">
            <div class="search-input-container">
              <svg class="search-icon" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              <input 
                type="text" 
                id="search-input" 
                class="search-input" 
                placeholder="Suche in 200+ Odoo-Artikeln..." 
                autocomplete="off"
              >
              <kbd class="search-shortcut">ESC</kbd>
            </div>
            <button id="search-close" class="search-close" aria-label="Suche schließen">
              <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="search-body">
            <div id="search-results" class="search-results"></div>
            <div class="search-footer">
              <div class="search-tips">
                <kbd>↑</kbd><kbd>↓</kbd> Navigation • <kbd>Enter</kbd> Öffnen • <kbd>ESC</kbd> Schließen
              </div>
            </div>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
    }

    // Add search button to navigation if it doesn't exist
    if (!document.querySelector(this.options.openButton)) {
      const navLinks = document.querySelector('.nav-links');
      if (navLinks) {
        const searchButton = document.createElement('li');
        searchButton.innerHTML = `
          <button id="search-button" class="nav-search-button" aria-label="Suche öffnen">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <span class="search-text">Suchen</span>
            <kbd class="search-kbd">⌘K</kbd>
          </button>
        `;
        navLinks.appendChild(searchButton);
      }
    }
  }

  bindEvents() {
    // Search button click
    const openButton = document.querySelector(this.options.openButton);
    if (openButton) {
      openButton.addEventListener('click', () => this.openSearch());
    }

    // Close button click
    const closeButton = document.querySelector(this.options.closeButton);
    if (closeButton) {
      closeButton.addEventListener('click', () => this.closeSearch());
    }

    // Overlay click to close
    const overlay = document.querySelector(this.options.searchOverlay);
    if (overlay) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.closeSearch();
      });
    }

    // Search input
    const searchInput = document.querySelector(this.options.searchInput);
    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
      searchInput.addEventListener('keydown', (e) => this.handleKeydown(e));
    }

    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Cmd/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearch();
      }
      
      // Escape to close
      if (e.key === 'Escape' && this.isOpen) {
        this.closeSearch();
      }
    });
  }

  async loadArticles() {
    try {
      // Try to load from sitemap or create article index
      const response = await fetch('/sitemap.xml');
      if (response.ok) {
        const sitemap = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(sitemap, 'text/xml');
        const urls = xmlDoc.querySelectorAll('url loc');
        
        this.articles = Array.from(urls)
          .map(url => url.textContent)
          .filter(url => url.includes('/odoo/') || url.includes('/odoo-hosting/') || url.includes('/odoo-19/'))
          .map(url => {
            const path = new URL(url).pathname;
            const slug = path.split('/').pop().replace('.html', '');
            const category = path.includes('/odoo-19/') ? 'Odoo 19' : 
                           path.includes('/odoo-hosting/') ? 'Hosting' : 'Odoo';
            
            return {
              title: this.slugToTitle(slug),
              url: url,
              category: category,
              slug: slug,
              searchText: this.createSearchText(slug, category)
            };
          });
      } else {
        // Fallback: manually create common articles
        this.articles = this.createFallbackArticles();
      }
    } catch (error) {
      console.warn('Could not load articles for search:', error);
      this.articles = this.createFallbackArticles();
    }
  }

  slugToTitle(slug) {
    return slug
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
      .replace(/\bodoo\b/gi, 'Odoo')
      .replace(/\berp\b/gi, 'ERP')
      .replace(/\bsap\b/gi, 'SAP');
  }

  createSearchText(slug, category) {
    const keywords = {
      'odoo': ['erp', 'business', 'software', 'unternehmen', 'management'],
      'hosting': ['server', 'cloud', 'anbieter', 'kosten', 'performance'],
      'kosten': ['preis', 'lizenz', 'investition', 'budget'],
      'migration': ['wechsel', 'umstellung', 'upgrade', 'transfer'],
      'implementierung': ['einführung', 'setup', 'konfiguration', 'installation'],
      'vs': ['vergleich', 'unterschied', 'gegenüberstellung'],
      'training': ['schulung', 'kurs', 'weiterbildung', 'lernen'],
      'partner': ['anbieter', 'dienstleister', 'experte', 'consultant']
    };

    let searchText = `${this.slugToTitle(slug)} ${category}`;
    
    Object.keys(keywords).forEach(key => {
      if (slug.includes(key)) {
        searchText += ' ' + keywords[key].join(' ');
      }
    });

    return searchText.toLowerCase();
  }

  createFallbackArticles() {
    const categories = [
      { name: 'Odoo', prefix: '/odoo/' },
      { name: 'Hosting', prefix: '/odoo-hosting/' },
      { name: 'Odoo 19', prefix: '/odoo-19/' }
    ];

    const commonTopics = [
      'was-ist-odoo', 'odoo-kosten', 'odoo-vs-sap', 'odoo-implementierung',
      'odoo-training', 'odoo-partner', 'odoo-hosting-deutschland',
      'odoo-hosting-kosten', 'beste-odoo-hosting', 'odoo-19-features',
      'odoo-19-update', 'odoo-migration', 'odoo-backup', 'odoo-security'
    ];

    return categories.flatMap(category => 
      commonTopics.map(topic => ({
        title: this.slugToTitle(topic),
        url: `https://odoo-experten-deutschland.de${category.prefix}${topic}.html`,
        category: category.name,
        slug: topic,
        searchText: this.createSearchText(topic, category.name)
      }))
    );
  }

  handleSearch(query) {
    const resultsContainer = document.querySelector(this.options.searchResults);
    
    if (query.length < this.options.minChars) {
      resultsContainer.innerHTML = `
        <div class="search-empty">
          <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
          <p>Geben Sie mindestens ${this.options.minChars} Zeichen ein</p>
        </div>
      `;
      return;
    }

    const results = this.searchArticles(query);
    this.currentIndex = -1;
    
    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div class="search-empty">
          <svg width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="3"/>
            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
          </svg>
          <p>Keine Artikel gefunden für "<strong>${this.escapeHtml(query)}</strong>"</p>
          <small>Versuchen Sie andere Suchbegriffe wie "Hosting", "Kosten" oder "Migration"</small>
        </div>
      `;
      return;
    }

    resultsContainer.innerHTML = results.map((article, index) => `
      <a href="${article.url}" class="search-result" data-index="${index}">
        <div class="search-result-category">${article.category}</div>
        <div class="search-result-title">${this.highlightText(article.title, query)}</div>
        <div class="search-result-url">${article.url}</div>
      </a>
    `).join('');
  }

  searchArticles(query) {
    const normalizedQuery = query.toLowerCase().trim();
    const words = normalizedQuery.split(/\s+/);
    
    return this.articles
      .map(article => {
        let score = 0;
        const titleLower = article.title.toLowerCase();
        const searchTextLower = article.searchText.toLowerCase();
        
        // Exact title match gets highest score
        if (titleLower.includes(normalizedQuery)) {
          score += 100;
        }
        
        // Word matches in title
        words.forEach(word => {
          if (titleLower.includes(word)) score += 50;
          if (searchTextLower.includes(word)) score += 10;
        });
        
        // Category boost
        if (article.category.toLowerCase().includes(normalizedQuery)) {
          score += 30;
        }
        
        // Fuzzy matching for typos
        if (this.fuzzyMatch(normalizedQuery, titleLower)) {
          score += 20;
        }
        
        return { ...article, score };
      })
      .filter(article => article.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, this.options.maxResults);
  }

  fuzzyMatch(query, text) {
    // Simple fuzzy matching for typos
    if (query.length < 3) return false;
    
    let queryIndex = 0;
    for (let i = 0; i < text.length && queryIndex < query.length; i++) {
      if (text[i] === query[queryIndex]) {
        queryIndex++;
      }
    }
    return queryIndex === query.length;
  }

  highlightText(text, query) {
    const words = query.toLowerCase().split(/\s+/);
    let highlighted = text;
    
    words.forEach(word => {
      const regex = new RegExp(`(${this.escapeRegex(word)})`, 'gi');
      highlighted = highlighted.replace(regex, '<mark>$1</mark>');
    });
    
    return highlighted;
  }

  handleKeydown(e) {
    const results = document.querySelectorAll('.search-result');
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.currentIndex = Math.min(this.currentIndex + 1, results.length - 1);
        this.updateSelection(results);
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        this.currentIndex = Math.max(this.currentIndex - 1, -1);
        this.updateSelection(results);
        break;
        
      case 'Enter':
        e.preventDefault();
        if (this.currentIndex >= 0 && results[this.currentIndex]) {
          results[this.currentIndex].click();
        }
        break;
    }
  }

  updateSelection(results) {
    results.forEach((result, index) => {
      result.classList.toggle('active', index === this.currentIndex);
    });
    
    if (this.currentIndex >= 0 && results[this.currentIndex]) {
      results[this.currentIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  openSearch() {
    const overlay = document.querySelector(this.options.searchOverlay);
    const input = document.querySelector(this.options.searchInput);
    
    if (overlay && input) {
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.isOpen = true;
      
      setTimeout(() => {
        input.focus();
      }, 100);
    }
  }

  closeSearch() {
    const overlay = document.querySelector(this.options.searchOverlay);
    const input = document.querySelector(this.options.searchInput);
    
    if (overlay) {
      overlay.classList.remove('active');
      document.body.style.overflow = '';
      this.isOpen = false;
      
      if (input) {
        input.value = '';
        input.blur();
      }
      
      const results = document.querySelector(this.options.searchResults);
      if (results) {
        results.innerHTML = '';
      }
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    window.siteSearch = new SiteSearch();
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SiteSearch;
}