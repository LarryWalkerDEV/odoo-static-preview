const fs = require('fs');
const path = require('path');

// 404 URLs from Google Search Console
const errorUrls = [
  'https://www.odoo-experten-deutschland.de/odoo-hosting/odoo-sh-vergleich.html',
  'https://www.odoo-experten-deutschland.de/odoo-hosting/hosting-sicherheit.html',
  'https://www.odoo-experten-deutschland.de/odoo/odoo-crm-grundlagen.html',
  'https://odoo-experten-deutschland.de/odoo/dsgvo-compliance-guide',
  'https://odoo-experten-deutschland.de/odoo/odoo-training',
  'https://odoo-experten-deutschland.de/odoo/odoo-module',
  'https://odoo-experten-deutschland.de/odoo/odoo-crm',
  'https://odoo-experten-deutschland.de/odoo/odoo-beratung',
  'https://odoo-experten-deutschland.de/odoo/odoo-dashboard',
  'https://odoo-experten-deutschland.de/odoo-hosting/odoo-hosting-optionen',
  'https://odoo-experten-deutschland.de/odoo-hosting/odoo-managed-services',
  'https://odoo-experten-deutschland.de/odoo/odoo-dsgvo-compliance',
  'https://www.odoo-experten-deutschland.de/odoo-19/ki-integration.html',
  'https://odoo-experten-deutschland.de/odoo/odoo-logistics.html',
  'https://odoo-experten-deutschland.de/odoo-hosting/hosting-odoo-hosting-deutschland-dsgvo.html',
  'https://odoo-experten-deutschland.de/odoo-hosting/best-odoo-hosting-provider.html',
  'https://odoo-experten-deutschland.de/odoo/19-odoo-19-system-requirements.html',
  'https://www.odoo-experten-deutschland.de/odoo-19/',
  'https://odoo-experten-deutschland.de/odoo-19/19-odoo-19-wettbewerbsvorteil.html',
  'https://www.odoo-experten-deutschland.de/odoo/19-odoo-19-ai-server-actions.html',
  'https://www.odoo-experten-deutschland.de/odoo-hosting/',
  'https://odoo-experten-deutschland.de/odoo-19/19-odoo-19-industry-templates.html',
  'https://odoo-experten-deutschland.de/odoo/',
  'https://odoo-experten-deutschland.de/odoo-hosting/hosting-odoo-email-hosting-integration.html',
  'https://odoo-experten-deutschland.de/odoo-hosting/odoo-chatbot-hosting-ai-chat.html',
  'https://odoo-experten-deutschland.de/odoo-hosting/hosting-odoo-ai-costs-ki-preise.html',
  'https://odoo-experten-deutschland.de/odoo-hosting/odoo-selbst-hosten-anleitung.html',
  'https://odoo-experten-deutschland.de/odoo-hosting/odoo-ai-website-ki-integration.html',
  'https://odoo-experten-deutschland.de/odoo-19/odoo-19-banking-accounting.html'
];

// Parse URLs and check fixes
function verify404Fixes() {
  const redirectsContent = fs.readFileSync('_redirects', 'utf8');
  const results = {
    fixed: [],
    needsAttention: [],
    missingFiles: []
  };

  errorUrls.forEach(url => {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const hasWww = urlObj.hostname.includes('www.');
    
    // Check if URL needs .html extension
    const needsHtml = !pathname.endsWith('.html') && !pathname.endsWith('/');
    const expectedPath = needsHtml ? pathname + '.html' : pathname;
    
    // Check if the target file exists
    const localPath = expectedPath.startsWith('/') ? expectedPath.slice(1) : expectedPath;
    const fileExists = fs.existsSync(localPath) || fs.existsSync(localPath + 'index.html');
    
    // Check if redirect exists in _redirects
    let hasRedirect = false;
    
    // Check for www redirect
    if (hasWww) {
      hasRedirect = redirectsContent.includes('https://www.odoo-experten-deutschland.de/*');
    }
    
    // Check for missing .html redirect
    if (needsHtml) {
      hasRedirect = hasRedirect || redirectsContent.includes(`${pathname} ${expectedPath}`);
    }
    
    // Categorize the result
    if (hasRedirect || fileExists) {
      results.fixed.push({
        originalUrl: url,
        fixType: hasWww ? 'www-to-non-www redirect' : needsHtml ? 'missing .html redirect' : 'file exists',
        targetPath: expectedPath
      });
    } else if (!fileExists) {
      results.missingFiles.push({
        originalUrl: url,
        expectedFile: localPath
      });
    } else {
      results.needsAttention.push({
        originalUrl: url,
        issue: 'Unknown issue'
      });
    }
  });

  // Generate report
  console.log('=== 404 ERROR FIX VERIFICATION REPORT ===\n');
  
  console.log(`✅ FIXED: ${results.fixed.length} URLs`);
  results.fixed.forEach(item => {
    console.log(`   - ${item.originalUrl}`);
    console.log(`     Fix: ${item.fixType}`);
    console.log(`     Target: ${item.targetPath}\n`);
  });
  
  if (results.missingFiles.length > 0) {
    console.log(`\n❌ MISSING FILES: ${results.missingFiles.length} files not found`);
    results.missingFiles.forEach(item => {
      console.log(`   - ${item.originalUrl}`);
      console.log(`     Expected file: ${item.expectedFile}\n`);
    });
  }
  
  if (results.needsAttention.length > 0) {
    console.log(`\n⚠️  NEEDS ATTENTION: ${results.needsAttention.length} URLs`);
    results.needsAttention.forEach(item => {
      console.log(`   - ${item.originalUrl}`);
      console.log(`     Issue: ${item.issue}\n`);
    });
  }
  
  // Create a summary file
  const summary = {
    totalErrors: errorUrls.length,
    fixed: results.fixed.length,
    missingFiles: results.missingFiles.length,
    needsAttention: results.needsAttention.length,
    details: results
  };
  
  fs.writeFileSync('404-fix-verification.json', JSON.stringify(summary, null, 2));
  console.log('\nDetailed report saved to: 404-fix-verification.json');
}

// Run verification
verify404Fixes();