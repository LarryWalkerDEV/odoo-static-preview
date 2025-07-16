const fs = require('fs');

// Add RSS auto-discovery to main pages
function addRSSDiscovery() {
  const rssLink = '<link rel="alternate" type="application/rss+xml" title="Odoo Experten Deutschland RSS Feed" href="https://odoo-experten-deutschland.de/rss.xml" />';
  
  const mainPages = [
    'index.html',
    'odoo/index.html',
    'odoo-hosting/index.html', 
    'odoo-19/index.html'
  ];
  
  let updatedCount = 0;
  
  mainPages.forEach(page => {
    if (fs.existsSync(page)) {
      let content = fs.readFileSync(page, 'utf8');
      
      // Check if RSS link already exists
      if (!content.includes('type="application/rss+xml"')) {
        // Add before closing </head> tag
        content = content.replace('</head>', `    ${rssLink}\n</head>`);
        fs.writeFileSync(page, content);
        updatedCount++;
        console.log(`✅ Updated: ${page}`);
      } else {
        console.log(`⏭️  Skipped: ${page} (already has RSS discovery)`);
      }
    }
  });
  
  console.log(`\n📊 Total pages updated: ${updatedCount}`);
}

// Add RSS link to robots.txt
function updateRobotsTxt() {
  const robotsPath = 'robots.txt';
  let robotsContent = fs.readFileSync(robotsPath, 'utf8');
  
  if (!robotsContent.includes('rss.xml')) {
    robotsContent += '\n# RSS Feed\nSitemap: https://odoo-experten-deutschland.de/rss.xml\n';
    fs.writeFileSync(robotsPath, robotsContent);
    console.log('✅ Added RSS feed to robots.txt');
  } else {
    console.log('⏭️  robots.txt already contains RSS reference');
  }
}

// Run updates
console.log('Adding RSS auto-discovery...\n');
addRSSDiscovery();
updateRobotsTxt();

console.log('\n✅ RSS implementation complete!');
console.log('\n📋 Next steps:');
console.log('1. Deploy these new/modified files:');
console.log('   - rss.xml (the RSS feed)');
console.log('   - rss.html (info page)');
console.log('   - index.html (with RSS discovery)');
console.log('   - odoo/index.html');
console.log('   - odoo-hosting/index.html');
console.log('   - odoo-19/index.html');
console.log('   - robots.txt');
console.log('\n2. Submit RSS feed to Google Search Console:');
console.log('   - Go to Sitemaps section');
console.log('   - Add: rss.xml');
console.log('\n3. The RSS feed will update automatically when you regenerate it');