/**
 * Related Articles Widget - Smart Content Recommendations
 * Analyzes current article and suggests relevant content
 */

class RelatedArticles {
  constructor(options = {}) {
    this.options = {
      container: options.container || '#related-articles',
      maxArticles: options.maxArticles || 3,
      categories: options.categories || ['odoo', 'odoo-hosting', 'odoo-19'],
      excludeCurrent: options.excludeCurrent !== false,
      showCategory: options.showCategory !== false,
      showExcerpt: options.showExcerpt !== false,
      ...options
    };
    
    this.currentArticle = this.getCurrentArticleInfo();
    this.allArticles = [];
    
    this.init();
  }

  init() {
    this.loadArticles().then(() => {
      this.render();
    });
  }

  getCurrentArticleInfo() {
    const path = window.location.pathname;
    const url = window.location.href;
    
    // Extract category and slug from URL
    let category = 'odoo';
    let slug = '';
    
    if (path.includes('/odoo-19/')) {
      category = 'odoo-19';
      slug = path.split('/odoo-19/')[1]?.replace('.html', '') || '';
    } else if (path.includes('/odoo-hosting/')) {
      category = 'odoo-hosting';
      slug = path.split('/odoo-hosting/')[1]?.replace('.html', '') || '';
    } else if (path.includes('/odoo/')) {
      category = 'odoo';
      slug = path.split('/odoo/')[1]?.replace('.html', '') || '';
    }

    // Extract keywords from current page
    const title = document.title;
    const metaDescription = document.querySelector('meta[name="description"]')?.content || '';
    const h1 = document.querySelector('h1')?.textContent || '';
    
    return {
      url,
      path,
      category,
      slug,
      title,
      description: metaDescription,
      h1,
      keywords: this.extractKeywords(title, metaDescription, h1, slug)
    };
  }

  extractKeywords(title, description, h1, slug) {
    const text = `${title} ${description} ${h1} ${slug}`.toLowerCase();
    
    // German Odoo-specific keywords
    const keywords = {
      // Main categories
      'hosting': ['hosting', 'server', 'cloud', 'anbieter', 'provider', 'infrastructure'],
      'kosten': ['kosten', 'preis', 'lizenz', 'budget', 'investition', 'tco', 'price', 'cost'],
      'implementation': ['implementierung', 'einführung', 'installation', 'setup', 'deployment'],
      'migration': ['migration', 'wechsel', 'umstellung', 'upgrade', 'transfer'],
      'training': ['training', 'schulung', 'kurs', 'weiterbildung', 'lernen'],
      'security': ['sicherheit', 'security', 'schutz', 'datenschutz', 'backup'],
      'performance': ['performance', 'geschwindigkeit', 'optimierung', 'speed'],
      'integration': ['integration', 'schnittstelle', 'api', 'connector'],
      'erp': ['erp', 'enterprise', 'business', 'unternehmen', 'management'],
      'modules': ['module', 'app', 'funktionen', 'features', 'add-on'],
      'comparison': ['vergleich', 'vs', 'unterschied', 'gegenüberstellung'],
      'business': ['business', 'geschäft', 'firma', 'unternehmen', 'betrieb'],
      'ai': ['ai', 'ki', 'künstliche intelligenz', 'machine learning', 'automation'],
      'mobile': ['mobile', 'app', 'smartphone', 'tablet', 'responsive']
    };

    const foundKeywords = [];
    
    Object.keys(keywords).forEach(category => {
      keywords[category].forEach(keyword => {
        if (text.includes(keyword)) {
          foundKeywords.push(category);
        }
      });
    });

    return [...new Set(foundKeywords)]; // Remove duplicates
  }

  async loadArticles() {
    try {
      // Try to load from sitemap
      const response = await fetch('/sitemap.xml');
      if (response.ok) {
        const sitemap = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(sitemap, 'text/xml');
        const urls = xmlDoc.querySelectorAll('url loc');
        
        this.allArticles = Array.from(urls)
          .map(url => url.textContent)
          .filter(url => this.options.categories.some(cat => url.includes(`/${cat}/`)))
          .map(url => this.parseArticleFromUrl(url))
          .filter(article => article !== null);
      } else {
        this.allArticles = this.createFallbackArticles();
      }
    } catch (error) {
      console.warn('Could not load articles for related widget:', error);
      this.allArticles = this.createFallbackArticles();
    }
  }

  parseArticleFromUrl(url) {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      
      let category = 'odoo';
      let slug = '';
      
      if (path.includes('/odoo-19/')) {
        category = 'odoo-19';
        slug = path.split('/odoo-19/')[1]?.replace('.html', '') || '';
      } else if (path.includes('/odoo-hosting/')) {
        category = 'odoo-hosting';
        slug = path.split('/odoo-hosting/')[1]?.replace('.html', '') || '';
      } else if (path.includes('/odoo/')) {
        category = 'odoo';
        slug = path.split('/odoo/')[1]?.replace('.html', '') || '';
      }

      if (!slug) return null;

      const title = this.slugToTitle(slug);
      const keywords = this.extractKeywords('', '', '', slug);
      
      return {
        url,
        path,
        category,
        slug,
        title,
        keywords,
        categoryDisplay: this.getCategoryDisplay(category),
        excerpt: this.generateExcerpt(slug, category)
      };
    } catch (error) {
      return null;
    }
  }

  slugToTitle(slug) {
    return slug
      .split('-')
      .map(word => {
        // Special cases for better titles
        const specialWords = {
          'odoo': 'Odoo',
          'erp': 'ERP',
          'sap': 'SAP',
          'api': 'API',
          'seo': 'SEO',
          'crm': 'CRM',
          'hr': 'HR',
          'pos': 'POS',
          'kmu': 'KMU',
          'dsgvo': 'DSGVO',
          'vs': 'vs.',
          'ai': 'AI',
          'ki': 'KI'
        };
        
        return specialWords[word.toLowerCase()] || 
               word.charAt(0).toUpperCase() + word.slice(1);
      })
      .join(' ');
  }

  getCategoryDisplay(category) {
    const categoryMap = {
      'odoo': 'Odoo Grundlagen',
      'odoo-hosting': 'Hosting',
      'odoo-19': 'Odoo 19'
    };
    return categoryMap[category] || 'Odoo';
  }

  generateExcerpt(slug, category) {
    // Generate contextual excerpts based on article type
    const excerpts = {
      'kosten': 'Erfahren Sie alles über Preise, Lizenzmodelle und versteckte Kosten.',
      'hosting': 'Vergleichen Sie Hosting-Anbieter und finden Sie die beste Lösung.',
      'implementierung': 'Schritt-für-Schritt Anleitung für eine erfolgreiche Einführung.',
      'migration': 'Sicherer Wechsel zu Odoo ohne Datenverlust und Ausfallzeiten.',
      'training': 'Professionelle Schulungen für Ihr Team und nachhaltigen Erfolg.',
      'vs': 'Detaillierter Vergleich mit Vor- und Nachteilen aller Optionen.',
      'security': 'Sicherheitsmaßnahmen und Best Practices für Ihr Odoo System.',
      'backup': 'Zuverlässige Backup-Strategien für maximale Datensicherheit.',
      'partner': 'Finden Sie den richtigen Odoo-Partner für Ihr Projekt.',
      'features': 'Entdecken Sie neue Funktionen und Verbesserungen im Detail.'
    };

    // Find matching excerpt
    for (const [key, excerpt] of Object.entries(excerpts)) {
      if (slug.includes(key)) {
        return excerpt;
      }
    }

    // Category-based fallbacks
    if (category === 'odoo-19') {
      return 'Neue Features und Verbesserungen in der aktuellen Odoo Version.';
    } else if (category === 'odoo-hosting') {
      return 'Hosting-Lösungen und Infrastruktur für Ihr Odoo System.';
    }

    return 'Fundierte Informationen und Expertenwissen zu Odoo ERP.';
  }

  createFallbackArticles() {
    const fallbackData = [
      { category: 'odoo', slug: 'was-ist-odoo', priority: 10 },
      { category: 'odoo', slug: 'odoo-kosten', priority: 9 },
      { category: 'odoo', slug: 'odoo-vs-sap-vergleich', priority: 8 },
      { category: 'odoo', slug: 'odoo-implementierung', priority: 7 },
      { category: 'odoo-hosting', slug: 'odoo-hosting-deutschland', priority: 9 },
      { category: 'odoo-hosting', slug: 'beste-odoo-hosting', priority: 8 },
      { category: 'odoo-hosting', slug: 'odoo-hosting-kosten', priority: 7 },
      { category: 'odoo-19', slug: 'odoo-19-neue-features', priority: 9 },
      { category: 'odoo-19', slug: 'odoo-19-vs-18-vergleich', priority: 8 },
      { category: 'odoo', slug: 'odoo-training', priority: 6 },
      { category: 'odoo', slug: 'odoo-migration', priority: 6 },
      { category: 'odoo', slug: 'odoo-security', priority: 5 }
    ];

    return fallbackData.map(item => {
      const url = `https://odoo-experten-deutschland.de/${item.category}/${item.slug}.html`;
      return {
        ...this.parseArticleFromUrl(url),
        priority: item.priority
      };
    }).filter(article => article !== null);
  }

  findRelatedArticles() {
    let candidates = this.allArticles.slice();

    // Exclude current article
    if (this.options.excludeCurrent && this.currentArticle.url) {
      candidates = candidates.filter(article => article.url !== this.currentArticle.url);
    }

    // Score articles based on relevance
    const scoredArticles = candidates.map(article => {
      let score = 0;

      // Same category gets moderate boost
      if (article.category === this.currentArticle.category) {
        score += 30;
      }

      // Keyword matching
      const commonKeywords = article.keywords.filter(keyword => 
        this.currentArticle.keywords.includes(keyword)
      );
      score += commonKeywords.length * 20;

      // Title similarity (simple word matching)
      const currentWords = this.currentArticle.title.toLowerCase().split(/\s+/);
      const articleWords = article.title.toLowerCase().split(/\s+/);
      const commonWords = currentWords.filter(word => 
        word.length > 3 && articleWords.includes(word)
      );
      score += commonWords.length * 15;

      // Boost certain combinations
      if (this.currentArticle.category === 'odoo' && article.category === 'odoo-hosting') {
        score += 25; // Implementation + Hosting
      }
      if (this.currentArticle.category === 'odoo-hosting' && article.category === 'odoo') {
        score += 25; // Hosting + Implementation
      }
      if (article.category === 'odoo-19') {
        score += 10; // Slight boost for newest content
      }

      // Priority boost for fallback articles
      if (article.priority) {
        score += article.priority;
      }

      return { ...article, relevanceScore: score };
    });

    // Sort by relevance and return top articles
    return scoredArticles
      .filter(article => article.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, this.options.maxArticles);
  }

  render() {
    const container = document.querySelector(this.options.container);
    if (!container) {
      console.warn(`Related articles container "${this.options.container}" not found`);
      return;
    }

    const relatedArticles = this.findRelatedArticles();
    
    if (relatedArticles.length === 0) {
      container.style.display = 'none';
      return;
    }

    container.innerHTML = `
      <div class="related-articles-widget">
        <div class="related-articles-header">
          <h3 class="related-articles-title">
            <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" class="related-articles-icon">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            Ähnliche Artikel
          </h3>
        </div>
        <div class="related-articles-grid">
          ${relatedArticles.map(article => this.renderArticleCard(article)).join('')}
        </div>
      </div>
    `;
  }

  renderArticleCard(article) {
    return `
      <article class="related-article-card">
        <a href="${article.url}" class="related-article-link">
          ${this.options.showCategory ? `
            <div class="related-article-category">${article.categoryDisplay}</div>
          ` : ''}
          <h4 class="related-article-title">${article.title}</h4>
          ${this.options.showExcerpt ? `
            <p class="related-article-excerpt">${article.excerpt}</p>
          ` : ''}
          <div class="related-article-meta">
            <span class="related-article-cta">Artikel lesen</span>
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" class="related-article-arrow">
              <line x1="7" y1="17" x2="17" y2="7"/>
              <polyline points="7,7 17,7 17,17"/>
            </svg>
          </div>
        </a>
      </article>
    `;
  }

  // Public method to refresh recommendations
  refresh() {
    this.currentArticle = this.getCurrentArticleInfo();
    this.render();
  }

  // Public method to update options
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.render();
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if container exists
    if (document.querySelector('#related-articles')) {
      window.relatedArticles = new RelatedArticles({
        showCategory: true,
        showExcerpt: true
      });
    }
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = RelatedArticles;
}