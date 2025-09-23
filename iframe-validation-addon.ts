/**
 * Simple App Validation Addition for Your Iframe Service
 * 
 * Add this to your existing src/services/iframe.ts file
 */

// Add this interface to your iframe.ts file
interface RegisteredApp {
  appId: string;
  encryptionKey: string;
  developerName: string;
  appName: string;
  developerEmail: string;
  status: 'active' | 'suspended';
  createdAt: string;
}

// Add this to your IFrameService class
export class IFrameService {
  // ... existing code ...

  // 🆕 ADD THIS: Simple app registry (update this when you add new developers)
  private static REGISTERED_APPS: Record<string, RegisteredApp> = {
    'example_demo123': {
      appId: 'example_demo123',
      encryptionKey: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
      developerName: 'Demo Developer',
      appName: 'Example Demo App',
      developerEmail: 'demo@example.com',
      status: 'active',
      createdAt: '2024-01-15T10:30:00.000Z'
    }
    // 🔄 ADD NEW APPS HERE when you generate credentials
  };

  // 🆕 ADD THIS: Validate app credentials
  static validateApp(appId: string, encryptionKey?: string): boolean {
    const app = this.REGISTERED_APPS[appId];
    
    if (!app) {
      console.warn('Unknown app ID:', appId);
      return false;
    }
    
    if (app.status !== 'active') {
      console.warn('App is not active:', appId, app.status);
      return false;
    }
    
    if (encryptionKey && app.encryptionKey !== encryptionKey) {
      console.warn('Invalid encryption key for app:', appId);
      return false;
    }
    
    console.log('✅ App validated:', app.appName, 'by', app.developerName);
    return true;
  }

  // 🆕 ADD THIS: Get app info
  static getAppInfo(appId: string): RegisteredApp | null {
    return this.REGISTERED_APPS[appId] || null;
  }

  // 🔄 MODIFY THIS: Update your existing handleMessage method to validate apps
  private static handleMessage(event: MessageEvent) {
    // ... existing validation code ...

    const message = event.data as IFrameMessage;
    
    // 🆕 ADD APP VALIDATION HERE
    if (message.source === 'iframe') {
      // Extract app ID from message or URL
      const appId = message.payload?.appId || this.extractAppIdFromOrigin(event.origin);
      
      if (appId && !this.validateApp(appId)) {
        console.warn('Unauthorized app attempting to communicate:', appId);
        this.sendErrorResponse(event.source, 'Unauthorized app', message);
        return;
      }
      
      // Log app usage (optional)
      if (appId) {
        this.logAppUsage(appId, message.type, message.payload);
      }
    }

    // ... rest of your existing handleMessage code ...
  }

  // 🆕 ADD THIS: Extract app ID from origin (helper method)
  private static extractAppIdFromOrigin(origin: string): string | null {
    // You can implement custom logic here to map origins to app IDs
    // For now, return null and let developers pass app ID in messages
    return null;
  }

  // 🆕 ADD THIS: Log app usage (simple console logging)
  private static logAppUsage(appId: string, messageType: string, payload: any) {
    const app = this.getAppInfo(appId);
    const timestamp = new Date().toISOString();
    
    console.log(`📊 App Usage: ${app?.appName} (${appId}) - ${messageType}`, {
      timestamp,
      developer: app?.developerName,
      messageType,
      payload: payload || {}
    });
    
    // 🔄 OPTIONAL: Send to your analytics system
    // this.sendToAnalytics(appId, messageType, payload);
  }

  // 🆕 ADD THIS: Send error response
  private static sendErrorResponse(source: any, error: string, originalMessage: IFrameMessage) {
    const errorResponse: IFrameMessage = {
      type: 'ERROR',
      payload: { 
        error,
        originalType: originalMessage.type 
      },
      timestamp: new Date().toISOString(),
      source: 'parent'
    };
    
    if (source && source.postMessage) {
      source.postMessage(errorResponse, '*');
    }
  }

  // 🆕 ADD THIS: Easy method to add new apps (for testing)
  static addApp(appCredentials: RegisteredApp) {
    this.REGISTERED_APPS[appCredentials.appId] = appCredentials;
    console.log('✅ Added new app:', appCredentials.appName);
  }

  // 🆕 ADD THIS: Remove/suspend app
  static suspendApp(appId: string) {
    if (this.REGISTERED_APPS[appId]) {
      this.REGISTERED_APPS[appId].status = 'suspended';
      console.log('⛔ Suspended app:', appId);
    }
  }
}

/**
 * 📋 QUICK SETUP STEPS:
 * 
 * 1. Copy the methods above into your existing IFrameService class
 * 
 * 2. When you generate new credentials, add them to REGISTERED_APPS:
 *    IFrameService.addApp({
 *      appId: 'newapp_abc123',
 *      encryptionKey: 'generated_key_here',
 *      developerName: 'John Doe',
 *      appName: 'Johns App',
 *      developerEmail: 'john@example.com',
 *      status: 'active',
 *      createdAt: new Date().toISOString()
 *    });
 * 
 * 3. That's it! Your system now validates apps automatically.
 */