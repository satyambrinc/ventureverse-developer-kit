# VentureVerse Developer Kit

Welcome to the VentureVerse Developer Kit! This package provides everything you need to integrate your applications with the VentureVerse platform using our secure API key authentication system.

## 🚀 Quick Start

### Option 1: NPM Installation
```bash
npm install @ventureverse/sdk
```

### Option 2: CDN
```html
<script src="https://cdn.ventureverse.com/sdk/v2/ventureverse-sdk.js"></script>
```

### Option 3: Direct Download
Download the SDK files from this repository and include them in your project.

## 📖 Documentation

- [Integration Guide](./docs/INTEGRATION_GUIDE.md) - Complete integration walkthrough
- [API Reference](./docs/API_REFERENCE.md) - Detailed API documentation  
- [Developer Console Guide](./docs/DEVELOPER_CONSOLE.md) - How to manage your apps
- [Examples](./examples/) - Working examples and templates

## 🎯 Features

- **🔐 API Key Authentication**: Secure app-based authentication system
- **👤 User Context**: Seamless user profile access from VentureVerse  
- **💳 Credit Management**: Handle credit deductions and balance checks
- **🖼️ Iframe Integration**: Perfect embedding within VentureVerse platform
- **🔒 Security**: Robust validation and rate limiting
- **📊 Analytics**: Built-in usage tracking and monitoring
- **🔧 TypeScript Support**: Full type definitions included

## 🏗️ Basic Usage

```javascript
import { VentureVerseSDK } from '@ventureverse/sdk';

const sdk = new VentureVerseSDK({
  apiKey: 'vv_your_api_key_here',
  debug: true
});

await sdk.initialize();
const user = await sdk.getUserProfile();
await sdk.deductCredits(0.50, 'Feature usage');
```

## 🔑 Getting Started

### 1. Create Developer Account
Visit the [VentureVerse Developer Console](https://ventureverse.com/developer) to:
- Create your developer account
- Access the developer dashboard
- Manage your applications

### 2. Create Your App
In the Developer Console:
- Click "Create New App"
- Fill in your app details (name, description, URL)
- Submit for review
- Get your API key instantly

### 3. Integration
Use your API key with our SDK to start building!

See [HOW_TO_GET_CREDENTIALS.md](./HOW_TO_GET_CREDENTIALS.md) for detailed steps.

## 📁 Repository Structure

```
ventureverse-developer-kit/
├── src/
│   ├── ventureverse-sdk.js    # Main SDK file
│   └── types.d.ts             # TypeScript definitions
├── examples/
│   ├── basic-app/             # Simple integration example
│   └── iframe-test.html       # Testing playground
├── docs/
│   ├── INTEGRATION_GUIDE.md   # Complete integration guide
│   └── API_REFERENCE.md       # API documentation
└── templates/
    └── vanilla-js-template/   # Ready-to-use template
```

## 🧪 Testing Your Integration

1. Open `examples/iframe-test.html` in your browser
2. Add URL parameters to simulate VentureVerse context
3. Test iframe embedding functionality

Example URL:
```
file:///path/to/iframe-test.html?iframe_mode=true&user_id=123&user_email=test@example.com&user_name=John%20Doe
```

## 🔐 Security & Best Practices

- Never expose API endpoints or database credentials
- Always validate user inputs and sanitize outputs
- Use HTTPS for all communications
- Implement proper error handling and fallbacks

## 📞 Support

- **Documentation**: Full integration guide included
- **Examples**: Working templates and demos


## 🔄 Version History

- **v1.0.0** - Initial release with core SDK functionality
- **v1.1.0** - Added encryption support and TypeScript definitions  
- **v1.2.0** - Enhanced error handling and fallback mechanisms
- **v2.0.0** - **NEW**: API key authentication system, Developer Console, PostgreSQL backend

## 📄 License

MIT License - see LICENSE file for details.

---

**Ready to build amazing apps on VentureVerse? Start with our [Integration Guide](./docs/INTEGRATION_GUIDE.md)!**
