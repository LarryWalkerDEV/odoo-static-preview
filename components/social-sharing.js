/**
 * Social Sharing Component - Modern sharing with analytics
 * Clean, performant social sharing buttons
 */

class SocialSharing {
  constructor(options = {}) {
    this.options = {
      container: options.container || '#social-sharing',
      url: options.url || window.location.href,
      title: options.title || document.title,
      description: options.description || this.getMetaDescription(),
      image: options.image || this.getMetaImage(),
      platforms: options.platforms || ['twitter', 'linkedin', 'facebook', 'whatsapp', 'email', 'copy'],
      style: options.style || 'default', // 'default', 'minimal', 'floating'
      position: options.position || 'article', // 'article', 'floating-left', 'floating-right'
      showLabels: options.showLabels !== false,
      showCount: options.showCount === true,
      trackShares: options.trackShares !== false,
      ...options
    };
    
    this.shareCount = 0;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    if (this.options.showCount) {
      this.loadShareCounts();
    }
  }

  getMetaDescription() {
    const meta = document.querySelector('meta[name="description"]') || 
                 document.querySelector('meta[property="og:description"]');
    return meta ? meta.content : '';
  }

  getMetaImage() {
    const meta = document.querySelector('meta[property="og:image"]') || 
                 document.querySelector('meta[name="twitter:image"]');
    return meta ? meta.content : '';
  }

  render() {
    const container = document.querySelector(this.options.container);
    if (!container) {
      console.warn(`Social sharing container "${this.options.container}" not found`);
      return;
    }

    const platforms = this.options.platforms.map(platform => this.renderPlatform(platform)).join('');
    
    container.innerHTML = `
      <div class="social-sharing ${this.options.style} ${this.options.position}">
        <div class="social-sharing-header">
          <h4 class="social-sharing-title">
            <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" class="social-sharing-icon">
              <path d="M4 12v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-8"/>
              <polyline points="16,6 12,2 8,6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
            Artikel teilen
          </h4>
          ${this.options.showCount ? `<span class="social-sharing-count">${this.shareCount} Mal geteilt</span>` : ''}
        </div>
        <div class="social-sharing-buttons">
          ${platforms}
        </div>
      </div>
    `;
  }

  renderPlatform(platform) {
    const config = this.getPlatformConfig(platform);
    if (!config) return '';

    const shareUrl = this.generateShareUrl(platform);
    const label = this.options.showLabels ? `<span class="social-button-label">${config.label}</span>` : '';
    
    return `
      <button 
        class="social-button social-${platform}" 
        data-platform="${platform}"
        data-url="${shareUrl}"
        title="${config.title}"
        aria-label="${config.title}"
      >
        ${config.icon}
        ${label}
      </button>
    `;
  }

  getPlatformConfig(platform) {
    const configs = {
      twitter: {
        label: 'Twitter',
        title: 'Auf Twitter teilen',
        icon: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
        </svg>`
      },
      linkedin: {
        label: 'LinkedIn',
        title: 'Auf LinkedIn teilen',
        icon: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>`
      },
      facebook: {
        label: 'Facebook',
        title: 'Auf Facebook teilen',
        icon: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>`
      },
      whatsapp: {
        label: 'WhatsApp',
        title: 'Über WhatsApp teilen',
        icon: `<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>`
      },
      email: {
        label: 'E-Mail',
        title: 'Per E-Mail teilen',
        icon: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>`
      },
      copy: {
        label: 'Link kopieren',
        title: 'Link in Zwischenablage kopieren',
        icon: `<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
        </svg>`
      }
    };

    return configs[platform];
  }

  generateShareUrl(platform) {
    const encodedUrl = encodeURIComponent(this.options.url);
    const encodedTitle = encodeURIComponent(this.options.title);
    const encodedDescription = encodeURIComponent(this.options.description);
    
    const urls = {
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedTitle} ${encodedUrl}`,
      email: `mailto:?subject=${encodedTitle}&body=${encodedDescription}%0A%0A${encodedUrl}`,
      copy: this.options.url
    };

    return urls[platform] || '';
  }

  bindEvents() {
    const container = document.querySelector(this.options.container);
    if (!container) return;

    container.addEventListener('click', (e) => {
      const button = e.target.closest('.social-button');
      if (!button) return;

      e.preventDefault();
      const platform = button.dataset.platform;
      const shareUrl = button.dataset.url;

      this.handleShare(platform, shareUrl, button);
    });
  }

  async handleShare(platform, shareUrl, button) {
    // Track share if enabled
    if (this.options.trackShares) {
      this.trackShare(platform);
    }

    // Handle different sharing methods
    switch (platform) {
      case 'copy':
        await this.copyToClipboard(shareUrl, button);
        break;
        
      case 'email':
        // Open email client
        window.location.href = shareUrl;
        break;
        
      default:
        // Open popup for social platforms
        this.openSharePopup(shareUrl, platform);
        break;
    }

    // Update share count
    this.incrementShareCount();
    
    // Add visual feedback
    this.showShareFeedback(button, platform);
  }

  async copyToClipboard(url, button) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      
      return true;
    } catch (err) {
      console.warn('Failed to copy to clipboard:', err);
      return false;
    }
  }

  openSharePopup(url, platform) {
    const width = 600;
    const height = 400;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    
    const popup = window.open(
      url,
      `share-${platform}`,
      `width=${width},height=${height},left=${left},top=${top},resizable=1,scrollbars=1`
    );
    
    if (popup) {
      popup.focus();
    } else {
      // Fallback if popup blocked
      window.open(url, '_blank');
    }
  }

  showShareFeedback(button, platform) {
    const originalContent = button.innerHTML;
    const originalClass = button.className;
    
    // Success feedback
    button.classList.add('shared');
    
    if (platform === 'copy') {
      button.innerHTML = `
        <svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <polyline points="20,6 9,17 4,12"/>
        </svg>
        ${this.options.showLabels ? '<span class="social-button-label">Kopiert!</span>' : ''}
      `;
    }
    
    // Reset after 2 seconds
    setTimeout(() => {
      button.innerHTML = originalContent;
      button.className = originalClass;
    }, 2000);
  }

  trackShare(platform) {
    // Analytics tracking
    if (typeof gtag !== 'undefined') {
      gtag('event', 'share', {
        'event_category': 'Social',
        'event_label': platform,
        'value': 1
      });
    }
    
    // Custom tracking callback
    if (typeof this.options.onShare === 'function') {
      this.options.onShare(platform, this.options.url);
    }
    
    console.log(`Shared via ${platform}:`, this.options.url);
  }

  incrementShareCount() {
    this.shareCount++;
    const countElement = document.querySelector('.social-sharing-count');
    if (countElement) {
      countElement.textContent = `${this.shareCount} Mal geteilt`;
    }
    
    // Store in localStorage for persistence
    try {
      const shares = JSON.parse(localStorage.getItem('articleShares') || '{}');
      shares[this.options.url] = (shares[this.options.url] || 0) + 1;
      localStorage.setItem('articleShares', JSON.stringify(shares));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  loadShareCounts() {
    try {
      const shares = JSON.parse(localStorage.getItem('articleShares') || '{}');
      this.shareCount = shares[this.options.url] || 0;
      
      const countElement = document.querySelector('.social-sharing-count');
      if (countElement) {
        countElement.textContent = `${this.shareCount} Mal geteilt`;
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  // Public methods
  updateOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
    this.render();
    this.bindEvents();
  }

  updateUrl(url, title, description) {
    this.options.url = url;
    this.options.title = title || this.options.title;
    this.options.description = description || this.options.description;
    this.render();
    this.bindEvents();
  }

  show() {
    const container = document.querySelector(this.options.container);
    if (container) {
      container.style.display = 'block';
    }
  }

  hide() {
    const container = document.querySelector(this.options.container);
    if (container) {
      container.style.display = 'none';
    }
  }
}

// Auto-initialize when DOM is ready
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if container exists
    if (document.querySelector('#social-sharing')) {
      window.socialSharing = new SocialSharing({
        showLabels: true,
        showCount: true,
        style: 'default'
      });
    }
  });
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SocialSharing;
}