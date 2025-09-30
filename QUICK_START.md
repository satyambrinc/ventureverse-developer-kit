# 🚀 VentureVerse Developer Kit - Quick Start

---

## Option 1: Quick Test (No Setup)

1. **Download the SDK**: Copy `src/ventureverse-sdk.js` to your project
2. **Use the example**: Open `examples/basic-app/index.html`
3. **Replace credentials** with yours:
   ```javascript
   const APP_CONFIG = {
       appId: 'your_app_id_here',
       encryptionKey: 'your_encryption_key_here'
   };
   ```
4. **Open in browser** and test!

---

## Option 2: Full Template Setup

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

---

## Option 3: NPM Installation (Coming Soon)

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

---

## Support & Resources

- 📖 **Full Documentation**: `docs/INTEGRATION_GUIDE.md`
- 🔧 **API Reference**: `docs/API_REFERENCE.md`
- 🧪 **Examples**: `examples/` directory

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

---

**Ready to build? Request your credentials and start coding! 🎉**
