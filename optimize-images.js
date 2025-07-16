const fs = require('fs');
const path = require('path');

// Create optimized logo versions
async function optimizeImages() {
  try {
    // Try to use sharp if available
    const sharp = require('sharp');
    
    const inputPath = path.join(__dirname, 'images', 'Logo-original.png');
    const outputDir = path.join(__dirname, 'images', 'optimized');
    
    // Ensure output directory exists
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Create multiple sizes
    const sizes = [
      { width: 40, height: 40, name: 'logo-40x40' },
      { width: 80, height: 80, name: 'logo-80x80' },
      { width: 120, height: 120, name: 'logo-120x120' },
      { width: 180, height: 180, name: 'logo-180x180' }
    ];
    
    for (const size of sizes) {
      // PNG version
      await sharp(inputPath)
        .resize(size.width, size.height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 90, compressionLevel: 9 })
        .toFile(path.join(outputDir, `${size.name}.png`));
      
      // WebP version
      await sharp(inputPath)
        .resize(size.width, size.height, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .webp({ quality: 85 })
        .toFile(path.join(outputDir, `${size.name}.webp`));
      
      console.log(`Created ${size.name}.png and ${size.name}.webp`);
    }
    
    console.log('Image optimization complete!');
    
  } catch (error) {
    console.error('Sharp not available. Creating fallback solution...');
    
    // Create a simple HTML file that shows how to manually optimize
    const instructions = `
<!DOCTYPE html>
<html>
<head>
  <title>Image Optimization Instructions</title>
</head>
<body>
  <h1>Manual Image Optimization Required</h1>
  <p>The logo file is 1.4MB which is way too large for a 40x40 display.</p>
  
  <h2>Quick Solution:</h2>
  <ol>
    <li>Use an online tool like <a href="https://squoosh.app/" target="_blank">Squoosh.app</a></li>
    <li>Upload the logo file</li>
    <li>Resize to 80x80 pixels (for retina displays)</li>
    <li>Export as both PNG and WebP formats</li>
    <li>Aim for file size under 10KB</li>
  </ol>
  
  <h2>Or install sharp:</h2>
  <pre>npm install sharp</pre>
  <p>Then run: node optimize-images.js</p>
</body>
</html>`;
    
    fs.writeFileSync(path.join(__dirname, 'image-optimization-guide.html'), instructions);
    console.log('Created image-optimization-guide.html with instructions');
  }
}

// Run the optimization
optimizeImages().catch(console.error);