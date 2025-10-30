# VentureVerse Developer Kit

Welcome to the VentureVerse Developer Kit! This package provides everything you need to integrate your applications with the VentureVerse platform using our secure API key authentication system.

## 🚀 Quick Start

### Installation

```bash
npm install @ventureverse/sdk
```

### Basic Usage

```javascript
import { VentureVerseSDKSecure } from '@ventureverse/sdk';

const sdk = new VentureVerseSDKSecure({
  apiKey: 'vv_your_api_key_here',
  apiSecret: 'vv_secret_your_api_secret_here',
  debug: true
});

await sdk.initialize();
const user = await sdk.getUserProfile();
await sdk.deductCredits(0.50, 'Feature usage');
```

## 🔑 Getting Your API Key

### 1. Access Developer Console

**Important**: The VentureVerse Developer Console is currently invitation-only.

To get access:
1. Contact the VentureVerse team for developer access
2. You will receive login credentials for the developer portal
3. Access the developer console through your VentureVerse platform account

### 2. Create Your First App

1. In the Developer Console, click **"Create New App"**
2. Fill in your application details:
   - **App Name**: Unique name for your application
   - **Description**: Brief description of what your app does
   - **App URL**: Where your app will be hosted
3. Choose initial status: `dev` (development mode)
4. Click **"Create App"**

### 3. Get Your API Credentials

- **API Key** and **API Secret** are generated immediately upon app creation
- **API Key Format**: `vv_abc123def456...`
- **API Secret Format**: `vv_secret_xyz789...`
- Copy and securely store both credentials
- Never expose API credentials in client-side code
- API Secret is required for enhanced security features

## 📊 App Status System

| Status | Description | Developer Control |
|--------|-------------|-------------------|
| `dev` | Development mode for testing | ✅ Can set |
| `reviewing` | Submitted for platform review | ✅ Can set |
| `disabled` | App deactivated | ✅ Can set |

**Note**: Approved apps are automatically deployed by the VentureVerse platform team.

## 🏗️ Integration Guide

### 1. Initialize the SDK

```javascript
import { VentureVerseSDKSecure } from '@ventureverse/sdk';

const sdk = new VentureVerseSDKSecure({
  apiKey: process.env.VENTUREVERSE_API_KEY, // Store securely
  apiSecret: process.env.VENTUREVERSE_API_SECRET, // Store securely
  environment: 'production', // or 'development'
  debug: false, // Set to true for development
  enableEncryption: true, // Enhanced security
  encryptionKey: process.env.VENTUREVERSE_ENCRYPTION_KEY // Optional
});

// Initialize when your app starts
try {
  await sdk.initialize();
  console.log('VentureVerse SDK initialized successfully');
} catch (error) {
  console.error('Failed to initialize SDK:', error);
}
```

### 2. User Authentication

```javascript
// Check if user is authenticated
const user = await sdk.auth.getCurrentUser();

if (!user) {
  // Redirect to VentureVerse login
  await sdk.auth.redirectToLogin();
} else {
  console.log('Current user:', user);
  // User is authenticated, proceed with app logic
}
```

### 3. User Profile Access

```javascript
// Get detailed user profile
const profile = await sdk.getUserProfile();
console.log('User profile:', {
  id: profile.id,
  name: profile.name,
  email: profile.email,
  tier: profile.tier.name,
  credits: profile.credits
});
```

### 4. Credit Management

```javascript
// Check user's credit balance
const credits = await sdk.getCredits();
console.log(`User has ${credits} credits remaining`);

// Deduct credits for app usage
try {
  await sdk.deductCredits(1.5, 'Premium feature usage');
  console.log('Credits deducted successfully');
} catch (error) {
  console.error('Insufficient credits:', error);
  // Handle insufficient credits (show upgrade prompt, etc.)
}

// Check if user has enough credits before expensive operations
const hasCredits = await sdk.hasCredits(2.0);
if (hasCredits) {
  // Proceed with operation
  await performExpensiveOperation();
  await sdk.deductCredits(2.0, 'Expensive operation');
}
```

### 5. Error Handling

```javascript
try {
  await sdk.deductCredits(1.0, 'Feature usage');
} catch (error) {
  switch (error.code) {
    case 'INSUFFICIENT_CREDITS':
      showUpgradePrompt();
      break;
    case 'INVALID_API_KEY':
      console.error('API key is invalid or revoked');
      break;
    case 'RATE_LIMIT_EXCEEDED':
      console.error('Rate limit exceeded, try again later');
      break;
    default:
      console.error('Unexpected error:', error);
  }
}
```

### 6. Iframe Integration

```javascript
// Detect if running inside VentureVerse iframe
if (sdk.isInIframe()) {
  // App is running inside VentureVerse platform
  console.log('Running in VentureVerse iframe');
  
  // Additional iframe-specific setup
  sdk.iframe.onResize((width, height) => {
    console.log(`Iframe resized: ${width}x${height}`);
  });
}
```

## 🔐 API Key Management

### Viewing Your API Key

1. Go to your app in the Developer Console
2. Click **"Show API Key"** to reveal the full key
3. Copy the key for use in your application

### Rotating API Keys

⚠️ **Important**: Rotating invalidates the old key immediately.

1. In your app details, click **"Rotate API Key"**
2. Confirm the action
3. **Immediately** update your application with the new key
4. Test that your app works with the new key

### Security Best Practices

- Store API keys and secrets in environment variables
- Never expose credentials in client-side code
- Use the secure SDK with encryption enabled
- Rotate credentials regularly (monthly/quarterly)
- Monitor usage patterns for anomalies
- Revoke compromised credentials immediately
- Enable request signing for additional security
- Use HTTPS for all communications

## 📈 Rate Limits

Default limits:
- **10,000 requests/day**
- **100 requests/minute**

Monitor your usage in the Developer Console. Contact support for higher limits with:
- Detailed usage projections
- Business justification
- Technical implementation plan

## 📋 API Reference

### Core Methods

#### `initialize()`
Initialize the SDK. Must be called before using other methods.

```javascript
await sdk.initialize();
```

#### `getUserProfile()`
Get the current user's profile information.

```javascript
const profile = await sdk.getUserProfile();
// Returns: { id, name, email, tier, credits, ... }
```

#### `getCredits()`
Get user's current credit balance.

```javascript
const credits = await sdk.getCredits();
// Returns: number
```

#### `hasCredits(amount)`
Check if user has sufficient credits.

```javascript
const hasEnough = await sdk.hasCredits(1.5);
// Returns: boolean
```

#### `deductCredits(amount, description)`
Deduct credits from user's account.

```javascript
await sdk.deductCredits(1.0, 'Feature usage');
// Returns: void (throws error if insufficient credits)
```

### Authentication Methods

#### `auth.getCurrentUser()`
Get current authenticated user.

```javascript
const user = await sdk.auth.getCurrentUser();
// Returns: User object or null
```

#### `auth.redirectToLogin()`
Redirect to VentureVerse login page.

```javascript
await sdk.auth.redirectToLogin();
```

### Iframe Methods

#### `isInIframe()`
Check if app is running inside VentureVerse iframe.

```javascript
const inIframe = sdk.isInIframe();
// Returns: boolean
```

#### `iframe.onResize(callback)`
Listen for iframe resize events.

```javascript
sdk.iframe.onResize((width, height) => {
  console.log(`New size: ${width}x${height}`);
});
```

## 🚨 Troubleshooting

### Common Issues

#### "Invalid API Key" Errors
- Check if key was recently rotated/revoked
- Verify key format starts with `vv_`
- Ensure no extra spaces or characters
- Check if app status is `disabled`

#### Rate Limit Exceeded
- Check current usage in Developer Console
- Implement request queuing/throttling
- Contact support for higher limits

#### Credit Deduction Failures
- Verify user has sufficient credits
- Check credit amount is valid (positive number)
- Ensure description is provided

#### SDK Initialization Fails
- Verify API key is correct and active
- Check network connectivity
- Enable debug mode for detailed logs

### Debug Mode

Enable debug mode for detailed logging:

```javascript
const sdk = new VentureVerseSDKSecure({
  apiKey: 'your-api-key',
  apiSecret: 'your-api-secret',
  debug: true
});
```

This will log all API requests, responses, and errors to the console.

## 🔒 Security Features

The VentureVerse SDK Secure edition includes enterprise-grade security:

### Built-in Security
- **Dual Authentication**: API Key + Secret for enhanced security
- **AES-256-GCM Encryption**: End-to-end encryption for sensitive data
- **HMAC-SHA256 Signing**: Request signing to prevent tampering
- **Rate Limiting**: Built-in protection against abuse
- **Session Management**: Secure session handling and token management

### Advanced Features
- **Request Signing**: All requests signed with HMAC-SHA256
- **Encrypted Parameters**: Sensitive data encrypted before transmission
- **Error Monitoring**: Comprehensive error tracking and reporting
- **Resource Management**: Automatic cleanup and memory management
- **Retry Logic**: Intelligent retry with exponential backoff

### Security Configuration

```javascript
const sdk = new VentureVerseSDKSecure({
  apiKey: 'vv_your_api_key',
  apiSecret: 'vv_secret_your_secret',
  enableEncryption: true, // Enable AES encryption
  encryptionKey: 'your-encryption-key', // Custom encryption key
  timeout: 10000, // Request timeout
  debug: false // Disable in production
});
```

## 📁 Repository Structure

```
ventureverse-developer-kit/
├── src/
│   ├── ventureverse-sdk-secure.js  # Secure SDK with encryption
│   ├── ventureverse-sdk.js         # Basic SDK (legacy)
│   └── types.d.ts                  # TypeScript definitions
├── examples/
│   ├── demo-app/                   # Complete demo application
│   ├── basic-app/                  # Simple integration example
│   └── iframe-test.html            # Testing playground
├── docs/
│   └── API_REFERENCE.md            # Detailed API documentation
└── templates/
    └── vanilla-js-template/        # Ready-to-use template
```

## 🧪 Testing Your Integration

1. Use the examples in the `examples/` directory
2. Start with `basic-app/` for a simple integration
3. Use `iframe-test.html` for testing iframe functionality
4. Test with URL parameters to simulate VentureVerse context:

```
file:///path/to/iframe-test.html?iframe_mode=true&user_id=123&user_email=test@example.com&user_name=John%20Doe
```

## 🎯 Next Steps

1. **Create your app** in the Developer Console
2. **Get your API key** and store it securely
3. **Follow the integration guide** above
4. **Test thoroughly** using the provided examples
5. **Submit for review** when ready for production

## 📞 Support

- **Documentation**: This comprehensive guide
- **Examples**: Working templates in `/examples`
- **GitHub Issues**: Report bugs and feature requests
- **Developer Console**: Built-in help and tutorials

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready to build amazing apps on VentureVerse? Start with the integration guide above!**