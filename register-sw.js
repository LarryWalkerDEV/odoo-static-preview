const fs = require('fs');
const path = require('path');

// Service worker registration code
const swRegistrationCode = `
<!-- Service Worker Registration -->
<script>
if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      console.log('ServiceWorker registration successful');
    }, function(err) {
      console.log('ServiceWorker registration failed: ', err);
    });
  });
}
</script>`;

// Add service worker registration to main HTML files
function addServiceWorker() {
  const htmlFiles = [
    'index.html',
    'odoo-hosting-rechner.html',
    'impressum.html',
    'datenschutz.html',
    'cookie-richtlinien.html'
  ];
  
  let updatedFiles = 0;
  
  htmlFiles.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Check if already has service worker
      if (content.includes('serviceWorker')) {
        console.log(`${file} already has service worker registration`);
        return;
      }
      
      // Add before closing body tag
      const updatedContent = content.replace('</body>', `${swRegistrationCode}\n</body>`);
      
      if (updatedContent !== content) {
        fs.writeFileSync(file, updatedContent);
        updatedFiles++;
        console.log(`Updated: ${file}`);
      }
    }
  });
  
  console.log(`\nTotal files updated: ${updatedFiles}`);
}

// Run the update
addServiceWorker();