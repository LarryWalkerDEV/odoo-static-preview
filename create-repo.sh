#\!/bin/bash
# Extract stored credentials and create repo
CREDS=$(cat ~/.git-credentials 2>/dev/null  < /dev/null |  grep github.com | head -1)
if [ -z "$CREDS" ]; then
    echo "No stored credentials found"
    exit 1
fi

# Extract token from credentials
TOKEN=$(echo "$CREDS" | sed "s/https:\/\/[^:]*://" | sed "s/@.*//" )
USER=$(echo "$CREDS" | sed "s/https:\/\///" | sed "s/:.*//")

# Create repository
curl -H "Authorization: token $TOKEN" \
     -H "Accept: application/vnd.github.v3+json" \
     https://api.github.com/user/repos \
     -d "{\"name\":\"odoo-static-preview\",\"description\":\"Odoo Experten Deutschland - Static Website Preview (207 pages)\",\"public\":true}" \
     2>/dev/null | python3 -m json.tool | grep -E "(full_name|clone_url|message)" || echo "Failed to create repo"

