#!/bin/bash

echo "Testing Canonical URL Redirects for odoo-experten-deutschland.de"
echo "================================================================"
echo ""

# Test www to non-www redirects
echo "Testing www redirects..."
echo ""

echo "1. Testing http://www.odoo-experten-deutschland.de"
curl -I -L --max-redirs 3 http://www.odoo-experten-deutschland.de 2>/dev/null | grep -E "^HTTP|^Location"
echo ""

echo "2. Testing https://www.odoo-experten-deutschland.de"
curl -I -L --max-redirs 3 https://www.odoo-experten-deutschland.de 2>/dev/null | grep -E "^HTTP|^Location"
echo ""

echo "3. Testing https://www.odoo-experten-deutschland.de/odoo/"
curl -I -L --max-redirs 3 https://www.odoo-experten-deutschland.de/odoo/ 2>/dev/null | grep -E "^HTTP|^Location"
echo ""

echo "4. Testing https://www.odoo-experten-deutschland.de/odoo-19/"
curl -I -L --max-redirs 3 https://www.odoo-experten-deutschland.de/odoo-19/ 2>/dev/null | grep -E "^HTTP|^Location"
echo ""

echo "5. Testing https://www.odoo-experten-deutschland.de/odoo-hosting/"
curl -I -L --max-redirs 3 https://www.odoo-experten-deutschland.de/odoo-hosting/ 2>/dev/null | grep -E "^HTTP|^Location"
echo ""

# Test canonical tags on actual pages
echo "Testing canonical tags on pages..."
echo ""

echo "6. Checking canonical tag on homepage"
curl -s https://odoo-experten-deutschland.de | grep -o '<link rel="canonical"[^>]*>' | head -1
echo ""

echo "7. Checking canonical tag on /odoo/"
curl -s https://odoo-experten-deutschland.de/odoo/ | grep -o '<link rel="canonical"[^>]*>' | head -1
echo ""

echo "8. Checking robots.txt"
curl -s https://odoo-experten-deutschland.de/robots.txt | head -10
echo ""

echo "Test complete!"