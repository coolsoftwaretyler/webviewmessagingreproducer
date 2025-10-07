#!/bin/bash

# Plaid Configuration Setup Script
# This script helps you securely configure Plaid credentials

set -e

echo "🔐 Plaid Link Setup"
echo "=================="
echo ""
echo "This script will help you configure your Plaid credentials securely."
echo "Your credentials will be stored in a .env file (which is git-ignored)."
echo ""

# Check if .env already exists
if [ -f .env ]; then
    echo "⚠️  .env file already exists!"
    read -p "Do you want to overwrite it? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

# Prompt for credentials
echo ""
echo "📋 Please enter your Plaid credentials"
echo "   (Get these from: https://dashboard.plaid.com/developers/keys)"
echo ""

read -p "Plaid Client ID: " PLAID_CLIENT_ID
echo ""

# Use -s flag to hide the secret as it's typed
read -s -p "Plaid Sandbox Secret: " PLAID_SECRET
echo ""
echo ""

# Validate inputs
if [ -z "$PLAID_CLIENT_ID" ] || [ -z "$PLAID_SECRET" ]; then
    echo "❌ Error: Both Client ID and Secret are required!"
    exit 1
fi

# Create .env file
cat > .env << EOF
# Plaid API Credentials
# DO NOT COMMIT THIS FILE TO GIT!
# Get your credentials from: https://dashboard.plaid.com/developers/keys

PLAID_CLIENT_ID=$PLAID_CLIENT_ID
PLAID_SECRET=$PLAID_SECRET
EOF

# Ensure .env is in .gitignore
if [ ! -f .gitignore ]; then
    echo ".env" > .gitignore
    echo "✅ Created .gitignore with .env"
elif ! grep -q "^\.env$" .gitignore; then
    echo ".env" >> .gitignore
    echo "✅ Added .env to .gitignore"
fi

echo ""
echo "✅ Configuration saved to .env"
echo ""

# Ask if user wants to register Android package name now
echo "📱 Android Setup"
echo "================"
echo ""
echo "To use Plaid Link on Android, you need to register your package name:"
echo "   https://dashboard.plaid.com/developers/api"
echo "   Package name: com.coolsoftwaretyler.webviewmessage"
echo ""
read -p "Have you registered the Android package name? (y/N): " -n 1 -r
echo ""

SKIP_ANDROID=false
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "⚠️  Skipping Android support for now."
    echo "   Link tokens will work on iOS only."
    echo "   Run 'node generate-link-token.js' later after registering Android package."
    echo ""
    SKIP_ANDROID=true
fi

# Generate link token
echo ""
echo "🔄 Generating link token..."
echo ""

if [ "$SKIP_ANDROID" = true ]; then
    LINK_TOKEN=$(node generate-link-token-ios-only.js 2>&1 | grep "^link-" | head -1)
else
    LINK_TOKEN=$(node generate-link-token.js 2>&1 | grep "^link-" | head -1)
fi

if [ -z "$LINK_TOKEN" ]; then
    echo "❌ Failed to generate link token!"
    echo ""
    echo "Possible issues:"
    echo "  1. Invalid credentials - check your Client ID and Secret"
    echo "  2. Network issue - check your internet connection"
    if [ "$SKIP_ANDROID" = false ]; then
        echo "  3. Android package name not registered (try registering and waiting a minute)"
    fi
    echo ""
    echo "You can try generating manually:"
    if [ "$SKIP_ANDROID" = true ]; then
        echo "  node generate-link-token-ios-only.js"
    else
        echo "  node generate-link-token.js"
    fi
    exit 1
fi

echo "✅ Link token generated!"
echo ""

# Update the linkToken in index.tsx
INDEX_FILE="app/(tabs)/index.tsx"

if [ ! -f "$INDEX_FILE" ]; then
    echo "❌ Error: Could not find $INDEX_FILE"
    echo "   Please manually update the linkToken value to:"
    echo "   $LINK_TOKEN"
    exit 1
fi

# Use sed to replace the linkToken value
# This handles both empty string and existing token
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/const linkToken = \"[^\"]*\";/const linkToken = \"$LINK_TOKEN\";/" "$INDEX_FILE"
else
    # Linux
    sed -i "s/const linkToken = \"[^\"]*\";/const linkToken = \"$LINK_TOKEN\";/" "$INDEX_FILE"
fi

echo "✅ Updated $INDEX_FILE with link token"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✨ Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📱 Your link token: $LINK_TOKEN"
echo ""
echo "🚀 Next steps:"
echo "   1. Start your app:"
echo "      npm run ios      # or"
echo "      npm run android  # (requires Android package registration)"
echo ""
echo "   2. In the app:"
echo "      - Tap 'Initialize Plaid Link'"
echo "      - Tap 'Open Plaid Link'"
echo "      - Test the integration!"
echo ""
if [ "$SKIP_ANDROID" = true ]; then
    echo "⚠️  Note: Current token works on iOS only."
    echo "   To enable Android:"
    echo "   1. Register Android package name in Plaid Dashboard"
    echo "   2. Run: node generate-link-token.js"
    echo "   3. Update linkToken in $INDEX_FILE"
    echo ""
fi
echo "🔒 Remember: Never commit your .env file to git!"
echo ""
