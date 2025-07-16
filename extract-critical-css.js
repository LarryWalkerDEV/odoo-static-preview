const fs = require('fs');
const path = require('path');

// Critical CSS for above-the-fold content
const criticalCSS = `
/* Critical CSS - Inline this in <head> */
:root {
  --color-primary: #7c3aed;
  --color-violet-50: #f5f3ff;
  --color-violet-100: #ede9fe;
  --color-violet-600: #7c3aed;
  --color-violet-700: #6d28d9;
  --color-purple-600: #9333ea;
  --color-pink-600: #db2777;
  --color-blue-600: #2563eb;
  --color-cyan-600: #0891b2;
  --color-gray-50: #f9fafb;
  --color-gray-100: #f3f4f6;
  --color-gray-600: #4b5563;
  --color-gray-700: #374151;
  --color-gray-800: #1f2937;
  --color-gray-900: #111827;
  --color-green-500: #22c55e;
  --color-yellow-400: #facc15;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: Inter, system-ui, -apple-system, sans-serif;
  line-height: 1.5;
  color: var(--color-gray-900);
  -webkit-font-smoothing: antialiased;
  background: #fff;
}

/* Navigation - Critical */
.nav {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(229, 231, 235, 0.8);
  position: sticky;
  top: 0;
  z-index: 40;
  height: 4rem;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 1.5rem;
}

.nav-logo {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--color-gray-900);
  text-decoration: none;
}

.nav-logo img {
  height: 2.5rem;
  width: 2.5rem;
  margin-right: 0.75rem;
}

/* Hero Section - Critical */
.hero {
  background: linear-gradient(135deg, var(--color-violet-50) 0%, rgba(147, 51, 234, 0.05) 100%);
  position: relative;
  overflow: hidden;
  padding: 5rem 0;
}

.container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

h1, h2, h3 {
  margin: 0;
  font-weight: 700;
  line-height: 1.2;
}

h1 {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.text-gray-600 {
  color: var(--color-gray-600);
}

.text-xl {
  font-size: 1.25rem;
  line-height: 1.75rem;
}

/* Buttons - Critical */
.btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  border-radius: 0.5rem;
  text-decoration: none;
  transition: all 0.2s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-violet-600) 0%, var(--color-purple-600) 100%);
  color: white;
}

.btn-secondary {
  background: white;
  color: var(--color-violet-600);
  border: 2px solid var(--color-violet-100);
}

/* Grid System - Critical */
.grid {
  display: grid;
}

.grid-cols-1 {
  grid-template-columns: repeat(1, minmax(0, 1fr));
}

@media (min-width: 768px) {
  h1 {
    font-size: 4rem;
  }
  
  .grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

/* Mobile Menu Button */
.mobile-menu-button {
  display: block;
  background: transparent;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: var(--color-gray-700);
}

@media (min-width: 768px) {
  .mobile-menu-button {
    display: none;
  }
}

/* Hide elements until full CSS loads */
.animate-fade-up {
  opacity: 0;
  transform: translateY(20px);
}
`;

// Function to inline critical CSS and defer main CSS
function optimizeCSS() {
  const htmlFiles = [
    'index.html',
    'odoo-hosting-rechner.html',
    'impressum.html',
    'datenschutz.html',
    'cookie-richtlinien.html'
  ];
  
  // Create minified critical CSS
  const minifiedCritical = criticalCSS
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .replace(/\s*{\s*/g, '{') // Remove spaces around {
    .replace(/\s*}\s*/g, '}') // Remove spaces around }
    .replace(/\s*:\s*/g, ':') // Remove spaces around :
    .replace(/\s*;\s*/g, ';') // Remove spaces around ;
    .replace(/;\s*}/g, '}') // Remove unnecessary semicolons
    .trim();
  
  let updatedFiles = 0;
  
  htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Check if already has critical CSS
      if (content.includes('/* Critical CSS')) {
        console.log(`${file} already has critical CSS`);
        return;
      }
      
      // Find the styles.css link
      const cssLinkRegex = /<link\s+rel="stylesheet"\s+href="\/css\/styles\.css">/i;
      
      if (cssLinkRegex.test(content)) {
        // Replace with critical CSS inline + deferred loading
        const replacement = `<style>${minifiedCritical}</style>
    <link rel="preload" href="/css/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
    <noscript><link rel="stylesheet" href="/css/styles.css"></noscript>`;
        
        content = content.replace(cssLinkRegex, replacement);
        
        if (content !== originalContent) {
          fs.writeFileSync(file, content);
          updatedFiles++;
          console.log(`Updated: ${file}`);
        }
      }
    }
  });
  
  console.log(`\nTotal files updated: ${updatedFiles}`);
  
  // Create a separate critical CSS file for reference
  fs.writeFileSync('css/critical.css', criticalCSS);
  console.log('\nCreated css/critical.css for reference');
  
  // Also create an optimized loading snippet
  const loadingSnippet = `<!-- Optimized CSS Loading -->
<style>${minifiedCritical}</style>
<link rel="preload" href="/css/styles.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/css/styles.css"></noscript>`;
  
  fs.writeFileSync('css-loading-snippet.html', loadingSnippet);
  console.log('Created css-loading-snippet.html with optimized loading code');
}

// Run the optimization
optimizeCSS();