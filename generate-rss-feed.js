const fs = require('fs');
const path = require('path');

// Function to extract metadata from HTML files
function extractMetadata(htmlPath) {
  try {
    const content = fs.readFileSync(htmlPath, 'utf8');
    
    // Extract title
    const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : 'Untitled';
    
    // Extract description
    const descMatch = content.match(/<meta\s+name="description"\s+content="([^"]+)"/i);
    const description = descMatch ? descMatch[1].trim() : '';
    
    // Extract canonical URL
    const canonicalMatch = content.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
    const url = canonicalMatch ? canonicalMatch[1] : '';
    
    // Get file stats for last modified date
    const stats = fs.statSync(htmlPath);
    const lastModified = stats.mtime;
    
    return {
      title,
      description,
      url,
      lastModified,
      valid: url !== ''
    };
  } catch (error) {
    console.error(`Error processing ${htmlPath}:`, error.message);
    return null;
  }
}

// Function to escape XML special characters
function escapeXml(unsafe) {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate RSS feed
function generateRSSFeed() {
  const articles = [];
  
  // Directories to scan
  const directories = [
    { path: 'odoo', category: 'Odoo Grundlagen' },
    { path: 'odoo-hosting', category: 'Odoo Hosting' },
    { path: 'odoo-19', category: 'Odoo 19' }
  ];
  
  // Collect all articles
  directories.forEach(dir => {
    if (fs.existsSync(dir.path)) {
      const files = fs.readdirSync(dir.path);
      
      files.forEach(file => {
        if (file.endsWith('.html') && file !== 'index.html') {
          const htmlPath = path.join(dir.path, file);
          const metadata = extractMetadata(htmlPath);
          
          if (metadata && metadata.valid) {
            articles.push({
              ...metadata,
              category: dir.category
            });
          }
        }
      });
    }
  });
  
  // Sort articles by last modified date (newest first)
  articles.sort((a, b) => b.lastModified - a.lastModified);
  
  // Generate RSS XML
  const rssItems = articles.map(article => {
    const pubDate = article.lastModified.toUTCString();
    
    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(article.url)}</link>
      <description>${escapeXml(article.description)}</description>
      <category>${escapeXml(article.category)}</category>
      <guid isPermaLink="true">${escapeXml(article.url)}</guid>
      <pubDate>${pubDate}</pubDate>
    </item>`;
  }).join('\n');
  
  const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>Odoo Experten Deutschland - Alle Artikel</title>
    <link>https://odoo-experten-deutschland.de</link>
    <description>Unabhängiges Wissensportal für Odoo ERP. Fundierte Informationen, neutrale Analysen und aktuelle Artikel zu Odoo, Hosting und Implementierung.</description>
    <language>de-DE</language>
    <copyright>Copyright 2025 Odoo Experten Deutschland</copyright>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Odoo Experten RSS Generator</generator>
    <atom:link href="https://odoo-experten-deutschland.de/rss.xml" rel="self" type="application/rss+xml" />
    <image>
      <url>https://odoo-experten-deutschland.de/images/optimized/logo-180x180.png</url>
      <title>Odoo Experten Deutschland</title>
      <link>https://odoo-experten-deutschland.de</link>
    </image>
    <ttl>60</ttl>
${rssItems}
  </channel>
</rss>`;
  
  // Write RSS feed
  fs.writeFileSync('rss.xml', rssFeed);
  
  console.log(`✅ RSS feed generated successfully!`);
  console.log(`📊 Total articles: ${articles.length}`);
  console.log(`📁 File created: rss.xml`);
  console.log(`\n📋 Articles by category:`);
  
  directories.forEach(dir => {
    const count = articles.filter(a => a.category === dir.category).length;
    console.log(`   - ${dir.category}: ${count} articles`);
  });
  
  // Also create a simple HTML page to view the RSS feed
  const rssHtml = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>RSS Feed - Odoo Experten Deutschland</title>
    <link rel="canonical" href="https://odoo-experten-deutschland.de/rss.html">
    <meta name="robots" content="noindex, follow">
    <style>
        body { font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { color: #7c3aed; }
        .info { background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .feed-link { display: inline-block; background: #7c3aed; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
        .feed-link:hover { background: #6d28d9; }
        code { background: #e5e7eb; padding: 2px 6px; border-radius: 3px; }
        .stats { margin: 20px 0; }
        .category { margin: 10px 0; padding: 10px; background: #fafafa; border-left: 4px solid #7c3aed; }
    </style>
</head>
<body>
    <h1>RSS Feed - Odoo Experten Deutschland</h1>
    
    <div class="info">
        <h2>Über diesen RSS Feed</h2>
        <p>Dieser RSS Feed enthält alle ${articles.length} Artikel von Odoo Experten Deutschland und wird stündlich von Suchmaschinen gecrawlt.</p>
        <p><strong>Feed URL:</strong> <code>https://odoo-experten-deutschland.de/rss.xml</code></p>
        <a href="/rss.xml" class="feed-link">RSS Feed anzeigen</a>
    </div>
    
    <div class="stats">
        <h2>Statistiken</h2>
        <p>Letzte Aktualisierung: ${new Date().toLocaleString('de-DE')}</p>
        <p>Gesamtanzahl Artikel: ${articles.length}</p>
        
        <h3>Artikel nach Kategorie:</h3>
        ${directories.map(dir => {
          const count = articles.filter(a => a.category === dir.category).length;
          return `<div class="category">${dir.category}: ${count} Artikel</div>`;
        }).join('\n        ')}
    </div>
    
    <div class="info">
        <h2>RSS Feed in Ihrem Reader hinzufügen</h2>
        <p>Kopieren Sie diese URL in Ihren RSS-Reader:</p>
        <code>https://odoo-experten-deutschland.de/rss.xml</code>
        
        <h3>Beliebte RSS-Reader:</h3>
        <ul>
            <li>Feedly</li>
            <li>Inoreader</li>
            <li>The Old Reader</li>
            <li>NewsBlur</li>
        </ul>
    </div>
    
    <p><a href="/">← Zurück zur Startseite</a></p>
</body>
</html>`;
  
  fs.writeFileSync('rss.html', rssHtml);
  console.log(`\n📄 Also created: rss.html (human-readable RSS info page)`);
  
  // Create RSS auto-discovery snippet
  const rssDiscovery = `
<!-- RSS Auto-Discovery -->
<!-- Add this to the <head> section of your index.html and other main pages -->
<link rel="alternate" type="application/rss+xml" title="Odoo Experten Deutschland RSS Feed" href="https://odoo-experten-deutschland.de/rss.xml" />`;
  
  fs.writeFileSync('rss-discovery-snippet.txt', rssDiscovery);
  console.log(`\n💡 RSS auto-discovery snippet saved to: rss-discovery-snippet.txt`);
}

// Run the generator
generateRSSFeed();