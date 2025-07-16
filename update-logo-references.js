const fs = require('fs');
const path = require('path');

// Function to update logo references in HTML files
function updateLogoReferences() {
  const htmlFiles = [
    'index.html',
    'odoo-hosting-rechner.html',
    'impressum.html',
    'datenschutz.html',
    'cookie-richtlinien.html'
  ];
  
  // Also check for HTML files in subdirectories
  const subdirs = ['odoo', 'odoo-hosting', 'odoo-19'];
  
  subdirs.forEach(dir => {
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir);
      files.forEach(file => {
        if (file.endsWith('.html')) {
          htmlFiles.push(path.join(dir, file));
        }
      });
    }
  });
  
  const oldLogoUrl = 'https://tbppogohivsxgiavbnvp.supabase.co/storage/v1/object/public/odoo/Logo.png';
  const newLogoHtml = `
    <picture>
      <source srcset="/images/optimized/logo-80x80.webp 1x, /images/optimized/logo-120x120.webp 2x" type="image/webp">
      <source srcset="/images/optimized/logo-80x80.png 1x, /images/optimized/logo-120x120.png 2x" type="image/png">
      <img src="/images/optimized/logo-80x80.png" alt="Odoo Experten Deutschland Logo" width="40" height="40" loading="eager">
    </picture>`;
  
  let updatedFiles = 0;
  
  htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      const originalContent = content;
      
      // Replace img tags with the old logo URL
      const imgRegex = /<img[^>]*src\s*=\s*["']https:\/\/tbppogohivsxgiavbnvp\.supabase\.co\/storage\/v1\/object\/public\/odoo\/Logo\.png["'][^>]*>/gi;
      
      if (imgRegex.test(content)) {
        // Extract any additional attributes from the original img tag
        content = content.replace(imgRegex, (match) => {
          // Check if it's in a navigation or header context (usually needs eager loading)
          const isNavigation = match.includes('navigation') || match.includes('header') || match.includes('nav');
          const loading = isNavigation ? 'eager' : 'lazy';
          
          return newLogoHtml.replace('loading="eager"', `loading="${loading}"`);
        });
      }
      
      // Also update meta tags with logo
      content = content.replace(
        /content="https:\/\/tbppogohivsxgiavbnvp\.supabase\.co\/storage\/v1\/object\/public\/odoo\/Logo\.png"/gi,
        'content="/images/optimized/logo-180x180.png"'
      );
      
      if (content !== originalContent) {
        fs.writeFileSync(file, content);
        updatedFiles++;
        console.log(`Updated: ${file}`);
      }
    }
  });
  
  console.log(`\nTotal files updated: ${updatedFiles}`);
  
  // Create a simple logo component for future use
  const logoComponent = `<!-- Optimized Logo Component -->
<!-- Use this instead of the old Supabase logo URL -->
<picture>
  <source srcset="/images/optimized/logo-80x80.webp 1x, /images/optimized/logo-120x120.webp 2x" type="image/webp">
  <source srcset="/images/optimized/logo-80x80.png 1x, /images/optimized/logo-120x120.png 2x" type="image/png">
  <img src="/images/optimized/logo-80x80.png" alt="Odoo Experten Deutschland Logo" width="40" height="40" loading="lazy">
</picture>

<!-- For navigation/header (eager loading) -->
<picture>
  <source srcset="/images/optimized/logo-80x80.webp 1x, /images/optimized/logo-120x120.webp 2x" type="image/webp">
  <source srcset="/images/optimized/logo-80x80.png 1x, /images/optimized/logo-120x120.png 2x" type="image/png">
  <img src="/images/optimized/logo-80x80.png" alt="Odoo Experten Deutschland Logo" width="40" height="40" loading="eager">
</picture>

<!-- For meta tags / social media (use larger size) -->
<meta property="og:image" content="/images/optimized/logo-180x180.png">`;
  
  fs.writeFileSync('logo-component.html', logoComponent);
  console.log('\nCreated logo-component.html with optimized logo examples');
}

// Run the update
updateLogoReferences();