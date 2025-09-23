# 🚀 VentureVerse Developer Kit - Quick Start

## For VentureVerse Team

### 1. Generate Developer Credentials (2 minutes)

```bash
# Navigate to developer kit
cd ventureverse-developer-kit

# Generate credentials for a new developer
node credential-generator.js "John Smith" "AI Chat App" "john@company.com"

# This will:
# ✅ Generate unique app ID and encryption key
# ✅ Update app-registry.json
# ✅ Create email template
# ✅ Show integration code
```

### 2. Update Your Iframe Service

Add the new app to your iframe validation (copy from `iframe-validation-addon.ts`):

```javascript
// In your src/services/iframe.ts, add to REGISTERED_APPS:
'newapp_abc123': {
  appId: 'newapp_abc123',
  encryptionKey: 'generated_key_here',
  developerName: 'John Smith',
  appName: 'AI Chat App',
  developerEmail: 'john@company.com',
  status: 'active',
  createdAt: '2024-01-15T10:30:00.000Z'
}
```

### 3. Send Email to Developer

Use the generated email template from `email-{appId}.txt`

---

## For Third-Party Developers

### Option 1: Quick Test (No Setup)

1. **Download SDK file**: Copy `src/ventureverse-sdk.js`
2. **Use example**: Open `examples/basic-app/index.html`
3. **Replace credentials** with yours:
   ```javascript
   const APP_CONFIG = {
       appId: 'your_app_id_here',
       encryptionKey: 'your_encryption_key_here'
   };
   ```

### Option 2: Full Template Setup

```bash
# 1. Clone or download the developer kit
git clone [repository-url]

# 2. Use vanilla template
cd templates/vanilla-js-template

# 3. Update credentials in app.js
# Replace YOUR_APP_ID_HERE and YOUR_ENCRYPTION_KEY_HERE

# 4. Run locally
python -m http.server 3000
# or
npx vite

# 5. Test with iframe parameters
# http://localhost:3000?iframe_mode=true&user_id=123&user_email=test@example.com&user_name=Test%20User
```

### Option 3: NPM Installation (Coming Soon)

```bash
npm install @ventureverse/sdk
```

```javascript
import { VentureVerseSDK } from '@ventureverse/sdk';

const sdk = new VentureVerseSDK({
  appId: 'your_app_id',
  encryptionKey: 'your_key'
});

await sdk.initialize();
const user = await sdk.getUserProfile();
```

---

## Testing Your Integration

### Test URLs

**Standalone Mode:**
```
http://localhost:3000
```

**Iframe Mode with User Context:**
```
http://localhost:3000?iframe_mode=true&user_id=123&user_email=test@example.com&user_name=John%20Doe
```

**With Encrypted Parameters:**
```
http://localhost:3000?iframe_mode=true&user_id=encrypted_value&user_email=encrypted_value&user_name=encrypted_value
```

### What to Test

- ✅ SDK initialization
- ✅ User profile loading
- ✅ Credit balance display
- ✅ Credit deduction
- ✅ Activity tracking
- ✅ Error handling
- ✅ Fallback mechanisms

---

## Production Deployment

### For Developers

1. **Update configuration**:
   ```javascript
   const APP_CONFIG = {
       appId: 'your_app_id',
       encryptionKey: 'your_key',
       debug: false  // Set to false in production
   };
   ```

2. **Deploy your app** to any hosting service
3. **Notify VentureVerse** of your production URL
4. **Test iframe embedding** from VentureVerse platform

### For VentureVerse

1. **Add production origins** to your iframe service
2. **Update CORS settings** if needed
3. **Monitor app usage** via console logs or analytics

---

## Support & Resources

- 📖 **Full Documentation**: `docs/INTEGRATION_GUIDE.md`
- 🔧 **API Reference**: `docs/API_REFERENCE.md`
- 🛠️ **Simple Setup**: `docs/SIMPLE_SETUP.md`
- 🧪 **Examples**: `examples/` directory
- 📧 **Support**: dev-support@ventureverse.com

---

## Common Issues & Solutions

### Issue: SDK not loading
**Solution**: Include the SDK script before your app code
```html
<script src="path/to/ventureverse-sdk.js"></script>
<script src="your-app.js"></script>
```

### Issue: User profile not loading
**Solution**: Check iframe parameters and fallback handling
```javascript
// SDK automatically handles fallbacks
const user = await sdk.getUserProfile(); // Uses URL params if API fails
```

### Issue: Credit deduction failing
**Solution**: Check credit balance and error messages
```javascript
try {
  await sdk.deductCredits(0.50, 'Feature usage');
} catch (error) {
  console.log('Error:', error.message);
}
```

### Issue: App not validating
**Solution**: Ensure credentials are correct and app is registered
```javascript
// Check in browser console for validation errors
// Contact VentureVerse team if app status is 'suspended'
```

---

**Ready to start? Use the credential generator and send the email template to your first developer! 🎉**