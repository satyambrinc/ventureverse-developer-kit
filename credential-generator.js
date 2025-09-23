#!/usr/bin/env node

/**
 * Simple VentureVerse App Credential Generator
 * 
 * Usage:
 * node credential-generator.js "Developer Name" "App Name" "developer@email.com"
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

function generateDeveloperCredentials(developerName, appName, email = '') {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  
  // Generate app ID
  const appId = `${appName.toLowerCase().replace(/[^a-z0-9]/g, '')}_${randomSuffix}`;
  
  // Generate secure encryption key
  const encryptionKey = crypto.randomBytes(32).toString('hex');
  
  return {
    appId,
    encryptionKey,
    developerName,
    appName,
    developerEmail: email,
    status: 'active',
    createdAt: new Date().toISOString()
  };
}

function updateAppRegistry(newApp) {
  const registryPath = path.join(__dirname, 'app-registry.json');
  
  let registry = { registered_apps: [] };
  
  // Read existing registry if it exists
  if (fs.existsSync(registryPath)) {
    const registryContent = fs.readFileSync(registryPath, 'utf8');
    registry = JSON.parse(registryContent);
  }
  
  // Add new app
  registry.registered_apps.push(newApp);
  
  // Write back to file
  fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2));
  
  console.log(`✅ App registry updated: ${registryPath}`);
}

function generateCodeSnippet(credentials) {
  return `
// Integration Code for ${credentials.appName}
import { VentureVerseSDK } from '@ventureverse/sdk';

const sdk = new VentureVerseSDK({
  appId: '${credentials.appId}',
  encryptionKey: '${credentials.encryptionKey}',
  debug: false
});

await sdk.initialize();
const user = await sdk.getUserProfile();
`;
}

function generateEmailTemplate(credentials) {
  return `
Subject: Your VentureVerse App Credentials - ${credentials.appName}

Hi ${credentials.developerName},

Your VentureVerse app "${credentials.appName}" has been set up! Here are your credentials:

🆔 App ID: ${credentials.appId}
🔑 Encryption Key: ${credentials.encryptionKey}

⚠️ Keep these credentials secure and never share them publicly.

Quick Setup Guide:
1. Install SDK: npm install @ventureverse/sdk
2. Use this integration code:

\`\`\`javascript
import { VentureVerseSDK } from '@ventureverse/sdk';

const sdk = new VentureVerseSDK({
  appId: '${credentials.appId}',
  encryptionKey: '${credentials.encryptionKey}',
  debug: false
});

await sdk.initialize();
const user = await sdk.getUserProfile();
\`\`\`

📚 Documentation: https://github.com/ventureverse/developer-kit
🧪 Test Integration: https://github.com/ventureverse/developer-kit/blob/main/examples/iframe-test.html

Test URL format:
https://your-app.com?iframe_mode=true&user_id=123&user_email=test@example.com&user_name=Test%20User

Questions? Reply to this email.

Best regards,
VentureVerse Team
`;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.log('\n🚀 VentureVerse Credential Generator');
    console.log('Usage: node credential-generator.js "Developer Name" "App Name" [email]');
    console.log('Example: node credential-generator.js "John Doe" "AI Analytics App" "john@example.com"');
    process.exit(1);
  }
  
  const [developerName, appName, email] = args;
  
  console.log('\n🚀 Generating VentureVerse App Credentials...');
  console.log(`Developer: ${developerName}`);
  console.log(`App Name: ${appName}`);
  console.log(`Email: ${email || 'Not provided'}\n`);
  
  // Generate credentials
  const credentials = generateDeveloperCredentials(developerName, appName, email);
  
  // Display results
  console.log('✅ Credentials Generated:');
  console.log(`   App ID: ${credentials.appId}`);
  console.log(`   Encryption Key: ${credentials.encryptionKey}`);
  console.log(`   Created: ${credentials.createdAt}\n`);
  
  // Update registry
  updateAppRegistry(credentials);
  
  // Generate code snippet
  console.log('📋 Integration Code:');
  console.log(generateCodeSnippet(credentials));
  
  // Generate email template
  console.log('\n📧 Email Template:');
  console.log(generateEmailTemplate(credentials));
  
  // Save email template to file
  const emailPath = path.join(__dirname, `email-${credentials.appId}.txt`);
  fs.writeFileSync(emailPath, generateEmailTemplate(credentials));
  console.log(`\n📄 Email template saved: ${emailPath}`);
  
  console.log('\n🎉 Done! Send the email template to your developer.');
}

if (require.main === module) {
  main();
}

module.exports = { generateDeveloperCredentials, updateAppRegistry };