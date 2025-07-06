const fs = require('fs').promises;
const path = require('path');

async function findHtmlFiles(dir, baseDir = dir) {
    const files = await fs.readdir(dir);
    let htmlFiles = [];
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.stat(filePath);
        
        if (stat.isDirectory() && file !== 'templates' && !file.startsWith('.')) {
            htmlFiles = htmlFiles.concat(await findHtmlFiles(filePath, baseDir));
        } else if (file.endsWith('.html')) {
            const relativePath = path.relative(baseDir, filePath);
            htmlFiles.push(relativePath);
        }
    }
    
    return htmlFiles;
}

async function generateSitemap() {
    const domain = 'https://odoo-experten-deutschland.de';
    const today = new Date().toISOString().split('T')[0];
    
    // Find all HTML files
    const htmlFiles = await findHtmlFiles('.');
    
    // Sort files by category and importance
    const categorizedFiles = {
        home: [],
        categories: [],
        calculator: [],
        legal: [],
        odoo: [],
        'odoo-19': [],
        'odoo-hosting': []
    };
    
    htmlFiles.forEach(file => {
        const normalizedFile = file.replace(/\\/g, '/');
        
        if (normalizedFile === 'index.html') {
            categorizedFiles.home.push(normalizedFile);
        } else if (normalizedFile.match(/^(odoo|odoo-19|odoo-hosting)\/index\.html$/)) {
            categorizedFiles.categories.push(normalizedFile);
        } else if (normalizedFile.includes('odoo-hosting-rechner')) {
            categorizedFiles.calculator.push(normalizedFile);
        } else if (normalizedFile.match(/^(impressum|datenschutz|cookie-richtlinien)\.html$/)) {
            categorizedFiles.legal.push(normalizedFile);
        } else if (normalizedFile.startsWith('odoo-19/')) {
            categorizedFiles['odoo-19'].push(normalizedFile);
        } else if (normalizedFile.startsWith('odoo-hosting/')) {
            categorizedFiles['odoo-hosting'].push(normalizedFile);
        } else if (normalizedFile.startsWith('odoo/')) {
            categorizedFiles.odoo.push(normalizedFile);
        }
    });
    
    // Generate sitemap XML
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    
    // Homepage
    categorizedFiles.home.forEach(file => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${domain}/</loc>\n`;
        sitemap += `    <lastmod>${today}</lastmod>\n`;
        sitemap += '    <changefreq>daily</changefreq>\n';
        sitemap += '    <priority>1.0</priority>\n';
        sitemap += '  </url>\n';
    });
    
    // Category pages
    categorizedFiles.categories.forEach(file => {
        const url = file.replace('index.html', '');
        sitemap += '  <url>\n';
        sitemap += `    <loc>${domain}/${url}</loc>\n`;
        sitemap += `    <lastmod>${today}</lastmod>\n`;
        sitemap += '    <changefreq>daily</changefreq>\n';
        sitemap += '    <priority>0.9</priority>\n';
        sitemap += '  </url>\n';
    });
    
    // Calculator
    categorizedFiles.calculator.forEach(file => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${domain}/${file}</loc>\n`;
        sitemap += `    <lastmod>${today}</lastmod>\n`;
        sitemap += '    <changefreq>weekly</changefreq>\n';
        sitemap += '    <priority>0.9</priority>\n';
        sitemap += '  </url>\n';
    });
    
    // Content pages
    ['odoo', 'odoo-19', 'odoo-hosting'].forEach(category => {
        categorizedFiles[category].sort().forEach(file => {
            if (!file.endsWith('index.html')) {
                sitemap += '  <url>\n';
                sitemap += `    <loc>${domain}/${file}</loc>\n`;
                sitemap += `    <lastmod>${today}</lastmod>\n`;
                sitemap += '    <changefreq>weekly</changefreq>\n';
                sitemap += '    <priority>0.7</priority>\n';
                sitemap += '  </url>\n';
            }
        });
    });
    
    // Legal pages
    categorizedFiles.legal.forEach(file => {
        sitemap += '  <url>\n';
        sitemap += `    <loc>${domain}/${file}</loc>\n`;
        sitemap += `    <lastmod>${today}</lastmod>\n`;
        sitemap += '    <changefreq>monthly</changefreq>\n';
        sitemap += '    <priority>0.3</priority>\n';
        sitemap += '  </url>\n';
    });
    
    sitemap += '</urlset>';
    
    // Write sitemap
    await fs.writeFile('sitemap.xml', sitemap);
    
    // Generate stats
    const totalPages = htmlFiles.length;
    console.log(`Sitemap generated successfully!`);
    console.log(`Total pages: ${totalPages}`);
    console.log(`- Homepage: ${categorizedFiles.home.length}`);
    console.log(`- Category pages: ${categorizedFiles.categories.length}`);
    console.log(`- Calculator: ${categorizedFiles.calculator.length}`);
    console.log(`- Odoo articles: ${categorizedFiles.odoo.length}`);
    console.log(`- Odoo 19 articles: ${categorizedFiles['odoo-19'].length}`);
    console.log(`- Odoo Hosting articles: ${categorizedFiles['odoo-hosting'].length}`);
    console.log(`- Legal pages: ${categorizedFiles.legal.length}`);
}

generateSitemap().catch(console.error);