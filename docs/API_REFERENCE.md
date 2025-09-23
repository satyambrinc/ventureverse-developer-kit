# VentureVerse SDK API Reference

## Table of Contents

1. [VentureVerseSDK Class](#ventureveresdk-class)
2. [VentureVerseEncryption Class](#ventureeverseencryption-class)
3. [Message Types](#message-types)
4. [Event System](#event-system)
5. [Error Handling](#error-handling)

---

## VentureVerseSDK Class

### Constructor

```javascript
new VentureVerseSDK(options)
```

**Parameters:**
- `options` (Object, optional): Configuration options
  - `appId` (string): Your application ID
  - `debug` (boolean): Enable debug logging (default: false)
  - `timeout` (number): Request timeout in milliseconds (default: 10000)
  - `retryAttempts` (number): Number of retry attempts (default: 3)
  - `encryptionKey` (string): Encryption key for secure params
  - `enableEncryption` (boolean): Enable parameter encryption (default: true)

**Example:**
```javascript
const sdk = new VentureVerseSDK({
  appId: 'my-app-123',
  debug: true,
  encryptionKey: 'my-secret-key'
});
```

### Core Methods

#### `initialize()`
Initializes the SDK and loads initial user data.

```javascript
await sdk.initialize();
```

**Returns:** `Promise<void>`

#### `destroy()`
Cleans up the SDK and removes event listeners.

```javascript
sdk.destroy();
```

### User Management

#### `getUserProfile()`
Gets the current user profile.

```javascript
const user = await sdk.getUserProfile();
```

**Returns:** `Promise<User>`

**User Object:**
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
  user_roles: ["founder", "mentor"]
}
```

#### `refreshUserProfile()`
Refreshes user profile from the VentureVerse platform.

```javascript
const user = await sdk.refreshUserProfile();
```

**Returns:** `Promise<User>`

#### `isAuthenticated()`
Checks if user is authenticated.

```javascript
const isAuth = sdk.isAuthenticated();
```

**Returns:** `boolean`

#### `getUserRoles()`
Gets user roles array.

```javascript
const roles = sdk.getUserRoles();
// Returns: ["founder", "mentor"]
```

**Returns:** `string[]`

#### `hasRole(role)`
Checks if user has a specific role.

```javascript
const isMentor = sdk.hasRole('mentor');
```

**Parameters:**
- `role` (string): Role to check

**Returns:** `boolean`

### Credit Management

#### `getCreditBalance()`
Gets current credit balance information.

```javascript
const credits = await sdk.getCreditBalance();
```

**Returns:** `Promise<CreditInfo>`

**CreditInfo Object:**
```javascript
{
  monthly_credit_balance: 800,
  topup_credit_balance: 200,
  remaining_ratio: 0.8,
  tier: {
    id: 2,
    name: "Pro",
    monthly_credit: 1000
  }
}
```

#### `deductCredits(cost, description, type)`
Deducts credits for app usage.

```javascript
const result = await sdk.deductCredits(0.50, 'AI Analysis Feature');
```

**Parameters:**
- `cost` (number): USD amount (will be converted to credits automatically)
- `description` (string, optional): Description of the usage
- `type` (string, optional): Type of usage (default: 'app_usage')

**Returns:** `Promise<CreditDeductionResponse>`

**CreditDeductionResponse:**
```javascript
{
  success: true,
  credits_deducted: 85,
  remaining_balance: {
    monthly_credit_balance: 665,
    top_up_credit_balance: 250
  }
}
```

#### `estimateCredits(cost, description)`
Estimates credit cost without deducting.

```javascript
const estimation = await sdk.estimateCredits(0.50, 'AI Analysis');
```

**Parameters:**
- `cost` (number): USD amount
- `description` (string, optional): Description

**Returns:** `Promise<CreditEstimation>`

**CreditEstimation:**
```javascript
{
  credits: 85,
  cost: 0.50
}
```

#### `calculateCreditCost(usdAmount)`
Calculates credit cost for a USD amount.

```javascript
const credits = sdk.calculateCreditCost(0.50);
// Returns: 85
```

**Parameters:**
- `usdAmount` (number): USD amount

**Returns:** `number` (credit amount)

#### `hasEnoughCredits(requiredCredits)`
Checks if user has enough credits.

```javascript
const hasCredits = sdk.hasEnoughCredits(100);
```

**Parameters:**
- `requiredCredits` (number): Required credit amount

**Returns:** `boolean`

### Activity Tracking

#### `trackActivity(action, metadata)`
Tracks user activity in your app.

```javascript
await sdk.trackActivity('feature_used', {
  feature: 'ai_analysis',
  duration: 1200
});
```

**Parameters:**
- `action` (string): Action type
- `metadata` (Object, optional): Additional data

**Returns:** `Promise<{success: boolean, error?: string}>`

### Permission Management

#### `requestPermission(action, appName)`
Requests permission for sensitive operations.

```javascript
const granted = await sdk.requestPermission('access_files', 'My App');
```

**Parameters:**
- `action` (string): Action requiring permission
- `appName` (string, optional): Your app name

**Returns:** `Promise<boolean>`

### Message System

#### `sendMessage(type, payload, expectResponse)`
Sends a message to the VentureVerse platform.

```javascript
const response = await sdk.sendMessage('CUSTOM_REQUEST', {data: 'value'}, true);
```

**Parameters:**
- `type` (string): Message type
- `payload` (Object, optional): Message data
- `expectResponse` (boolean, optional): Whether to wait for response

**Returns:** `Promise<any>`

#### `onMessage(type, handler)`
Adds a custom message handler.

```javascript
sdk.onMessage('CUSTOM_RESPONSE', (payload) => {
  console.log('Received custom message:', payload);
});
```

**Parameters:**
- `type` (string): Message type to listen for
- `handler` (Function): Handler function

#### `offMessage(type)`
Removes a message handler.

```javascript
sdk.offMessage('CUSTOM_RESPONSE');
```

**Parameters:**
- `type` (string): Message type to stop listening for

### Event System

#### `addEventListener(event, handler)`
Adds an event listener.

```javascript
sdk.addEventListener('userProfileUpdated', (user) => {
  console.log('User profile updated:', user);
});
```

**Available Events:**
- `userProfileUpdated`: User profile was updated
- `creditBalanceUpdated`: Credit balance changed
- `creditsDeducted`: Credits were deducted
- `activityTracked`: Activity was tracked
- `error`: An error occurred

#### `removeEventListener(event, handler)`
Removes an event listener.

```javascript
sdk.removeEventListener('userProfileUpdated', handlerFunction);
```

### Encryption Utilities

#### `encryptData(data)`
Encrypts a string.

```javascript
const encrypted = sdk.encryptData('sensitive data');
```

#### `decryptData(encryptedData)`
Decrypts a string.

```javascript
const decrypted = sdk.decryptData(encrypted);
```

#### `createSecureIframeUrl(baseUrl, userContext)`
Creates a secure iframe URL with encrypted parameters.

```javascript
const secureUrl = sdk.createSecureIframeUrl('https://myapp.com', user);
```

---

## VentureVerseEncryption Class

### Constructor

```javascript
new VentureVerseEncryption(key)
```

**Parameters:**
- `key` (string, optional): Encryption key

### Methods

#### `encrypt(text)`
Encrypts a text string.

#### `decrypt(encryptedText)`
Decrypts an encrypted string.

#### `encryptUrlParams(params)`
Encrypts sensitive URL parameters.

#### `decryptUrlParams(params)`
Decrypts URL parameters.

---

## Message Types

### Outgoing Messages (Your App → VentureVerse)

| Type | Purpose | Payload |
|------|---------|---------|
| `REQUEST_USER_PROFILE` | Get user profile | `{}` |
| `DEDUCT_CREDITS` | Deduct credits | `{cost, type, description, estimation}` |
| `CHECK_CREDIT_BALANCE` | Get credit balance | `{}` |
| `TRACK_ACTIVITY` | Log activity | `{app_id, activity_type, metadata}` |
| `REQUEST_PERMISSION` | Ask permission | `{app_name, action}` |

### Incoming Messages (VentureVerse → Your App)

| Type | Purpose | Payload |
|------|---------|---------|
| `USER_PROFILE_RESPONSE` | User profile data | `{user}` or `{error}` |
| `CREDIT_DEDUCTION_RESPONSE` | Credit operation result | `{success, credits_deducted, remaining_balance}` |
| `CREDIT_BALANCE_RESPONSE` | Credit balance info | `{credit_info, total_balance}` |
| `ACTIVITY_TRACKING_RESPONSE` | Activity logged | `{success}` |
| `PERMISSION_RESPONSE` | Permission result | `{granted, action}` |
| `ERROR` | Error occurred | `{message, error}` |

---

## Error Handling

### Common Error Scenarios

1. **Network Timeout**
```javascript
try {
  await sdk.getUserProfile();
} catch (error) {
  console.error('Network timeout:', error.message);
  // Use fallback data from URL parameters
}
```

2. **Insufficient Credits**
```javascript
try {
  await sdk.deductCredits(10.00, 'Expensive feature');
} catch (error) {
  alert('Insufficient credits. Please top up your account.');
}
```

3. **API Errors**
```javascript
sdk.addEventListener('error', (errorData) => {
  console.error('VentureVerse API Error:', errorData);
});
```

### Fallback Strategies

The SDK automatically implements fallback strategies:

1. **API Timeout**: Falls back to URL parameters
2. **Network Errors**: Uses cached data when available
3. **Credit API Failure**: Shows zero balance instead of failing

---

## Best Practices

1. **Always Initialize**: Call `sdk.initialize()` before using other methods
2. **Handle Errors**: Implement proper error handling for all async operations
3. **Use Events**: Listen to SDK events for real-time updates
4. **Cleanup**: Call `sdk.destroy()` when your app is unmounted
5. **Test Fallbacks**: Test your app with network issues and API failures

---

## Examples

See the `/examples` directory for complete working examples:
- Basic integration
- React.js template
- Vue.js template
- Error handling patterns