# VentureVerse Developer Console Guide

## 🏗️ Overview

The VentureVerse Developer Console is your centralized hub for managing applications, API keys, and monitoring your integration with the VentureVerse platform.

## 🚀 Getting Started

### Access the Console

Visit: [https://ventureverse.com/developer](https://ventureverse.com/developer)

### First Time Setup

1. **Register**: Create your developer account
2. **Login**: Access your dashboard
3. **Create App**: Add your first application
4. **Get API Key**: Start integrating immediately

## 📱 Dashboard Overview

### Main Dashboard

- **Apps Overview**: List of all your applications
- **Recent Activity**: Latest API usage and events
- **Quick Actions**: Create new app, view documentation
- **Account Summary**: Your developer profile information

### App Management

Each app in your dashboard shows:
- **App Name** and **Description**
- **Status**: `dev`, `reviewing`, `active`, or `disabled`
- **API Key**: Masked for security (click to reveal)
- **Rate Limits**: Current usage vs. limits
- **Last Used**: When your API key was last accessed

## 🔑 API Key Management

### Understanding API Keys

API keys in VentureVerse follow this format:
```
vv_abc123def456789ghijklmnop
```

Each key includes:
- **Prefix**: `vv_` identifies VentureVerse keys
- **Identifier**: Unique string for your application
- **Security**: Cryptographically secure random generation

### Key Operations

#### Viewing Your API Key
1. Click on your app in the dashboard
2. Click **"Show API Key"** to reveal the full key
3. Copy the key for use in your application

#### Rotating API Keys
1. Go to your app details
2. Click **"Rotate API Key"**
3. Confirm the action
4. **Important**: Update your application with the new key immediately
5. Old key becomes invalid instantly

#### Revoking API Keys
1. Go to your app details  
2. Click **"Revoke API Key"**
3. Confirm revocation
4. Key becomes invalid immediately
5. Generate a new key to restore access

## 📊 App Status Management

### Status Types

| Status | Description | Capabilities |
|--------|-------------|--------------|
| `dev` | Development mode | Full SDK access, testing |
| `reviewing` | Under review | Full SDK access, pending approval |
| `active` | Live and approved | Full SDK access, marketplace listing |
| `disabled` | Deactivated | No API access |

### Status Transitions

```
dev → reviewing → active
 ↓         ↓         ↓
disabled ← disabled ← disabled
```

### Submitting for Review

1. Ensure your app is fully functional
2. Test all SDK integrations
3. Click **"Submit for Review"**
4. Status changes to `reviewing`
5. VentureVerse team reviews within 1-2 business days

### Review Criteria

Apps are reviewed for:
- **Functionality**: Does it work as described?
- **Security**: Proper API key usage and security practices
- **User Experience**: Quality and usefulness
- **Content Policy**: Appropriate content and behavior
- **Technical Standards**: Proper error handling and performance

## 🔧 App Configuration

### Updating App Details

You can modify:
- **App Name**: Must be unique among your apps
- **Description**: Clear explanation of your app's purpose
- **App URL**: Where your app is hosted
- **Webhook URL** (if applicable): For receiving notifications

### Technical Settings

- **Rate Limits**: View current limits and usage
- **API Endpoints**: See which endpoints your app uses
- **Last Activity**: Monitor recent API calls
- **Error Logs**: Debug integration issues

## 📈 Monitoring & Analytics

### Usage Statistics

Track your app's performance:
- **API Calls**: Total requests per day/month
- **Error Rates**: Failed vs. successful requests  
- **Response Times**: API performance metrics
- **User Activity**: How many users access your app

### Rate Limit Monitoring

Monitor your consumption:
- **Daily Limit**: 10,000 requests/day (default)
- **Minute Limit**: 100 requests/minute (default)
- **Current Usage**: Real-time consumption
- **Limit Warnings**: Alerts when approaching limits

### Error Tracking

Common error types:
- **401 Unauthorized**: Invalid or revoked API key
- **429 Too Many Requests**: Rate limit exceeded
- **400 Bad Request**: Invalid request format
- **500 Server Error**: VentureVerse platform issues

## 🛡️ Security Features

### API Key Security

- **Automatic Rotation**: Set up periodic key rotation
- **Access Monitoring**: Track when/where keys are used
- **Suspicious Activity**: Alerts for unusual usage patterns
- **IP Restrictions** (Enterprise): Limit key usage to specific IPs

### Best Practices

1. **Never expose API keys** in client-side code
2. **Use environment variables** in production
3. **Rotate keys regularly** (monthly/quarterly)
4. **Monitor usage patterns** for anomalies
5. **Revoke compromised keys** immediately

## 🚨 Troubleshooting

### Common Issues

#### "Invalid API Key" Errors
- Check if key was recently rotated/revoked
- Verify key format (`vv_` prefix)
- Ensure no extra spaces/characters

#### Rate Limit Exceeded
- Check current usage in dashboard
- Implement request queuing/throttling
- Contact support for higher limits if needed

#### App Status Issues
- `disabled` status: Contact support for reactivation
- `reviewing` stuck: Review process takes 1-2 business days
- API not working: Check app status and key validity

### Support Channels

1. **Documentation**: Start with our guides
2. **Developer Console**: Built-in help and tutorials
3. **Status Page**: Check for platform-wide issues
4. **GitHub Issues**: Report bugs and feature requests

## 🔮 Advanced Features

### Webhooks (Coming Soon)
Receive notifications for:
- API key compromises
- App status changes
- Rate limit warnings
- Security alerts

### Team Management (Enterprise)
- Multiple developers per account
- Role-based permissions
- Shared app management
- Centralized billing

### Custom Rate Limits
Request higher limits with:
- Detailed usage projections
- Business justification
- Technical implementation plan
- Performance requirements

## 📋 Quick Reference

### Essential URLs
- **Console**: https://ventureverse.com/developer
- **Login**: https://ventureverse.com/developer/login
- **Documentation**: Included in SDK repository
- **Status**: https://status.ventureverse.com

### API Endpoints for Management
```javascript
// Validate your API key
POST /api/v1/developers/validate
{
  "key": "vv_your_api_key_here"
}

// Get app information  
GET /api/v1/developers/apps
Authorization: Bearer your_dev_token

// Update app details
PATCH /api/v1/developers/apps/:appId
Authorization: Bearer your_dev_token
```

---

**Need help? Check our [Integration Guide](./INTEGRATION_GUIDE.md) or visit the [Developer Console](https://ventureverse.com/developer)!**