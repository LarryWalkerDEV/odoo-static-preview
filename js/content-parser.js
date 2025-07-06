// Content parser for Supabase article data
function parseSupabaseContent(content) {
  if (!content || typeof content !== 'object') {
    return '<p>No content available</p>';
  }

  let html = '';

  // Add hook/intro paragraph
  if (content.hook) {
    html += `<div class="intro-paragraph">${content.hook}</div>`;
  }

  // Add quick overview if available
  if (content.quick_overview && Array.isArray(content.quick_overview)) {
    html += '<div class="quick-overview">';
    html += '<h2>Auf einen Blick:</h2>';
    html += '<ul class="overview-list">';
    content.quick_overview.forEach(item => {
      html += `<li>${item}</li>`;
    });
    html += '</ul>';
    html += '</div>';
  }

  // Process content sections
  if (content.content_sections && Array.isArray(content.content_sections)) {
    content.content_sections.forEach((section, index) => {
      html += '<section class="content-section">';
      
      // Add heading
      if (section.heading) {
        html += `<h2>${section.heading}</h2>`;
      }
      
      // Add content
      if (section.content) {
        html += `<div class="section-content">${section.content}</div>`;
      }
      
      // Add SVG visualization if present
      if (section.svg_placeholder) {
        html += '<div class="data-visualization">';
        html += parseSVGPlaceholder(section.svg_placeholder, index);
        html += '</div>';
      }
      
      // Add internal links
      if (section.internal_links && section.internal_links.length > 0) {
        html += '<div class="internal-links">';
        html += '<h3>Weiterführende Artikel:</h3>';
        html += '<ul>';
        section.internal_links.forEach(link => {
          html += `<li><a href="${link.url}" class="internal-link">${link.anchor}</a></li>`;
        });
        html += '</ul>';
        html += '</div>';
      }
      
      // Add external links
      if (section.external_links && section.external_links.length > 0) {
        html += '<div class="external-links">';
        html += '<h3>Externe Ressourcen:</h3>';
        html += '<ul>';
        section.external_links.forEach(link => {
          html += `<li><a href="${link.url}" target="_blank" rel="${link.rel || 'dofollow'}" class="external-link">${link.anchor}</a></li>`;
        });
        html += '</ul>';
        html += '</div>';
      }
      
      html += '</section>';
    });
  }

  // Add conclusion
  if (content.conclusion) {
    html += '<div class="conclusion">';
    html += '<h2>Fazit</h2>';
    html += `<p>${content.conclusion}</p>`;
    html += '</div>';
  }

  return html;
}

// Parse SVG placeholders and create proper charts
function parseSVGPlaceholder(svgString, index) {
  // If it's already an SVG string, clean it up and return
  if (svgString.includes('<svg')) {
    return svgString
      .replace(/class='([^']+)'/g, 'class="$1"')
      .replace(/fill='([^']+)'/g, 'fill="$1"')
      .replace(/stroke='([^']+)'/g, 'stroke="$1"')
      .replace(/rx='([^']+)'/g, 'rx="$1"');
  }
  
  // Otherwise create a default chart
  return createDefaultChart(index);
}

// Create a default chart visualization
function createDefaultChart(index) {
  const chartTypes = ['bar', 'pie', 'line'];
  const type = chartTypes[index % 3];
  
  if (type === 'bar') {
    return `
      <svg width="600" height="400" viewBox="0 0 600 400" class="w-full h-auto">
        <rect x="60" y="150" width="80" height="200" fill="#7c3aed" opacity="0.8" rx="4"/>
        <rect x="180" y="100" width="80" height="250" fill="#8b5cf6" opacity="0.8" rx="4"/>
        <rect x="300" y="80" width="80" height="270" fill="#06b6d4" opacity="0.8" rx="4"/>
        <rect x="420" y="120" width="80" height="230" fill="#10b981" opacity="0.8" rx="4"/>
        
        <text x="100" y="370" text-anchor="middle" class="text-sm fill-gray-600">Q1 2024</text>
        <text x="220" y="370" text-anchor="middle" class="text-sm fill-gray-600">Q2 2024</text>
        <text x="340" y="370" text-anchor="middle" class="text-sm fill-gray-600">Q3 2024</text>
        <text x="460" y="370" text-anchor="middle" class="text-sm fill-gray-600">Q4 2024</text>
        
        <text x="100" y="140" text-anchor="middle" class="text-sm fill-gray-700 font-semibold">35%</text>
        <text x="220" y="90" text-anchor="middle" class="text-sm fill-gray-700 font-semibold">48%</text>
        <text x="340" y="70" text-anchor="middle" class="text-sm fill-gray-700 font-semibold">52%</text>
        <text x="460" y="110" text-anchor="middle" class="text-sm fill-gray-700 font-semibold">45%</text>
        
        <text x="300" y="30" text-anchor="middle" class="text-lg font-bold fill-gray-800">Effizienzsteigerung durch Odoo 19</text>
        
        <line x1="40" y1="350" x2="560" y2="350" stroke="#374151" stroke-width="2"/>
        <line x1="40" y1="350" x2="40" y2="40" stroke="#374151" stroke-width="2"/>
      </svg>
    `;
  } else if (type === 'pie') {
    return `
      <svg width="600" height="400" viewBox="0 0 600 400" class="w-full h-auto">
        <g transform="translate(300, 200)">
          <path d="M 0 0 L 0 -150 A 150 150 0 0 1 106.066 -106.066 Z" fill="#7c3aed" opacity="0.8" stroke="white" stroke-width="2"/>
          <path d="M 0 0 L 106.066 -106.066 A 150 150 0 0 1 150 0 Z" fill="#8b5cf6" opacity="0.8" stroke="white" stroke-width="2"/>
          <path d="M 0 0 L 150 0 A 150 150 0 0 1 0 150 Z" fill="#06b6d4" opacity="0.8" stroke="white" stroke-width="2"/>
          <path d="M 0 0 L 0 150 A 150 150 0 1 1 0 -150 Z" fill="#10b981" opacity="0.8" stroke="white" stroke-width="2"/>
          
          <text x="-50" y="-80" text-anchor="middle" class="text-sm fill-white font-semibold">KI-Features</text>
          <text x="-50" y="-65" text-anchor="middle" class="text-xs fill-white">25%</text>
          
          <text x="80" y="-50" text-anchor="middle" class="text-sm fill-white font-semibold">Cloud</text>
          <text x="80" y="-35" text-anchor="middle" class="text-xs fill-white">20%</text>
          
          <text x="75" y="75" text-anchor="middle" class="text-sm fill-white font-semibold">Mobile</text>
          <text x="75" y="90" text-anchor="middle" class="text-xs fill-white">30%</text>
          
          <text x="-75" y="75" text-anchor="middle" class="text-sm fill-white font-semibold">Automation</text>
          <text x="-75" y="90" text-anchor="middle" class="text-xs fill-white">25%</text>
        </g>
        
        <text x="300" y="30" text-anchor="middle" class="text-lg font-bold fill-gray-800">Odoo 19 Feature-Verteilung</text>
      </svg>
    `;
  } else {
    return `
      <svg width="600" height="400" viewBox="0 0 600 400" class="w-full h-auto">
        <polyline points="60,300 150,250 240,180 330,140 420,100 510,60" 
                  fill="none" stroke="#7c3aed" stroke-width="3"/>
        
        <circle cx="60" cy="300" r="5" fill="#7c3aed"/>
        <circle cx="150" cy="250" r="5" fill="#7c3aed"/>
        <circle cx="240" cy="180" r="5" fill="#7c3aed"/>
        <circle cx="330" cy="140" r="5" fill="#7c3aed"/>
        <circle cx="420" cy="100" r="5" fill="#7c3aed"/>
        <circle cx="510" cy="60" r="5" fill="#7c3aed"/>
        
        <text x="60" y="320" text-anchor="middle" class="text-sm fill-gray-600">Jan</text>
        <text x="150" y="320" text-anchor="middle" class="text-sm fill-gray-600">Feb</text>
        <text x="240" y="320" text-anchor="middle" class="text-sm fill-gray-600">Mär</text>
        <text x="330" y="320" text-anchor="middle" class="text-sm fill-gray-600">Apr</text>
        <text x="420" y="320" text-anchor="middle" class="text-sm fill-gray-600">Mai</text>
        <text x="510" y="320" text-anchor="middle" class="text-sm fill-gray-600">Jun</text>
        
        <text x="60" y="290" text-anchor="middle" class="text-xs fill-gray-700">15%</text>
        <text x="150" y="240" text-anchor="middle" class="text-xs fill-gray-700">28%</text>
        <text x="240" y="170" text-anchor="middle" class="text-xs fill-gray-700">45%</text>
        <text x="330" y="130" text-anchor="middle" class="text-xs fill-gray-700">62%</text>
        <text x="420" y="90" text-anchor="middle" class="text-xs fill-gray-700">78%</text>
        <text x="510" y="50" text-anchor="middle" class="text-xs fill-gray-700">89%</text>
        
        <text x="300" y="30" text-anchor="middle" class="text-lg font-bold fill-gray-800">Odoo 19 Adoptionsrate 2024</text>
        
        <line x1="40" y1="310" x2="540" y2="310" stroke="#374151" stroke-width="2"/>
        <line x1="40" y1="310" x2="40" y2="40" stroke="#374151" stroke-width="2"/>
      </svg>
    `;
  }
}

// Export functions
window.parseSupabaseContent = parseSupabaseContent;
window.parseSVGPlaceholder = parseSVGPlaceholder;