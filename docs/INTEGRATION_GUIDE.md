# VentureVerse Third-Party App Integration Guide

## Overview

This comprehensive guide explains how to integrate your application with the VentureVerse platform, enabling seamless user authentication, credit management, and profile synchronization within our iframe ecosystem.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Authentication & User Context](#authentication--user-context)
3. [Credit System Integration](#credit-system-integration)
4. [Message-Based Communication](#message-based-communication)
5. [Security Considerations](#security-considerations)
6. [Testing & Development](#testing--development)
7. [API Reference](#api-reference)
8. [Examples](#examples)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## Getting Started

### Prerequisites

- Your application must support iframe embedding
- HTTPS endpoint (required for production)
- Basic understanding of postMessage API
- Ability to handle URL parameters

### Quick Start

1. **Register Your Application**
   ```bash
   # Contact VentureVerse team to register your app
   # Provide: App name, description, icon, category, pricing
   ```

2. **Enable iframe Support**
   ```html
   <!-- Ensure your app can be embedded -->
   <meta http-equiv="Content-Security-Policy" content="frame-ancestors 'self' https://ventureverse.com https://*.ventureverse.com;">
   ```

3. **Handle URL Parameters**
   ```javascript
   const urlParams = new URLSearchParams(window.location.search);
   const isIframe = urlParams.get('iframe_mode') === 'true';
   const userId = urlParams.get('user_id');
   const userEmail = urlParams.get('user_email');
   const userName = urlParams.get('user_name');
   ```

---

## Authentication & User Context

### URL Parameters

When your app is launched through VentureVerse, you'll receive these parameters:

| Parameter | Type | Description |
|-----------|------|-------------|
| `iframe_mode` | boolean | Always `true` when embedded |
| `user_id` | number | Unique user identifier |
| `user_email` | string | User's email address |
| `user_name` | string | User's full name |
| `app_id` | number | Your application ID |
| `auth_token` | string | Optional authentication token |

### Requesting User Profile

```javascript
// Request complete user profile
function requestUserProfile() {
  if (window.parent && isIframe) {
    window.parent.postMessage({
      type: 'REQUEST_USER_PROFILE',
      payload: {},
      timestamp: new Date().toISOString(),
      source: 'iframe'
    }, '*');
  }
}

// Handle profile response with robust error handling
window.addEventListener('message', (event) => {
  if (event.data.type === 'USER_PROFILE_RESPONSE') {
    if (event.data.payload.error) {
      console.error('API error, falling back to URL parameters');
      // Use URL parameters as fallback with zero credits
      setUserProfile({
        id: parseInt(urlParams.get('user_id') || '1'),
        email: urlParams.get('user_email') || 'fallback@ventureverse.com',
        first_name: urlParams.get('user_name')?.split(' ')[0] || 'User',
        last_name: urlParams.get('user_name')?.split(' ')[1] || 'Name',
        monthly_credit_balance: 0,
        top_up_credit_balance: 0,
        tier_id: 1,
        user_roles: ['founder']
      });
    } else {
      const userData = event.data.payload.user;
      if (!userData) {
        console.log('Null user data, using URL params with zero credits');
        // Handle null response - use URL params with zero credits
        setUserProfile({
          id: parseInt(urlParams.get('user_id') || '1'),
          email: urlParams.get('user_email') || 'no-data@ventureverse.com',
          first_name: urlParams.get('user_name')?.split(' ')[0] || 'No',
          last_name: urlParams.get('user_name')?.split(' ')[1] || 'Data',
          monthly_credit_balance: 0,
          top_up_credit_balance: 0,
          tier_id: 1,
          user_roles: ['founder']
        });
      } else {
        // Use actual user data with credit defaults
        setUserProfile({
          ...userData,
          monthly_credit_balance: userData.monthly_credit_balance || 0,
          top_up_credit_balance: userData.top_up_credit_balance || 0,
        });
      }
    }
  }
});

// Add timeout fallback for API responses
setTimeout(() => {
  if (!userProfile) {
    console.log('API timeout, using URL params with zero credits');
    setUserProfile({
      id: parseInt(urlParams.get('user_id') || '1'),
      email: urlParams.get('user_email') || 'timeout@ventureverse.com',
      first_name: urlParams.get('user_name')?.split(' ')[0] || 'Timeout',
      last_name: urlParams.get('user_name')?.split(' ')[1] || 'User',
      monthly_credit_balance: 0,
      top_up_credit_balance: 0,
      tier_id: 1,
      user_roles: ['founder']
    });
  }
}, 3000); // 3 second timeout
```

### User Profile Structure

```javascript
{
  id: 123,
  email: "user@example.com",
  first_name: "John",
  last_name: "Doe",
  avatar: "https://example.com/avatar.jpg",
  nick_name: "johndoe",
  monthly_credit_balance: 750.0,
  top_up_credit_balance: 250.0,
  tier_id: 2,
  user_roles: ["founder", "mentor"],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-01T00:00:00Z"
}
```

---

## Credit System Integration

### Understanding Credits

- **Monthly Credits**: Subscription-based allocation, resets monthly
- **Top-up Credits**: Pay-per-use credits, persistent until spent
- **Cost Calculation**: VentureVerse handles all credit calculations internally using `(USD_cost × 1.7) ÷ 0.01 = Credits_required`

### ⚠️ Important: USD Cost Only

**Third-party applications must only pass raw USD amounts for credit deduction.** 

- ✅ **Correct**: `cost: 0.50` (USD amount)
- ❌ **Incorrect**: `cost: 85` (pre-calculated credits)
- ❌ **Incorrect**: `cost: 0.85` (USD amount × 1.7)

The VentureVerse platform automatically handles all credit conversion calculations. Your application should only provide the actual USD cost of the service or feature being used.

### Credit Deduction

```javascript
function deductCredits(usdCost, description, estimation = false) {
  window.parent.postMessage({
    type: 'DEDUCT_CREDITS',
    payload: {
      cost: usdCost,                 // ⚠️ IMPORTANT: Raw USD amount only (e.g., 0.50)
      type: 'app_usage',            // Required: app_usage, content_procurement, etc.
      description: description,      // Human-readable description
      estimation: estimation        // true for cost preview, false for actual deduction
    },
    timestamp: new Date().toISOString(),
    source: 'iframe'
  }, '*');
}

// Example usage - Pass only USD amounts
deductCredits(0.50, "AI Pitch Analysis", false);     // Platform converts: 0.50 USD → 85 credits
deductCredits(0.10, "Document Processing", false);   // Platform converts: 0.10 USD → 17 credits  
deductCredits(1.00, "Premium Feature", false);       // Platform converts: 1.00 USD → 170 credits

// ❌ NEVER do this - Don't pre-calculate credits
// deductCredits(85, "AI Pitch Analysis", false);    // WRONG: This is credits, not USD
// deductCredits(0.85, "AI Pitch Analysis", false);  // WRONG: This is USD × 1.7, not raw USD
```

### Handling Credit Responses

```javascript
window.addEventListener('message', (event) => {
  if (event.data.type === 'CREDIT_DEDUCTION_RESPONSE') {
    const response = event.data.payload;
    
    if (response.error) {
      alert('Credit deduction failed: ' + response.error);
      return;
    }
    
    console.log(`Credits deducted: ${response.credits_deducted}`);
    console.log(`Estimation mode: ${response.estimation}`);
    
    if (response.remaining_balance) {
      // Update local user credit info
      updateLocalCreditBalance(response.remaining_balance);
    }
  }
});
```

### Check Credit Balance

```javascript
function checkCreditBalance() {
  window.parent.postMessage({
    type: 'CHECK_CREDIT_BALANCE',
    payload: {},
    timestamp: new Date().toISOString(),
    source: 'iframe'
  }, '*');
}
```

---

## Message-Based Communication

### Available Message Types

#### Outgoing (Your App → VentureVerse)

| Message Type | Purpose | Payload |
|-------------|---------|---------|
| `REQUEST_USER_PROFILE` | Get user profile | `{}` |
| `DEDUCT_CREDITS` | Deduct user credits | `{cost, type, description, estimation}` |
| `CHECK_CREDIT_BALANCE` | Get credit info | `{}` |
| `TRACK_ACTIVITY` | Log user activity | `{app_id, activity_type, metadata}` |
| `REQUEST_PERMISSION` | Ask for permissions | `{app_name, action}` |

#### Incoming (VentureVerse → Your App)

| Message Type | Purpose | Payload |
|-------------|---------|---------|
| `USER_PROFILE_RESPONSE` | User profile data | `{user}` or `{error}` |
| `CREDIT_DEDUCTION_RESPONSE` | Credit operation result | `{success, credits_deducted, remaining_balance}` |
| `CREDIT_BALANCE_RESPONSE` | Current credit info | `{credit_info, total_balance}` |
| `ACTIVITY_TRACKING_RESPONSE` | Activity logged | `{success}` |
| `PERMISSION_RESPONSE` | Permission granted/denied | `{granted, action}` |
| `ERROR` | General error | `{message, error}` |

### Message Structure

```javascript
{
  type: "MESSAGE_TYPE",           // Required: Message type identifier
  payload: { /* data */ },        // Required: Message payload
  timestamp: "2024-01-01T00:00:00Z", // Required: ISO timestamp
  source: "iframe"                // Required: Always "iframe" for your messages
}
```

---

## Encryption & Security

### Data Encryption

VentureVerse supports automatic encryption of sensitive URL parameters to protect user data during transmission. The encryption uses a symmetric XOR cipher with base64 encoding.

#### Using the VentureVerse SDK with Encryption

```javascript
import { VentureVerseSDK } from './ventureverse-sdk.js';

const sdk = new VentureVerseSDK({
  appId: 'your-app-id',
  encryptionKey: 'your-secret-key', // Should be provided by VentureVerse
  enableEncryption: true, // Default: true
  debug: false
});

await sdk.initialize();

// The SDK will automatically decrypt URL parameters
const user = await sdk.getUserProfile();
```

#### Manual Encryption/Decryption

```javascript
import { VentureVerseEncryption } from './ventureverse-sdk.js';

const encryption = new VentureVerseEncryption('your-secret-key');

// Encrypt sensitive data
const encryptedEmail = encryption.encrypt('user@example.com');
console.log('Encrypted:', encryptedEmail); // Outputs: base64 encoded string

// Decrypt data
const decryptedEmail = encryption.decrypt(encryptedEmail);
console.log('Decrypted:', decryptedEmail); // Outputs: user@example.com

// Encrypt URL parameters
const params = {
  user_id: '123',
  user_email: 'user@example.com',
  iframe_mode: 'true'
};

const encryptedParams = encryption.encryptUrlParams(params);
// Only sensitive parameters (user_id, user_email, user_name, auth_token) are encrypted
// iframe_mode remains unencrypted
```

#### Handling Encrypted Parameters

Your application should automatically detect and handle encrypted parameters:

```javascript
function parseUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const rawParams = Object.fromEntries(urlParams.entries());
  
  // Try to detect if parameters are encrypted
  const isEncrypted = urlParams.get('user_email')?.includes('='); // Base64 indicator
  
  if (isEncrypted) {
    const encryption = new VentureVerseEncryption('your-secret-key');
    return encryption.decryptUrlParams(rawParams);
  }
  
  return rawParams;
}

// Get user data with automatic decryption
const params = parseUrlParams();
const userId = params.user_id;
const userEmail = params.user_email;
```

#### Integration with Iframe Creation

When VentureVerse creates iframe URLs, it can automatically encrypt sensitive parameters:

```javascript
// In the VentureVerse platform
const iframeUrl = IFrameService.createIframeUrl(
  'https://your-app.com/app',
  user,
  appId,
  true // Enable encryption
);

// Result: https://your-app.com/app?user_id=encrypted_value&user_email=encrypted_value&iframe_mode=true
```

---

## Security Considerations

### Content Security Policy

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  frame-ancestors 'self' https://ventureverse.com https://*.ventureverse.com;
  connect-src 'self' https://api.ventureverse.com https://stageminiapp.ventureverse.com;
  script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
">
```

### Data Handling

- **Never store sensitive user data locally**
- **Validate all incoming messages**
- **Use HTTPS for all communications**
- **Implement proper error handling**

### Input Validation

```javascript
function validateMessage(event) {
  // Verify message structure
  if (!event.data || typeof event.data !== 'object') {
    return false;
  }
  
  // Check required fields
  if (!event.data.type || !event.data.timestamp || !event.data.source) {
    return false;
  }
  
  // Validate source
  if (event.data.source !== 'parent') {
    return false;
  }
  
  return true;
}

window.addEventListener('message', (event) => {
  if (!validateMessage(event)) {
    console.warn('Invalid message received:', event.data);
    return;
  }
  
  // Process valid message
  handleMessage(event.data);
});
```

---

## Testing & Development

### Demo App

Access our demo app to see the integration in action:
- **URL**: `https://ventureverse.com/dummy-app`
- **Iframe URL**: `https://ventureverse.com/dummy-app?iframe_mode=true`

### Development Checklist

- [ ] Handle iframe mode detection
- [ ] Implement user profile request/response
- [ ] Add credit deduction functionality
- [ ] Test error scenarios
- [ ] Implement activity tracking
- [ ] Add permission requests for sensitive operations
- [ ] Test with different user roles and credit levels
- [ ] Validate message handling
- [ ] Test responsive design in iframe
- [ ] Implement proper error boundaries

### Development Mode

**Production API Integration**: The VentureVerse platform uses real API endpoints even in development mode:
- All credit deductions are processed through live APIs
- Real credit balance updates
- Actual transaction records created  
- Full production behavior for testing

**Development Server Setup**: Use `vercel dev` instead of `vite` to enable API endpoint support:
```bash
npx vercel dev --port 3000
```

This allows you to test with real API functionality during development.

### Local Testing

```javascript
// Mock VentureVerse environment for local testing
if (!window.parent || window.parent === window) {
  // Not in iframe - create mock responses
  setTimeout(() => {
    window.dispatchEvent(new MessageEvent('message', {
      data: {
        type: 'USER_PROFILE_RESPONSE',
        payload: {
          user: {
            id: 1,
            email: 'test@example.com',
            first_name: 'Test',
            last_name: 'User',
            monthly_credit_balance: 1000,
            top_up_credit_balance: 500
          }
        },
        timestamp: new Date().toISOString(),
        source: 'parent'
      }
    }));
  }, 1000);
}
```

---

## API Reference

### Message-Based Communication

Third-party applications communicate with VentureVerse through the **postMessage API** only. No direct API calls are made to backend services.

#### Credit System

**Request Credit Deduction:**
```javascript
// Send message to VentureVerse platform
window.parent.postMessage({
  type: 'DEDUCT_CREDITS',
  payload: {
    cost: 0.50,                    // ⚠️ Raw USD amount only
    type: 'app_usage',
    description: 'Feature description',
    estimation: false              // true for cost preview only
  },
  timestamp: new Date().toISOString(),
  source: 'iframe'
}, '*');
```

**Credit Calculation Formula**: 
- Current credit pricing: 0.01 USD per credit
- 70% markup applied: `(USD × 1.7) ÷ 0.01 = Credits`
- Example: $0.50 → (0.50 × 1.7) ÷ 0.01 = 85 credits

**Response Format:**
```javascript
// Listen for response
window.addEventListener('message', (event) => {
  if (event.data.type === 'CREDIT_DEDUCTION_RESPONSE') {
    const response = event.data.payload;
    if (response.success) {
      console.log(`Credits deducted: ${response.credits_deducted}`);
    }
  }
});
```

#### Activity Tracking

**Track User Activity:**
```javascript
window.parent.postMessage({
  type: 'TRACK_ACTIVITY',
  payload: {
    app_id: 1,
    activity_type: 'app_usage',
    metadata: {
      action: 'feature_used',
      timestamp: new Date().toISOString()
    }
  },
  timestamp: new Date().toISOString(),
  source: 'iframe'
}, '*');
```

### Security

All communication is secured through:
- Origin validation on VentureVerse platform
- Message structure validation
- User authentication handled by VentureVerse
- No direct API tokens required for third-party apps

---

## Examples

### Complete Integration Example

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>VentureVerse Integration Example</title>
    <meta http-equiv="Content-Security-Policy" content="frame-ancestors 'self' https://ventureverse.com https://*.ventureverse.com;">
</head>
<body>
    <div id="app">
        <h1>My VentureVerse App</h1>
        <div id="user-info">Loading user...</div>
        <div id="credit-info">Loading credits...</div>
        <button onclick="performPaidAction()">Use Feature (10 credits)</button>
        <div id="activity-log"></div>
    </div>

    <script>
        class VentureVerseIntegration {
            constructor() {
                this.isIframe = this.checkIframeMode();
                this.user = null;
                this.credits = null;
                
                if (this.isIframe) {
                    this.initializeIntegration();
                }
            }
            
            checkIframeMode() {
                const urlParams = new URLSearchParams(window.location.search);
                return urlParams.get('iframe_mode') === 'true';
            }
            
            initializeIntegration() {
                window.addEventListener('message', this.handleMessage.bind(this));
                this.requestUserProfile();
                this.checkCreditBalance();
            }
            
            sendMessage(type, payload) {
                if (window.parent && this.isIframe) {
                    window.parent.postMessage({
                        type,
                        payload,
                        timestamp: new Date().toISOString(),
                        source: 'iframe'
                    }, '*');
                }
            }
            
            handleMessage(event) {
                const message = event.data;
                
                switch (message.type) {
                    case 'USER_PROFILE_RESPONSE':
                        this.handleUserProfile(message.payload);
                        break;
                    case 'CREDIT_DEDUCTION_RESPONSE':
                        this.handleCreditDeduction(message.payload);
                        break;
                    case 'CREDIT_BALANCE_RESPONSE':
                        this.handleCreditBalance(message.payload);
                        break;
                }
            }
            
            requestUserProfile() {
                this.sendMessage('REQUEST_USER_PROFILE', {});
            }
            
            checkCreditBalance() {
                this.sendMessage('CHECK_CREDIT_BALANCE', {});
            }
            
            deductCredits(usdCost, description) {
                this.sendMessage('DEDUCT_CREDITS', {
                    cost: usdCost,             // ⚠️ Always pass raw USD amount
                    type: 'app_usage',
                    description,
                    estimation: false
                });
            }
            
            trackActivity(action, metadata = {}) {
                this.sendMessage('TRACK_ACTIVITY', {
                    app_id: 1, // Your app ID
                    activity_type: 'app_usage',
                    metadata: { action, ...metadata }
                });
            }
            
            handleUserProfile(payload) {
                if (payload.error) {
                    document.getElementById('user-info').textContent = 'Error loading user';
                    return;
                }
                
                this.user = payload.user;
                document.getElementById('user-info').innerHTML = `
                    <h3>Welcome, ${this.user.first_name} ${this.user.last_name}!</h3>
                    <p>Email: ${this.user.email}</p>
                    <p>Roles: ${this.user.user_roles.join(', ')}</p>
                `;
            }
            
            handleCreditBalance(payload) {
                if (payload.error) {
                    document.getElementById('credit-info').textContent = 'Error loading credits';
                    return;
                }
                
                this.credits = payload.credit_info;
                const total = this.credits.monthly_credit_balance + this.credits.topup_credit_balance;
                document.getElementById('credit-info').innerHTML = `
                    <h3>Credit Balance: ${total}</h3>
                    <p>Monthly: ${this.credits.monthly_credit_balance}</p>
                    <p>Top-up: ${this.credits.topup_credit_balance}</p>
                `;
            }
            
            handleCreditDeduction(payload) {
                if (payload.error) {
                    alert('Credit deduction failed: ' + payload.error);
                    return;
                }
                
                alert(`Success! ${payload.credits_deducted} credits deducted.`);
                this.checkCreditBalance(); // Refresh balance
                
                // Log activity
                const log = document.getElementById('activity-log');
                log.innerHTML = `<p>Last action: -${payload.credits_deducted} credits</p>` + log.innerHTML;
            }
        }
        
        // Initialize integration
        const integration = new VentureVerseIntegration();
        
        // Example paid feature
        function performPaidAction() {
            integration.trackActivity('feature_used', { feature: 'premium_analysis' });
            integration.deductCredits(0.10, 'Premium Analysis Feature'); // 0.10 USD → 17 credits
        }
    </script>
</body>
</html>
```

---

## Best Practices

### Performance

1. **Lazy Load Resources**: Only load what's needed initially
2. **Optimize Bundle Size**: Keep your iframe app lightweight
3. **Cache User Data**: Store user profile locally to reduce API calls
4. **Debounce Messages**: Avoid rapid-fire message sending

### User Experience

1. **Loading States**: Show loading indicators during operations
2. **Robust Error Handling**: Implement comprehensive fallback strategies
   - Always have URL parameter fallbacks for API failures
   - Use 3-second timeouts for API responses
   - Display zero credits instead of mock data when APIs fail
   - Show real user information from URL params even when backend is down
3. **Offline Support**: Handle network issues gracefully
4. **Responsive Design**: Ensure your app works in various iframe sizes

### Error Handling Strategies

#### API Timeout/Failure Pattern
```javascript
// Always implement this 3-layer fallback strategy:

// Layer 1: Try API request
function requestUserProfile() {
  sendMessageToParent('REQUEST_USER_PROFILE', {});
  
  // Layer 2: Timeout fallback
  setTimeout(() => {
    if (!userProfile) {
      console.log('API timeout, using URL params');
      useURLParamsFallback();
    }
  }, 3000);
}

// Layer 3: URL Parameters fallback
function useURLParamsFallback() {
  setUserProfile({
    id: parseInt(urlParams.get('user_id') || '1'),
    email: urlParams.get('user_email') || 'fallback@ventureverse.com',
    first_name: urlParams.get('user_name')?.split(' ')[0] || 'User',
    last_name: urlParams.get('user_name')?.split(' ')[1] || 'Name',
    monthly_credit_balance: 0, // Show zero credits, not fake data
    top_up_credit_balance: 0,
    tier_id: 1,
    user_roles: ['founder']
  });
}
```

#### Production-Ready Error Messages
```javascript
// Don't show technical errors to users
function handleError(error, fallbackMessage) {
  console.error('Technical error:', error);
  
  // Show user-friendly message
  showToast(fallbackMessage || 'Unable to load data. Showing available information.');
  
  // Always provide functionality even with errors
  useURLParamsFallback();
}
```

### Security

1. **Validate All Inputs**: Never trust incoming data
2. **Sanitize Outputs**: Prevent XSS attacks
3. **Rate Limiting**: Implement client-side rate limiting for API calls
4. **Audit Logs**: Track sensitive operations

### Code Organization

```javascript
// Recommended structure
class MyVentureVerseApp {
  constructor() {
    this.messageHandler = new MessageHandler();
    this.userManager = new UserManager();
    this.creditManager = new CreditManager();
    this.activityTracker = new ActivityTracker();
  }
}

class MessageHandler {
  // Handle all postMessage communication
}

class UserManager {
  // Manage user profile and authentication
}

class CreditManager {
  // Handle credit operations
}

class ActivityTracker {
  // Track user activities
}
```

---

## Troubleshooting

### Common Issues

#### 1. Messages Not Received
```javascript
// Check if in iframe mode
if (window.parent === window) {
  console.log('Not running in iframe');
}

// Verify message format
console.log('Sending message:', messageData);
```

#### 2. Credit Deduction Fails
- Verify user has sufficient credits
- Check cost calculation: `(USD × 1.7) ÷ 0.01`
- Ensure proper message format
- Check user authentication status

#### 3. User Profile Not Loading
```javascript
// Add timeout for profile requests
setTimeout(() => {
  if (!this.user) {
    console.error('User profile request timed out');
    // Handle timeout
  }
}, 5000);
```

#### 4. iframe Not Loading
- Check CSP headers
- Verify HTTPS configuration  
- Test iframe embedding permissions
- Check network connectivity

### Debug Mode

```javascript
const DEBUG_MODE = true;

function debugLog(message, data) {
  if (DEBUG_MODE) {
    console.log('[VentureVerse Debug]', message, data);
  }
}

// Use throughout your app
debugLog('Sending message', messageData);
debugLog('Received message', event.data);
```

### Error Recovery

```javascript
class ErrorRecovery {
  static retryOperation(operation, maxRetries = 3, delay = 1000) {
    return new Promise((resolve, reject) => {
      let retries = 0;
      
      const attempt = async () => {
        try {
          const result = await operation();
          resolve(result);
        } catch (error) {
          retries++;
          if (retries >= maxRetries) {
            reject(error);
          } else {
            setTimeout(attempt, delay * retries);
          }
        }
      };
      
      attempt();
    });
  }
}
```

---

## Support & Resources

### Getting Help

1. **Documentation**: This guide and API documentation
2. **Demo App**: `/dummy-app` for testing and examples

### Resources

- **Integration Platform**: All API calls are handled through VentureVerse frontend proxy
- **Demo Environment**: Use the iframe integration test page
- **SDK Library**: Use the provided VentureVerse SDK for all interactions

---

## Production Deployment Checklist

### Before Going Live

**Environment Setup:**
- [ ] Set production environment variables in Vercel/hosting platform
- [ ] Configure proper CORS origins (remove wildcards)
- [ ] Set up production API tokens
- [ ] Enable HTTPS for all endpoints

**Security Validation:**
- [ ] Remove debug logging from production
- [ ] Validate all CSP headers are production-ready
- [ ] Test iframe embedding from production domain
- [ ] Verify encryption keys are secure and environment-specific

**Integration Testing:**
- [ ] Test user profile synchronization through iframe messages
- [ ] Validate credit deduction via postMessage communication
- [ ] Confirm activity tracking functionality
- [ ] Test error handling and fallback mechanisms
- [ ] Verify iframe embedding works from production domain

**Performance Optimization:**
- [ ] Minimize SDK bundle size for third-party apps
- [ ] Optimize API response times
- [ ] Test iframe loading performance
- [ ] Validate memory usage and cleanup

**Documentation:**
- [ ] Verify all iframe communication examples are accurate
- [ ] Provide production contact information for developers
- [ ] Create developer onboarding checklist
- [ ] Set up support channels for third-party integrations

---

*This guide is regularly updated. Last updated: September 22nd, 2025*
*Version: 2.0.0 - Production Ready*
