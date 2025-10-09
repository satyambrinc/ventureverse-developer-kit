/**
 * VentureVerse SDK v2.0 for Third-Party App Integration
 * 
 * This SDK simplifies integration with the VentureVerse platform using 
 * the new API key authentication system, handling user context, 
 * credit management, and secure communication.
 * 
 * Version 2.0 Changes:
 * - API key-based authentication (replaces app ID)
 * - Developer Console integration
 * - Enhanced security and rate limiting
 * - Improved error handling
 * - Better analytics and monitoring
 * 
 * Usage:
 * ```javascript
 * import { VentureVerseSDK } from './ventureverse-sdk-v2.js';
 * 
 * const sdk = new VentureVerseSDK({
 *   apiKey: 'vv_your_api_key_here',
 *   debug: true
 * });
 * 
 * await sdk.initialize();
 * const user = await sdk.getUserProfile();
 * await sdk.deductCredits(0.50, 'Feature usage');
 * ```
 */

/**
 * Encryption utilities for secure data transmission
 */
class VentureVerseEncryption {
  constructor(key = 'ventureverse-default-key') {
    this.key = key;
  }

  /**
   * Simple encryption using XOR cipher with base64 encoding
   * Note: This is a basic implementation. For production, use more robust encryption.
   */
  encrypt(text) {
    try {
      const encrypted = Array.from(text)
        .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ this.key.charCodeAt(i % this.key.length)))
        .join('');
      return btoa(encrypted);
    } catch (error) {
      console.error('Encryption failed:', error);
      return text; // Return original text if encryption fails
    }
  }

  /**
   * Simple decryption using XOR cipher with base64 decoding
   */
  decrypt(encryptedText) {
    try {
      const decoded = atob(encryptedText);
      return Array.from(decoded)
        .map((char, i) => String.fromCharCode(char.charCodeAt(0) ^ this.key.charCodeAt(i % this.key.length)))
        .join('');
    } catch (error) {
      console.error('Decryption failed:', error);
      return encryptedText; // Return original text if decryption fails
    }
  }

  /**
   * Encrypt URL parameters
   */
  encryptUrlParams(params) {
    const encrypted = {};
    for (const [key, value] of Object.entries(params)) {
      if (this.shouldEncrypt(key)) {
        encrypted[key] = this.encrypt(String(value));
      } else {
        encrypted[key] = value;
      }
    }
    return encrypted;
  }

  /**
   * Decrypt URL parameters
   */
  decryptUrlParams(params) {
    const decrypted = {};
    for (const [key, value] of Object.entries(params)) {
      if (this.shouldEncrypt(key) && typeof value === 'string') {
        decrypted[key] = this.decrypt(value);
      } else {
        decrypted[key] = value;
      }
    }
    return decrypted;
  }

  /**
   * Determine which parameters should be encrypted
   */
  shouldEncrypt(paramName) {
    const sensitiveParams = ['user_id', 'user_email', 'user_name', 'auth_token'];
    return sensitiveParams.includes(paramName);
  }
}

export class VentureVerseSDK {
  constructor(options = {}) {
    this.options = {
      apiKey: options.apiKey || options.appId, // Backward compatibility
      debug: options.debug || false,
      timeout: options.timeout || 10000,
      retryAttempts: options.retryAttempts || 3,
      encryptionKey: options.encryptionKey || 'ventureverse-default-key',
      enableEncryption: options.enableEncryption !== false, // Default to true
      baseUrl: options.baseUrl || '', // For API validation
      ...options
    };

    // Validate API key format
    if (this.options.apiKey && !this.options.apiKey.startsWith('vv_')) {
      console.warn('⚠️ API key should start with "vv_". Please check your key format.');
    }

    this.isInitialized = false;
    this.isIframeMode = false;
    this.user = null;
    this.credits = null;
    this.messageHandlers = new Map();
    this.pendingRequests = new Map();
    this.requestId = 0;
    this.appInfo = null; // Store validated app information

    // Initialize encryption utility
    this.encryption = new VentureVerseEncryption(this.options.encryptionKey);

    this.log('SDK v2.0 initialized with options:', { 
      ...this.options, 
      apiKey: this.options.apiKey ? this.maskApiKey(this.options.apiKey) : 'not provided',
      encryptionKey: '[HIDDEN]' 
    });
  }

  /**
   * Initialize the SDK with API key validation
   */
  async initialize() {
    if (this.isInitialized) {
      this.log('SDK already initialized');
      return;
    }

    this.isIframeMode = this.detectIframeMode();
    this.log('Iframe mode detected:', this.isIframeMode);

    // Validate API key if provided
    if (this.options.apiKey) {
      try {
        await this.validateApiKey();
        this.log('✅ API key validated successfully');
      } catch (error) {
        this.log('❌ API key validation failed:', error.message);
        // Continue without validation for backward compatibility
      }
    } else {
      this.log('⚠️ No API key provided - some features may be limited');
    }

    if (this.isIframeMode) {
      this.setupMessageListener();
      await this.loadInitialData();
    } else {
      this.log('Running in standalone mode - using demo data');
      this.setupDemoMode();
    }

    this.isInitialized = true;
    this.log('SDK initialization complete');
  }

  /**
   * Validate API key with the VentureVerse platform
   */
  async validateApiKey() {
    if (!this.options.apiKey) {
      throw new Error('No API key provided');
    }

    const baseUrl = this.options.baseUrl || window.location.origin;
    const url = `${baseUrl}/api/v1/developers/validate`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key: this.options.apiKey })
      });

      if (!response.ok) {
        throw new Error(`Validation failed: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success || !result.data.valid) {
        throw new Error(result.message || 'Invalid API key');
      }

      // Store app information for later use
      this.appInfo = {
        appId: result.data.app_id,
        appName: result.data.app_name,
        appStatus: result.data.app_status,
        developerId: result.data.developer_id,
        rateLimits: result.data.rate_limits,
        keyVersion: result.data.key_version,
        lastUsed: result.data.last_used
      };

      this.log('App validated:', this.appInfo.appName, 'Status:', this.appInfo.appStatus);
      return this.appInfo;

    } catch (error) {
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        // Network error - might be running locally without backend
        this.log('⚠️ Could not connect to validation endpoint - running in offline mode');
        return null;
      }
      throw error;
    }
  }

  /**
   * Detect if running in iframe mode
   */
  detectIframeMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('iframe_mode') === 'true' || window.parent !== window;
  }

  /**
   * Set up message listener for parent communication
   */
  setupMessageListener() {
    window.addEventListener('message', this.handleMessage.bind(this));
    this.log('Message listener set up');
  }

  /**
   * Handle incoming messages from parent
   */
  handleMessage(event) {
    if (!this.validateMessage(event.data)) {
      return; // Silently ignore invalid messages
    }

    const message = event.data;
    this.log('Received message:', message.type, message.payload);

    // Handle responses to pending requests
    if (message.requestId && this.pendingRequests.has(message.requestId)) {
      const { resolve, reject } = this.pendingRequests.get(message.requestId);
      this.pendingRequests.delete(message.requestId);

      if (message.payload && message.payload.error) {
        reject(new Error(message.payload.error));
      } else {
        resolve(message.payload);
      }
      return;
    }

    // Handle general message types
    switch (message.type) {
      case 'USER_PROFILE_RESPONSE':
        this.handleUserProfileResponse(message.payload);
        break;
      case 'CREDIT_DEDUCTION_RESPONSE':
        this.handleCreditDeductionResponse(message.payload);
        break;
      case 'CREDIT_BALANCE_RESPONSE':
        this.handleCreditBalanceResponse(message.payload);
        break;
      case 'ACTIVITY_TRACKING_RESPONSE':
        this.handleActivityTrackingResponse(message.payload);
        break;
      case 'PERMISSION_RESPONSE':
        this.handlePermissionResponse(message.payload);
        break;
      case 'ERROR':
        this.handleError(message.payload);
        break;
    }

    // Trigger custom handlers
    if (this.messageHandlers.has(message.type)) {
      this.messageHandlers.get(message.type)(message.payload);
    }
  }

  /**
   * Validate incoming message
   */
  validateMessage(data) {
    return data && 
           typeof data === 'object' && 
           data.type && 
           data.timestamp && 
           data.source === 'parent';
  }

  /**
   * Send message to parent with optional response handling
   */
  sendMessage(type, payload = {}, expectResponse = false) {
    if (!this.isIframeMode) {
      this.log('Cannot send message - not in iframe mode');
      return Promise.resolve(null);
    }

    const requestId = expectResponse ? ++this.requestId : null;
    const message = {
      type,
      payload: {
        ...payload,
        // Include API key info for validation if available
        ...(this.appInfo && { appId: this.appInfo.appId }),
        ...(this.options.apiKey && { apiKey: this.options.apiKey })
      },
      timestamp: new Date().toISOString(),
      source: 'iframe',
      requestId
    };

    this.log('Sending message:', type, { ...payload, apiKey: '[HIDDEN]' });
    
    if (expectResponse) {
      return new Promise((resolve, reject) => {
        // Set up timeout
        const timeout = setTimeout(() => {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Request ${type} timed out`));
        }, this.options.timeout);

        this.pendingRequests.set(requestId, {
          resolve: (data) => {
            clearTimeout(timeout);
            resolve(data);
          },
          reject: (error) => {
            clearTimeout(timeout);
            reject(error);
          }
        });

        window.parent.postMessage(message, '*');
      });
    } else {
      window.parent.postMessage(message, '*');
      return Promise.resolve();
    }
  }

  /**
   * Load initial user data
   */
  async loadInitialData() {
    try {
      await Promise.all([
        this.refreshUserProfile(),
        this.refreshCreditBalance()
      ]);
    } catch (error) {
      this.log('Failed to load initial data:', error);
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile() {
    if (this.user) {
      return this.user;
    }

    if (!this.isIframeMode) {
      return this.getDemoUser();
    }

    return this.refreshUserProfile();
  }

  /**
   * Refresh user profile from parent with robust fallback handling
   */
  async refreshUserProfile() {
    try {
      const response = await this.sendMessage('REQUEST_USER_PROFILE', {}, true);
      
      // Handle successful response with data
      if (response.user && !response.error) {
        this.user = {
          ...response.user,
          monthly_credit_balance: response.user.monthly_credit_balance || 0,
          top_up_credit_balance: response.user.top_up_credit_balance || 0,
        };
        this.triggerEvent('userProfileUpdated', this.user);
        return this.user;
      }
      
      // API returned error or null data - use URL params fallback
      this.log('API error or null data, using URL params fallback');
      return this.getURLParamsFallback();
      
    } catch (error) {
      this.log('API timeout or network error, using URL params fallback:', error);
      return this.getURLParamsFallback();
    }
  }

  /**
   * Get user data from URL parameters as fallback
   */
  getURLParamsFallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const rawParams = Object.fromEntries(urlParams.entries());
    
    // Decrypt parameters if encryption is enabled
    const params = this.options.enableEncryption 
      ? this.encryption.decryptUrlParams(rawParams)
      : rawParams;
    
    this.user = {
      id: parseInt(params['user_id'] || '1'),
      email: params['user_email'] || 'fallback@ventureverse.com',
      first_name: params['user_name']?.split(' ')[0] || 'User',
      last_name: params['user_name']?.split(' ')[1] || 'Name',
      monthly_credit_balance: 0,
      top_up_credit_balance: 0,
      tier_id: 1,
      user_roles: ['founder']
    };
    
    this.log('Using URL params fallback:', this.user);
    this.triggerEvent('userProfileUpdated', this.user);
    return this.user;
  }

  /**
   * Get credit balance
   */
  async getCreditBalance() {
    if (this.credits) {
      return this.credits;
    }

    if (!this.isIframeMode) {
      return this.getDemoCredits();
    }

    return this.refreshCreditBalance();
  }

  /**
   * Refresh credit balance from parent
   */
  async refreshCreditBalance() {
    try {
      const response = await this.sendMessage('CHECK_CREDIT_BALANCE', {}, true);
      if (response.credit_info) {
        this.credits = response.credit_info;
        this.triggerEvent('creditBalanceUpdated', this.credits);
        return this.credits;
      } else if (response.fallback) {
        this.log('Using fallback credit data from API failure');
        this.credits = response.credit_info;
        this.triggerEvent('creditBalanceUpdated', this.credits);
        return this.credits;
      }
      throw new Error('No credit data received');
    } catch (error) {
      this.log('Failed to get credit balance, using user data fallback:', error);
      // Use user data as final fallback
      if (this.user) {
        this.credits = {
          monthly_credit_balance: this.user.monthly_credit_balance || 0,
          topup_credit_balance: this.user.top_up_credit_balance || 0,
          remaining_ratio: 0,
          tier: {
            id: this.user.tier_id || 1,
            name: 'Unknown',
            monthly_credit: 0
          }
        };
        this.triggerEvent('creditBalanceUpdated', this.credits);
        return this.credits;
      }
      throw error;
    }
  }

  /**
   * Calculate credit cost for a given USD amount
   */
  calculateCreditCost(usdAmount) {
    return Math.ceil((usdAmount * 1.7) / 0.01);
  }

  /**
   * Estimate credit cost without deducting
   */
  async estimateCredits(cost, description = '') {
    try {
      const response = await this.sendMessage('DEDUCT_CREDITS', {
        cost,
        type: 'app_usage',
        description,
        estimation: true
      }, true);
      
      return {
        credits: response.credits_deducted || this.calculateCreditCost(cost),
        cost
      };
    } catch (error) {
      this.log('Failed to estimate credits:', error);
      return {
        credits: this.calculateCreditCost(cost),
        cost
      };
    }
  }

  /**
   * Deduct credits for app usage
   */
  async deductCredits(cost, description = '', type = 'app_usage') {
    if (!this.isIframeMode) {
      this.log('Demo mode - simulating credit deduction:', cost, description);
      return {
        success: true,
        credits_deducted: this.calculateCreditCost(cost),
        remaining_balance: this.getDemoCredits()
      };
    }

    try {
      const response = await this.sendMessage('DEDUCT_CREDITS', {
        cost,
        type,
        description,
        estimation: false
      }, true);

      if (response.success !== false) {
        this.triggerEvent('creditsDeducted', {
          amount: response.credits_deducted,
          description,
          remaining: response.remaining_balance
        });
        
        // Update local credit info
        if (response.remaining_balance) {
          this.user = { ...this.user, ...response.remaining_balance };
        }
      }

      return response;
    } catch (error) {
      this.log('Failed to deduct credits:', error);
      throw error;
    }
  }

  /**
   * Track user activity
   */
  async trackActivity(action, metadata = {}) {
    const activityData = {
      app_id: this.appInfo?.appId || this.options.apiKey,
      activity_type: 'app_usage',
      metadata: {
        action,
        timestamp: new Date().toISOString(),
        apiKey: this.options.apiKey ? this.maskApiKey(this.options.apiKey) : null,
        ...metadata
      }
    };

    if (!this.isIframeMode) {
      this.log('Demo mode - simulating activity tracking:', activityData);
      return { success: true };
    }

    try {
      const response = await this.sendMessage('TRACK_ACTIVITY', activityData, true);
      this.triggerEvent('activityTracked', { action, metadata });
      return response;
    } catch (error) {
      this.log('Failed to track activity:', error);
      // Don't throw - activity tracking shouldn't break app flow
      return { success: false, error: error.message };
    }
  }

  /**
   * Request permission for sensitive operations
   */
  async requestPermission(action, appName = null) {
    const effectiveAppName = appName || this.appInfo?.appName || 'This app';
    
    if (!this.isIframeMode) {
      return confirm(`Demo: ${effectiveAppName} wants to ${action}. Allow?`);
    }

    try {
      const response = await this.sendMessage('REQUEST_PERMISSION', {
        app_name: effectiveAppName,
        action
      }, true);
      
      return response.granted === true;
    } catch (error) {
      this.log('Failed to request permission:', error);
      return false;
    }
  }

  /**
   * Get app information (from validation)
   */
  getAppInfo() {
    return this.appInfo;
  }

  /**
   * Get rate limit information
   */
  getRateLimits() {
    return this.appInfo?.rateLimits || {
      max_requests_per_day: 10000,
      window_per_minute: 100
    };
  }

  /**
   * Mask API key for logging (show first 8 chars + ...)
   */
  maskApiKey(apiKey) {
    if (!apiKey || apiKey.length < 8) return '[HIDDEN]';
    return apiKey.substring(0, 8) + '...';
  }

  /**
   * Add custom message handler
   */
  onMessage(type, handler) {
    if (typeof handler !== 'function') {
      throw new Error('Handler must be a function');
    }
    this.messageHandlers.set(type, handler);
  }

  /**
   * Remove message handler
   */
  offMessage(type) {
    this.messageHandlers.delete(type);
  }

  /**
   * Event system
   */
  addEventListener(event, handler) {
    if (!this.eventListeners) {
      this.eventListeners = new Map();
    }
    
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event).push(handler);
  }

  removeEventListener(event, handler) {
    if (!this.eventListeners || !this.eventListeners.has(event)) {
      return;
    }
    
    const handlers = this.eventListeners.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  triggerEvent(event, data) {
    if (!this.eventListeners || !this.eventListeners.has(event)) {
      return;
    }
    
    this.eventListeners.get(event).forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        this.log('Error in event handler:', error);
      }
    });
  }

  /**
   * Encryption utility methods
   */
  encryptData(data) {
    return this.encryption.encrypt(data);
  }

  decryptData(encryptedData) {
    return this.encryption.decrypt(encryptedData);
  }

  encryptUrlParams(params) {
    return this.encryption.encryptUrlParams(params);
  }

  decryptUrlParams(params) {
    return this.encryption.decryptUrlParams(params);
  }

  /**
   * Create secure iframe URL with encrypted parameters
   */
  createSecureIframeUrl(baseUrl, userContext) {
    if (!userContext) return baseUrl;

    try {
      const url = new URL(baseUrl, window.location.origin);
      
      // Prepare parameters to encrypt
      const params = {
        user_id: userContext.id.toString(),
        user_email: userContext.email,
        user_name: `${userContext.first_name} ${userContext.last_name}`,
        iframe_mode: 'true'
      };

      // Add app info if available
      if (this.appInfo?.appId) {
        params.app_id = this.appInfo.appId.toString();
      }

      // Encrypt sensitive parameters
      const encryptedParams = this.options.enableEncryption 
        ? this.encryptUrlParams(params)
        : params;

      // Add parameters to URL
      Object.entries(encryptedParams).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });

      return url.toString();
    } catch (error) {
      this.log('Failed to create secure iframe URL:', error);
      return baseUrl;
    }
  }

  /**
   * Utility methods
   */
  isAuthenticated() {
    return this.user !== null;
  }

  hasEnoughCredits(requiredCredits) {
    if (!this.user) return false;
    const total = this.user.monthly_credit_balance + this.user.top_up_credit_balance;
    return total >= requiredCredits;
  }

  getUserRoles() {
    return this.user ? this.user.user_roles : [];
  }

  hasRole(role) {
    return this.getUserRoles().includes(role);
  }

  /**
   * Demo mode setup
   */
  setupDemoMode() {
    this.user = this.getDemoUser();
    this.credits = this.getDemoCredits();
  }

  getDemoUser() {
    return {
      id: 999,
      email: 'demo@example.com',
      first_name: 'Demo',
      last_name: 'User',
      monthly_credit_balance: 800,
      top_up_credit_balance: 200,
      tier_id: 2,
      user_roles: ['founder']
    };
  }

  getDemoCredits() {
    return {
      monthly_credit_balance: 800,
      topup_credit_balance: 200,
      remaining_ratio: 0.8,
      tier: {
        id: 2,
        name: 'Pro',
        monthly_credit: 1000
      }
    };
  }

  /**
   * Message handlers
   */
  handleUserProfileResponse(payload) {
    if (payload.error) {
      this.log('User profile error:', payload.error);
      return;
    }
    this.user = payload.user;
    this.triggerEvent('userProfileUpdated', this.user);
  }

  handleCreditDeductionResponse(payload) {
    this.triggerEvent('creditDeductionResponse', payload);
  }

  handleCreditBalanceResponse(payload) {
    if (payload.error) {
      this.log('Credit balance error:', payload.error);
      return;
    }
    this.credits = payload.credit_info;
    this.triggerEvent('creditBalanceUpdated', this.credits);
  }

  handleActivityTrackingResponse(payload) {
    this.triggerEvent('activityTrackingResponse', payload);
  }

  handlePermissionResponse(payload) {
    this.triggerEvent('permissionResponse', payload);
  }

  handleError(payload) {
    this.log('Error from parent:', payload.message);
    this.triggerEvent('error', payload);
  }

  /**
   * Logging utility
   */
  log(...args) {
    if (this.options.debug) {
      console.log('[VentureVerse SDK v2.0]', ...args);
    }
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.isIframeMode) {
      window.removeEventListener('message', this.handleMessage.bind(this));
    }
    
    this.pendingRequests.clear();
    this.messageHandlers.clear();
    this.isInitialized = false;
    
    this.log('SDK destroyed');
  }
}

// Export convenience functions
export const createVentureVerseSDK = (options) => new VentureVerseSDK(options);

// Export encryption utilities for standalone use
export { VentureVerseEncryption };

// Default export
export default VentureVerseSDK;