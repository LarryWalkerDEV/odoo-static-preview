#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');

// Script to verify and fix canonical tags across all HTML files
async function fixCanonicalTags() {
    const htmlFiles = [];
    
    // Directories to scan
    const directories = ['.', 'odoo', 'odoo-19', 'odoo-hosting'];
    
    console.log('🔍 Scanning for HTML files...\n');
    
    // Find all HTML files
    for (const dir of directories) {
        const dirPath = path.join(__dirname, dir);
        try {
            const files = await fs.readdir(dirPath);
            for (const file of files) {
                if (file.endsWith('.html')) {
                    htmlFiles.push(path.join(dir, file));
                }
            }
        } catch (error) {
            console.error(`Error reading directory ${dir}:`, error.message);
        }
    }
    
    console.log(`Found ${htmlFiles.length} HTML files to check\n`);
    
    let issuesFound = 0;
    let fixedCount = 0;
    
    // Check each file
    for (const file of htmlFiles) {
        const filePath = path.join(__dirname, file);
        try {
            let content = await fs.readFile(filePath, 'utf8');
            const originalContent = content;
            
            // Check for canonical tag
            const canonicalMatch = content.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
            
            if (!canonicalMatch) {
                console.log(`❌ ${file}: Missing canonical tag`);
                issuesFound++;
                
                // Add canonical tag based on file path
                const canonicalUrl = getCanonicalUrl(file);
                const headEndIndex = content.indexOf('</head>');
                if (headEndIndex !== -1) {
                    const insertion = `    <link rel="canonical" href="${canonicalUrl}">\n    `;
                    content = content.slice(0, headEndIndex) + insertion + content.slice(headEndIndex);
                    console.log(`  ✅ Added canonical: ${canonicalUrl}`);
                    fixedCount++;
                }
            } else {
                const canonicalUrl = canonicalMatch[1];
                
                // Check if it uses www
                if (canonicalUrl.includes('www.')) {
                    console.log(`❌ ${file}: Canonical uses www: ${canonicalUrl}`);
                    issuesFound++;
                    
                    // Fix it
                    const fixedUrl = canonicalUrl.replace('www.', '');
                    content = content.replace(canonicalMatch[0], `<link rel="canonical" href="${fixedUrl}"`);
                    console.log(`  ✅ Fixed to: ${fixedUrl}`);
                    fixedCount++;
                }
                
                // Check if it's using the correct domain
                if (!canonicalUrl.startsWith('https://odoo-experten-deutschland.de')) {
                    console.log(`❌ ${file}: Incorrect domain in canonical: ${canonicalUrl}`);
                    issuesFound++;
                }
            }
            
            // Check for other SEO issues
            
            // 1. Check for self-referencing canonical
            const expectedCanonical = getCanonicalUrl(file);
            if (canonicalMatch && canonicalMatch[1] !== expectedCanonical) {
                console.log(`⚠️  ${file}: Canonical doesn't match expected URL`);
                console.log(`    Current: ${canonicalMatch[1]}`);
                console.log(`    Expected: ${expectedCanonical}`);
            }
            
            // 2. Check for meta robots tag
            if (!content.includes('meta name="robots"') && !content.includes('meta name=\'robots\'')) {
                // Add meta robots tag for proper indexing
                const metaViewport = content.indexOf('<meta name="viewport"');
                if (metaViewport !== -1) {
                    const endOfLine = content.indexOf('>', metaViewport) + 1;
                    const insertion = '\n    <meta name="robots" content="index, follow">';
                    content = content.slice(0, endOfLine) + insertion + content.slice(endOfLine);
                    console.log(`  ✅ Added meta robots tag to ${file}`);
                    fixedCount++;
                }
            }
            
            // 3. Add hreflang tags for German content
            if (!content.includes('hreflang=')) {
                const canonicalIndex = content.indexOf('<link rel="canonical"');
                if (canonicalIndex !== -1) {
                    const endOfLine = content.indexOf('>', canonicalIndex) + 1;
                    const insertion = '\n    <link rel="alternate" hreflang="de" href="' + expectedCanonical + '">' +
                                    '\n    <link rel="alternate" hreflang="x-default" href="' + expectedCanonical + '">';
                    content = content.slice(0, endOfLine) + insertion + content.slice(endOfLine);
                    console.log(`  ✅ Added hreflang tags to ${file}`);
                    fixedCount++;
                }
            }
            
            // Save if modified
            if (content !== originalContent) {
                await fs.writeFile(filePath, content, 'utf8');
            }
            
        } catch (error) {
            console.error(`Error processing ${file}:`, error.message);
        }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total files checked: ${htmlFiles.length}`);
    console.log(`   Issues found: ${issuesFound}`);
    console.log(`   Issues fixed: ${fixedCount}`);
    
    // Create verification report
    const report = {
        date: new Date().toISOString(),
        filesChecked: htmlFiles.length,
        issuesFound: issuesFound,
        issuesFixed: fixedCount,
        canonicalStructure: {
            homepage: 'https://odoo-experten-deutschland.de/',
            odooSection: 'https://odoo-experten-deutschland.de/odoo/',
            odoo19Section: 'https://odoo-experten-deutschland.de/odoo-19/',
            hostingSection: 'https://odoo-experten-deutschland.de/odoo-hosting/'
        }
    };
    
    await fs.writeFile('canonical-fix-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Report saved to canonical-fix-report.json');
}

function getCanonicalUrl(filePath) {
    // Normalize path separators
    const normalizedPath = filePath.replace(/\\/g, '/');
    
    // Remove leading ./ if present
    const cleanPath = normalizedPath.replace(/^\.\//, '');
    
    // Special cases
    if (cleanPath === 'index.html') {
        return 'https://odoo-experten-deutschland.de/';
    }
    
    // For section index pages
    if (cleanPath.endsWith('/index.html')) {
        return `https://odoo-experten-deutschland.de/${cleanPath.replace('/index.html', '/')}`; 
    }
    
    // For regular pages
    return `https://odoo-experten-deutschland.de/${cleanPath}`;
}

// Run the script
fixCanonicalTags().catch(console.error);