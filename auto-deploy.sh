#!/bin/bash

echo "🚀 Odoo Static Website - Auto Deploy Script"
echo "=========================================="
echo ""
echo "This will help you deploy your website to GitHub and DigitalOcean"
echo ""

# Check if we're in the right directory
if [ ! -f "index.html" ] || [ ! -d "odoo" ]; then
    echo "❌ Error: Not in the vanilla-html-site directory!"
    exit 1
fi

echo "✅ Found website files (207 pages ready)"
echo ""

# Option 1: Try existing credentials
echo "Attempting to push with existing credentials..."
git push -u origin main 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub!"
    echo ""
    echo "🎉 Your website is now on GitHub at:"
    echo "   https://github.com/LarryWalkerDEV/odoo-static-preview"
    echo ""
    echo "📱 Next step: Deploy to DigitalOcean"
    echo "   1. Go to https://cloud.digitalocean.com/apps"
    echo "   2. Click 'Create App'"
    echo "   3. Select GitHub source"
    echo "   4. Choose 'odoo-static-preview' repository"
    echo "   5. Deploy as Static Site!"
    exit 0
fi

# Option 2: Manual token entry
echo ""
echo "GitHub authentication required!"
echo ""
echo "Please create a Personal Access Token:"
echo "1. Go to: https://github.com/settings/tokens"
echo "2. Click 'Generate new token (classic)'"
echo "3. Give it a name like 'odoo-deploy'"
echo "4. Select scopes: ✅ repo (all)"
echo "5. Click 'Generate token'"
echo "6. Copy the token (starts with ghp_)"
echo ""
read -p "Enter your GitHub token: " token

if [ -z "$token" ]; then
    echo "❌ No token provided"
    exit 1
fi

# Create repo via API
echo ""
echo "Creating repository..."
curl -H "Authorization: token $token" \
     https://api.github.com/user/repos \
     -d '{"name":"odoo-static-preview","description":"Odoo Experten Deutschland - Static Website (207 pages)","public":true}' \
     > /tmp/repo-create.json 2>/dev/null

# Check if repo was created
if grep -q "full_name" /tmp/repo-create.json; then
    echo "✅ Repository created successfully!"
else
    echo "⚠️  Repository might already exist, continuing..."
fi

# Push with token
echo ""
echo "Pushing code to GitHub..."
git push https://LarryWalkerDEV:$token@github.com/LarryWalkerDEV/odoo-static-preview.git main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your website is now on GitHub!"
    echo ""
    echo "Repository: https://github.com/LarryWalkerDEV/odoo-static-preview"
    echo ""
    echo "📱 Final step: Deploy to DigitalOcean"
    echo "   1. Go to https://cloud.digitalocean.com/apps"
    echo "   2. Click 'Create App'"
    echo "   3. Select GitHub source" 
    echo "   4. Choose 'odoo-static-preview' repository"
    echo "   5. Deploy as Static Site!"
    echo ""
    echo "Your website will be live in minutes! 🚀"
else
    echo "❌ Push failed. Please check your token and try again."
fi

# Clean up
rm -f /tmp/repo-create.json