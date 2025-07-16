const fs = require('fs');

// Fix the animation issue by removing the problematic CSS rule
function fixAnimationIssue() {
  const files = [
    'index.html',
    'impressum.html',
    'datenschutz.html',
    'cookie-richtlinien.html',
    'odoo-hosting-rechner.html'
  ];
  
  files.forEach(file => {
    if (fs.existsSync(file)) {
      let content = fs.readFileSync(file, 'utf8');
      
      // Remove the problematic animate-fade-up CSS rule
      const oldCSS = '.animate-fade-up{opacity:0;transform:translateY(20px)}';
      const newCSS = '';
      
      if (content.includes(oldCSS)) {
        content = content.replace(oldCSS, newCSS);
        fs.writeFileSync(file, content);
        console.log(`✅ Fixed: ${file}`);
      } else {
        console.log(`⏭️  Skipped: ${file} (no animation rule found)`);
      }
    }
  });
}

// Run the fix
fixAnimationIssue();
console.log('\n🎉 Animation issue fixed! H1 and other elements should now be visible immediately.');