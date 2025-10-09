# How to Get VentureVerse API Credentials

## 🔑 Getting Started

To integrate your app with VentureVerse, you need:
1. **Developer Account** - Access to the VentureVerse Developer Console
2. **API Key** - Secure authentication key for your application

## 🚀 Step-by-Step Guide

### Step 1: Create Developer Account

1. Visit [VentureVerse Developer Console](https://ventureverse.com/developer)
2. Click **"Sign Up"** or **"Register as Developer"**
3. Fill out the registration form:
   - **Name**: Your full name
   - **Email**: Your developer email address
   - **Password**: Strong password for your account
   - **GitHub** (optional): Your GitHub username

4. Submit the registration
5. Check your email for verification (if required)

### Step 2: Login to Developer Console

1. Go to [Developer Console Login](https://ventureverse.com/developer/login)
2. Enter your email and password
3. Access your developer dashboard

### Step 3: Create Your Application

1. In the Developer Console, click **"Create New App"**
2. Fill in your application details:
   - **App Name**: Unique name for your application
   - **Description**: Brief description of what your app does
   - **App URL**: Where your app will be hosted (can be updated later)

3. Click **"Create App"**
4. Your app will be created with status **"dev"** (development mode)

### Step 4: Get Your API Key

1. After creating your app, you'll see your **API Key** immediately
2. **Copy and save your API Key** - it looks like: `vv_abc123def456...`
3. You can always find your API key in the app details in your dashboard

### Step 5: App Review (Optional)

- Apps in **"dev"** status work fully for development and testing
- To go live on the VentureVerse marketplace:
  1. Click **"Submit for Review"** in your app dashboard
  2. Your app status changes to **"reviewing"**
  3. VentureVerse team will review and approve/reject
  4. Approved apps get **"active"** status

## 📨 What You'll Have

After creating your app:

```javascript
// Your API credentials
API Key: vv_abc123def456789...

// Ready-to-use integration code:
const sdk = new VentureVerseSDK({
  apiKey: 'vv_abc123def456789...',
  debug: true
});
```

## 🔧 Managing Your Apps

In the Developer Console you can:
- **View all your apps** and their status
- **Rotate API keys** for security
- **Revoke API keys** if compromised
- **Update app details** (name, description, URL)
- **Monitor usage statistics** and rate limits
- **Submit apps for review**

## 🚀 Next Steps

Once you have your API key:

1. **Install SDK** from this repository
2. **Use your API key** in your app
3. **Test integration** using the examples
4. **Deploy** your app
5. **Submit for review** when ready to go live

## 🔐 Security Best Practices

- **Keep your API key secure** - Never commit it to public repositories
- **Use environment variables** in production:
  ```javascript
  const sdk = new VentureVerseSDK({
    apiKey: process.env.VENTUREVERSE_API_KEY
  });
  ```
- **Rotate your keys periodically** using the Developer Console
- **Revoke compromised keys immediately**
- **Monitor your usage** in the Developer Console

## ⚡ Rate Limits

Each API key has default rate limits:
- **10,000 requests per day**
- **100 requests per minute**

Higher limits available for approved apps with demonstrated need.

## 📞 Support

- **Developer Console**: Manage everything yourself
- **Documentation**: Complete guides and examples included
- **Status Page**: Check API status and updates

---

**Ready to start building? Head to the [Developer Console](https://ventureverse.com/developer) now!**
