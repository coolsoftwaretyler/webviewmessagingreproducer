#!/usr/bin/env node

/**
 * Script to generate a Plaid Link token for iOS testing (no Android package name)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Load .env file
function loadEnv() {
  const envPath = path.join(__dirname, '.env');

  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: .env file not found!');
    console.error('');
    console.error('Please run the setup script first:');
    console.error('  ./setup-plaid.sh');
    console.error('');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  return envVars;
}

const env = loadEnv();
const PLAID_CLIENT_ID = env.PLAID_CLIENT_ID;
const PLAID_SECRET = env.PLAID_SECRET;

if (!PLAID_CLIENT_ID || !PLAID_SECRET) {
  console.error('❌ Error: Missing credentials in .env file');
  console.error('Please run ./setup-plaid.sh to configure your credentials');
  process.exit(1);
}

const requestBody = JSON.stringify({
  client_id: PLAID_CLIENT_ID,
  secret: PLAID_SECRET,
  client_name: 'WebView Message Test App',
  user: {
    client_user_id: 'test-user-' + Date.now(),
  },
  products: ['auth', 'transactions'],
  country_codes: ['US'],
  language: 'en',
  // NO android_package_name - this is for iOS testing only
});

const options = {
  hostname: 'sandbox.plaid.com',
  port: 443,
  path: '/link/token/create',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(requestBody),
  },
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      if (response.link_token) {
        // Just output the token on its own line for easy parsing by scripts
        console.log(response.link_token);

        // Only show additional info if run directly (not piped)
        if (process.stdout.isTTY) {
          console.log('\n✅ Success! Your link token is shown above.');
          console.log(`⏰ This token expires at: ${response.expiration}`);
          console.log('⚠️  Note: This token will work on iOS but NOT on Android');
          console.log('\n📋 To update your app automatically:');
          console.log('   Run ./setup-plaid.sh');
        }
      } else {
        console.error('❌ Error generating link token:');
        console.error(JSON.stringify(response, null, 2));
      }
    } catch (error) {
      console.error('❌ Failed to parse response:', error.message);
      console.error('Raw response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});

req.write(requestBody);
req.end();
