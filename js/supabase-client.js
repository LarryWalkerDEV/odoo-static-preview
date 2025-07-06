// Supabase Configuration
const SUPABASE_URL = 'https://tbppogohivsxgiavbnvp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRicHBvZ29oaXZzeGdpYXZibnZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE0MjEwNTAsImV4cCI6MjA2Njk5NzA1MH0.HxaYiQpNoUoQ06XDPwgKh9VvjBaf0wQSqplmo1wKipM';

// Initialize Supabase client
let supabase;

// Load Supabase library dynamically
function loadSupabase() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
      supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
      resolve(supabase);
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

// Data fetching functions
const supabaseClient = {
  // Initialize the client
  async init() {
    if (!supabase) {
      await loadSupabase();
    }
    return supabase;
  },

  // Fetch all articles with optional filters
  async getArticles(filters = {}) {
    await this.init();
    
    let query = supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false });

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching articles:', error);
      return [];
    }
    
    return data;
  },

  // Fetch single article by slug
  async getArticleBySlug(slug) {
    await this.init();
    
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('url_slug', slug)
      .single();
    
    if (error) {
      console.error('Error fetching article:', error);
      return null;
    }
    
    return data;
  },

  // Fetch author by ID
  async getAuthor(authorId) {
    await this.init();
    
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .eq('id', authorId)
      .single();
    
    if (error) {
      console.error('Error fetching author:', error);
      return null;
    }
    
    return data;
  },

  // Fetch all authors
  async getAuthors() {
    await this.init();
    
    const { data, error } = await supabase
      .from('authors')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching authors:', error);
      return [];
    }
    
    return data;
  }
};

// Content rendering helpers
const contentHelpers = {
  // Parse JSON content to HTML
  parseContent(content) {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content.map(section => {
        if (typeof section === 'string') {
          return `<p>${section}</p>`;
        }
        
        let html = '';
        
        if (section.heading) {
          html += `<h2>${section.heading}</h2>`;
        }
        
        if (section.content) {
          if (Array.isArray(section.content)) {
            html += section.content.map(para => `<p>${para}</p>`).join('');
          } else {
            html += `<p>${section.content}</p>`;
          }
        }
        
        if (section.list) {
          html += '<ul>';
          section.list.forEach(item => {
            html += `<li>${item}</li>`;
          });
          html += '</ul>';
        }
        
        if (section.svg) {
          html += this.renderSVG(section.svg);
        }
        
        return html;
      }).join('');
    }

    return '<p>Content format not recognized</p>';
  },

  // Render SVG data visualizations
  renderSVG(svgData) {
    if (!svgData) return '';
    
    return `
      <div class="data-viz">
        <h3>${svgData.title || ''}</h3>
        ${this.createSVGChart(svgData)}
      </div>
    `;
  },

  // Create SVG charts based on data
  createSVGChart(data) {
    const { type = 'bar', values = [], labels = [], colors = [] } = data;
    const width = 600;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 60 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    if (type === 'bar') {
      const barWidth = chartWidth / values.length;
      const maxValue = Math.max(...values);
      
      let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
      svg += `<g transform="translate(${margin.left}, ${margin.top})">`;
      
      values.forEach((value, i) => {
        const barHeight = (value / maxValue) * chartHeight;
        const x = i * barWidth;
        const y = chartHeight - barHeight;
        const color = colors[i] || '#7c3aed';
        
        svg += `
          <rect x="${x + barWidth * 0.1}" y="${y}" 
                width="${barWidth * 0.8}" height="${barHeight}"
                fill="${color}" opacity="0.8"
                class="bar-chart-bar" />
          <text x="${x + barWidth / 2}" y="${chartHeight + 20}"
                text-anchor="middle" font-size="12" fill="#4b5563">
                ${labels[i] || ''}
          </text>
          <text x="${x + barWidth / 2}" y="${y - 5}"
                text-anchor="middle" font-size="12" fill="#4b5563">
                ${value}
          </text>
        `;
      });
      
      svg += '</g></svg>';
      return svg;
    }

    if (type === 'pie') {
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 40;
      const total = values.reduce((sum, val) => sum + val, 0);
      
      let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
      let currentAngle = -Math.PI / 2;
      
      values.forEach((value, i) => {
        const sliceAngle = (value / total) * 2 * Math.PI;
        const endAngle = currentAngle + sliceAngle;
        const color = colors[i] || `hsl(${i * 360 / values.length}, 70%, 60%)`;
        
        const x1 = centerX + radius * Math.cos(currentAngle);
        const y1 = centerY + radius * Math.sin(currentAngle);
        const x2 = centerX + radius * Math.cos(endAngle);
        const y2 = centerY + radius * Math.sin(endAngle);
        
        const largeArcFlag = sliceAngle > Math.PI ? 1 : 0;
        
        svg += `
          <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z"
                fill="${color}" opacity="0.8" stroke="white" stroke-width="2" />
        `;
        
        // Add label
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelX = centerX + (radius * 0.7) * Math.cos(labelAngle);
        const labelY = centerY + (radius * 0.7) * Math.sin(labelAngle);
        
        svg += `
          <text x="${labelX}" y="${labelY}" text-anchor="middle" 
                font-size="14" fill="white" font-weight="bold">
                ${labels[i] || ''} (${Math.round(value / total * 100)}%)
          </text>
        `;
        
        currentAngle = endAngle;
      });
      
      svg += '</svg>';
      return svg;
    }

    if (type === 'line') {
      const maxValue = Math.max(...values);
      const xStep = chartWidth / (values.length - 1);
      
      let svg = `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
      svg += `<g transform="translate(${margin.left}, ${margin.top})">`;
      
      // Create path data
      let pathData = 'M';
      values.forEach((value, i) => {
        const x = i * xStep;
        const y = chartHeight - (value / maxValue) * chartHeight;
        pathData += `${i === 0 ? '' : 'L'} ${x} ${y} `;
      });
      
      svg += `<path d="${pathData}" fill="none" stroke="#7c3aed" stroke-width="3" />`;
      
      // Add points and labels
      values.forEach((value, i) => {
        const x = i * xStep;
        const y = chartHeight - (value / maxValue) * chartHeight;
        
        svg += `
          <circle cx="${x}" cy="${y}" r="5" fill="#7c3aed" />
          <text x="${x}" y="${chartHeight + 20}" text-anchor="middle" 
                font-size="12" fill="#4b5563">
                ${labels[i] || ''}
          </text>
          <text x="${x}" y="${y - 10}" text-anchor="middle" 
                font-size="12" fill="#4b5563">
                ${value}
          </text>
        `;
      });
      
      svg += '</g></svg>';
      return svg;
    }

    return '<p>Chart type not supported</p>';
  },

  // Format date
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Create article card HTML
  createArticleCard(article) {
    const categoryColors = {
      'odoo': 'from-violet-600 to-purple-600',
      'odoo-19': 'from-purple-600 to-pink-600',
      'odoo-hosting': 'from-blue-600 to-cyan-600'
    };

    const gradientClass = categoryColors[article.category] || categoryColors['odoo'];

    return `
      <a href="/${article.category}/${article.url_slug}.html" class="card article-card">
        <div class="article-card-category">
          <span class="article-category-badge" style="background: linear-gradient(to right, var(--color-violet-600), var(--color-purple-600))">
            ${article.category ? article.category.replace('-', ' ').toUpperCase() : 'ODOO'}
          </span>
        </div>
        <h3 class="text-xl font-semibold mb-4">${article.title}</h3>
        <p class="text-gray-600 mb-4">${article.meta_description}</p>
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500">${article.word_count} Wörter</span>
          <span class="text-sm text-gray-500">${this.formatDate(article.created_at)}</span>
        </div>
      </a>
    `;
  },

  // Create author EEAT box
  createAuthorBox(author) {
    if (!author) return '';

    const socialLinks = author.social_links || {};
    
    return `
      <div class="author-box">
        <div class="author-info">
          ${author.image_url ? `
            <img src="${author.image_url}" alt="${author.name}" class="author-image">
          ` : `
            <div class="author-image" style="background-color: var(--color-gray-200);"></div>
          `}
          <div class="author-details">
            <h3>${author.name}</h3>
            <p class="author-title">${author.title || 'Odoo Experte'}</p>
            <p class="text-gray-600">${author.bio || ''}</p>
            
            ${author.experience ? `
              <div class="mt-4">
                <h4 class="font-semibold mb-2">Erfahrung</h4>
                <p class="text-sm text-gray-600">${author.experience}</p>
              </div>
            ` : ''}
            
            ${author.expertise ? `
              <div class="mt-4">
                <h4 class="font-semibold mb-2">Expertise</h4>
                <p class="text-sm text-gray-600">${author.expertise}</p>
              </div>
            ` : ''}
            
            ${Object.keys(socialLinks).length > 0 ? `
              <div class="mt-4 flex gap-4">
                ${socialLinks.linkedin ? `
                  <a href="${socialLinks.linkedin}" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-violet-600">
                    LinkedIn
                  </a>
                ` : ''}
                ${socialLinks.twitter ? `
                  <a href="${socialLinks.twitter}" target="_blank" rel="noopener noreferrer" class="text-gray-600 hover:text-violet-600">
                    Twitter
                  </a>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }
};

// Export for use in other scripts
window.supabaseClient = supabaseClient;
window.contentHelpers = contentHelpers;