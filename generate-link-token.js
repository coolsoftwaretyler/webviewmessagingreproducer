#!/usr/bin/env node

/**
 * Script to generate a Plaid Link token for testing
 *
 * Usage:
 *   PLAID_CLIENT_ID=your_client_id PLAID_SECRET=your_sandbox_secret node generate-link-token.js
 *
 * Or set the values directly in this file (not recommended for production)
 */

const https = require('https');

// Get credentials from environment variables or set them here
const PLAID_CLIENT_ID ='68e58133975dcf00249f7827'
const PLAID_SECRET ='a4c431fc38cbd9641a1cfa6314efc1';

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
  // For Android, you need to specify the package name
  android_package_name: 'com.coolsoftwaretyler.webviewmessage',
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

console.log('Generating Plaid Link token...\n');

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(data);

      if (response.link_token) {
        console.log('✅ Success! Your link token is:\n');
        console.log(response.link_token);
        console.log('\n📋 Copy this token and paste it into the app\'s text input field.');
        console.log(`\n⏰ This token expires at: ${response.expiration}`);
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
