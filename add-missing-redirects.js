const fs = require('fs');

// Missing file redirects to similar existing content
const missingFileRedirects = `
# Missing file redirects to similar content
/odoo/dsgvo-compliance-guide /odoo/19-odoo-19-compliance-legal.html 301
/odoo/odoo-beratung /odoo/odoo-consulting.html 301
/odoo/odoo-dashboard /odoo/odoo-business-intelligence.html 301
/odoo-hosting/odoo-hosting-optionen /odoo-hosting/hosting-odoo-hosting-types-comparison.html 301
/odoo-hosting/odoo-managed-services /odoo-hosting/hosting-odoo-managed-services.html 301
/odoo/odoo-dsgvo-compliance /odoo/19-odoo-19-compliance-legal.html 301

# Special redirects for common misspellings
/odoo/odoo-crm-grundlagen /odoo/odoo-crm.html 301
/odoo-hosting/hosting-sicherheit /odoo-hosting/odoo-hosting-sicherheit.html 301
/odoo-hosting/odoo-sh-vergleich /odoo-hosting/odoo-cloud-vs-on-premise.html 301
/odoo-19/ki-integration /odoo-19/19-odoo-19-ki-features-business.html 301
`;

// Read current redirects
const currentRedirects = fs.readFileSync('_redirects', 'utf8');

// Check if these redirects already exist
const linesToAdd = [];
missingFileRedirects.trim().split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [from] = line.trim().split(' ');
    if (!currentRedirects.includes(from + ' ')) {
      linesToAdd.push(line);
    }
  }
});

if (linesToAdd.length > 0) {
  // Find position after catch-all rule comment
  const catchAllIndex = currentRedirects.indexOf('# Catch-all rule');
  
  if (catchAllIndex !== -1) {
    // Insert before catch-all rule
    const beforeCatchAll = currentRedirects.substring(0, catchAllIndex);
    const fromCatchAll = currentRedirects.substring(catchAllIndex);
    
    const updatedRedirects = beforeCatchAll + 
      '\n# Missing file redirects to similar content\n' +
      linesToAdd.join('\n') + '\n\n' +
      fromCatchAll;
    
    fs.writeFileSync('_redirects', updatedRedirects);
    console.log(`Added ${linesToAdd.length} new redirect rules for missing files`);
  } else {
    // Append to end
    fs.appendFileSync('_redirects', '\n' + missingFileRedirects);
    console.log(`Appended ${linesToAdd.length} redirect rules`);
  }
} else {
  console.log('All redirect rules already exist');
}

// Also create a comprehensive 404 fix summary
const summary = `# 404 Error Fix Summary

## Fixed Issues (29 total)

### 1. WWW to non-WWW Redirects (7 URLs)
- All www.odoo-experten-deutschland.de URLs now redirect to non-www version

### 2. Missing .html Extensions (5 URLs)
- Added redirects for URLs accessed without .html extension
- Examples: /odoo/odoo-training → /odoo/odoo-training.html

### 3. Missing Files Redirected to Similar Content (6 URLs)
- /odoo/dsgvo-compliance-guide → /odoo/19-odoo-19-compliance-legal.html
- /odoo/odoo-beratung → /odoo/odoo-consulting.html
- /odoo/odoo-dashboard → /odoo/odoo-business-intelligence.html
- /odoo-hosting/odoo-hosting-optionen → /odoo-hosting/hosting-odoo-hosting-types-comparison.html
- /odoo-hosting/odoo-managed-services → /odoo-hosting/hosting-odoo-managed-services.html
- /odoo/odoo-dsgvo-compliance → /odoo/19-odoo-19-compliance-legal.html

### 4. Special Case Redirects (4 URLs)
- /odoo/odoo-crm-grundlagen → /odoo/odoo-crm.html
- /odoo-hosting/hosting-sicherheit → /odoo-hosting/odoo-hosting-sicherheit.html
- /odoo-hosting/odoo-sh-vergleich → /odoo-hosting/odoo-cloud-vs-on-premise.html
- /odoo-19/ki-integration → /odoo-19/19-odoo-19-ki-features-business.html

### 5. Already Working URLs (7 URLs)
- Files exist and are accessible with correct paths

## Implementation Details

All fixes are implemented via the _redirects file with 301 (permanent) redirects to:
- Preserve SEO value
- Update search engine indexes
- Provide good user experience

## Next Steps

1. Deploy the updated _redirects file
2. Test all redirects after deployment
3. Submit URLs for revalidation in Google Search Console
4. Monitor for any new 404 errors
`;

fs.writeFileSync('404-FIX-SUMMARY.md', summary);
console.log('\nCreated 404-FIX-SUMMARY.md with complete fix details');