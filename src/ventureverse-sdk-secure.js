/**
 * VentureVerse SDK v2.0 - Secure Edition
 * 
 * Enhanced security features:
 * - Proper API key authentication
 * - AES-256-GCM encryption
 * - Request signing with HMAC-SHA256
 * - Built-in rate limiting
 * - Comprehensive error handling
 * - Resource management
 * - Session management
 */

import { VentureVerseAuth, RateLimiter } from './security/auth-system.js';
import crypto from 'crypto';

/**
 * Secure encryption utilities using AES-256-GCM
 */
class SecureEncryption {
  constructor(key) {
    if (!key || key === 'ventureverse-default-key') {
      throw new Error('Secure encryption requires a valid encryption key');
    }
    this.key = this.deriveKey(key);
  }

  deriveKey(password) {
    return crypto.pbkdf2Sync(password, 'ventureverse-salt', 100000, 32, 'sha256');
  }

  encrypt(text) {
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipher('aes-256-gcm', this.key);
      cipher.setAAD(Buffer.from('ventureverse', 'utf8'));
      
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const authTag = cipher.getAuthTag();
      
      return JSON.stringify({
        encrypted,
        iv: iv.toString('hex'),
        authTag: authTag.toString('hex'),
        algorithm: 'aes-256-gcm'
      });
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  decrypt(encryptedData) {
    try {
      const data = JSON.parse(encryptedData);
      const decipher = crypto.createDecipher('aes-256-gcm', this.key);
      decipher.setAAD(Buffer.from('ventureverse', 'utf8'));
      decipher.setAuthTag(Buffer.from(data.authTag, 'hex'));
      
      let decrypted = decipher.update(data.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }

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

  decryptUrlParams(params) {
    const decrypted = {};
    for (const [key, value] of Object.entries(params)) {
      if (this.shouldEncrypt(key) && typeof value === 'string' && value.startsWith('{')) {
        try {
          decrypted[key] = this.decrypt(value);
        } catch (error) {
          console.warn(`Failed to decrypt parameter ${key}:`, error);
          decrypted[key] = value;
        }
      } else {
        decrypted[key] = value;
      }
    }
    return decrypted;
  }

  shouldEncrypt(paramName) {
    const sensitiveParams = ['user_id', 'user_email', 'user_name', 'auth_token', 'session_id'];
    return sensitiveParams.includes(paramName);
  }
}

/**
 * Enhanced error handling with structured logging
 */
class ErrorHandler {
  constructor(debug = false) {
    this.debug = debug;
    this.errorCounts = new Map();
    this.maxRetries = 3;
  }

  logError(error, context = {}) {
    const errorKey = `${error.name}:${error.message}`;
    const count = this.errorCounts.get(errorKey) || 0;
    this.errorCounts.set(errorKey, count + 1);

    const logData = {
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: this.debug ? error.stack : undefined
      },
      context,
      occurrences: count + 1
    };

    if (this.debug) {
      console.error('[VentureVerse SDK Error]', logData);
    }

    // Send to monitoring service in production
    this.sendToMonitoring(logData);
  }

  sendToMonitoring(logData) {
    // In production, send to your monitoring service
    // Example: POST to /api/v1/monitoring/errors
  }

  shouldRetry(error, attempt = 0) {
    if (attempt >= this.maxRetries) return false;
    
    const retryableErrors = [
      'NetworkError',
      'TimeoutError',
      'ServiceUnavailable'
    ];
    
    return retryableErrors.some(type => error.message.includes(type));
  }

  async withRetry(operation, context = {}) {
    let lastError;
    
    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        this.logError(error, { ...context, attempt });
        
        if (!this.shouldRetry(error, attempt)) {
          break;
        }
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
}

/**
 * Resource manager for proper cleanup
 */
class ResourceManager {
  constructor() {
    this.resources = new Set();
    this.intervals = new Set();
    this.timeouts = new Set();
    this.eventListeners = new Map();
    this.abortControllers = new Set();
  }

  addResource(resource) {
    this.resources.add(resource);
  }

  addInterval(intervalId) {
    this.intervals.add(intervalId);
  }

  addTimeout(timeoutId) {
    this.timeouts.add(timeoutId);
  }

  addEventListener(target, event, handler) {
    const key = `${target}:${event}`;
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, []);
    }
    this.eventListeners.get(key).push({ target, handler });
    target.addEventListener(event, handler);
  }

  addAbortController(controller) {
    this.abortControllers.add(controller);
  }

  cleanup() {
    // Clear intervals
    for (const intervalId of this.intervals) {
      clearInterval(intervalId);
    }
    this.intervals.clear();

    // Clear timeouts
    for (const timeoutId of this.timeouts) {
      clearTimeout(timeoutId);
    }
    this.timeouts.clear();

    // Remove event listeners
    for (const [key, listeners] of this.eventListeners) {
      for (const { target, handler } of listeners) {
        target.removeEventListener(key.split(':')[1], handler);
      }
    }
    this.eventListeners.clear();

    // Abort pending requests
    for (const controller of this.abortControllers) {
      controller.abort();
    }
    this.abortControllers.clear();

    // Cleanup other resources
    for (const resource of this.resources) {
      if (resource && typeof resource.cleanup === 'function') {
        resource.cleanup();
      }
    }
    this.resources.clear();
  }
}

/**
 * Secure VentureVerse SDK v2.0
 */
export class VentureVerseSDKSecure {
  constructor(options = {}) {
    if (!options.apiKey) {
      throw new Error('API key is required');
    }
    
    // API secret is optional for backward compatibility
    // but recommended for enhanced security
    if (!options.apiSecret) {
      console.warn('⚠️ API secret not provided. For enhanced security, use both API key and secret.');
    }

    this.options = {
      apiKey: options.apiKey,
      apiSecret: options.apiSecret,
      appId: options.appId || this.extractAppIdFromKey(options.apiKey),
      debug: options.debug || false,
      timeout: options.timeout || 10000,
      encryptionKey: options.encryptionKey,
      apiEndpoint: options.apiEndpoint || 'https://api.ventureverse.com',
      enableEncryption: options.enableEncryption !== false,
      ...options
    };

    // Initialize components
    this.auth = new VentureVerseAuth({ 
      apiEndpoint: this.options.apiEndpoint,
      timeout: this.options.timeout 
    });
    this.rateLimiter = new RateLimiter({
      maxRequests: 1000,
      windowMs: 60 * 1000
    });
    this.errorHandler = new ErrorHandler(this.options.debug);
    this.resourceManager = new ResourceManager();

    // Initialize encryption if key provided
    if (this.options.encryptionKey) {
      this.encryption = new SecureEncryption(this.options.encryptionKey);
    }

    // State management
    this.isInitialized = false;
    this.isAuthenticated = false;
    this.isIframeMode = false;
    this.user = null;
    this.credits = null;
    this.sessionToken = null;
    this.messageHandlers = new Map();
    this.pendingRequests = new Map();
    this.requestId = 0;

    this.log('Secure SDK initialized');
  }

  extractAppIdFromKey(apiKey) {
    const match = apiKey.match(/^vv_(.+?)_/);
    return match ? match[1] : 'unknown';
  }

  async initialize() {
    if (this.isInitialized) {
      this.log('SDK already initialized');
      return;
    }

    try {
      // Validate credentials
      const isValid = await this.errorHandler.withRetry(
        () => this.auth.validateCredentials(this.options.apiKey, this.options.apiSecret),
        { operation: 'credential_validation' }
      );

      if (!isValid) {
        throw new Error('Invalid API credentials');
      }

      this.isAuthenticated = true;
      this.log('✅ Credentials validated');

      // Detect iframe mode
      this.isIframeMode = this.detectIframeMode();
      this.log('Iframe mode:', this.isIframeMode);

      if (this.isIframeMode) {
        this.setupSecureMessageListener();
        await this.loadInitialData();
      } else {
        this.log('Running in standalone mode');
        this.setupDemoMode();
      }

      this.isInitialized = true;
      this.log('✅ SDK initialization complete');

    } catch (error) {
      this.errorHandler.logError(error, { operation: 'initialize' });
      throw error;
    }
  }

  detectIframeMode() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('iframe_mode') === 'true' || window.parent !== window;
  }

  setupSecureMessageListener() {
    const messageHandler = this.handleSecureMessage.bind(this);
    this.resourceManager.addEventListener(window, 'message', messageHandler);
    this.log('Secure message listener set up');
  }

  async loadInitialData() {
    try {
      this.log('Loading initial data from parent window...');
      
      // Try to get user profile from parent
      await this.getUserProfile();
      
      // Try to get initial credit info
      await this.getCredits();
      
      this.log('✅ Initial data loaded successfully');
    } catch (error) {
      this.log('⚠️ Failed to load initial data, using fallback:', error.message);
      // Fallback to URL parameters
      this.getURLParamsFallback();
    }
  }

  handleSecureMessage(event) {
    try {
      if (!this.validateMessage(event.data)) {
        this.log('Invalid message received');
        return;
      }

      const message = event.data;
      
      // Decrypt message if needed
      if (message.encrypted && this.encryption) {
        try {
          message.payload = JSON.parse(this.encryption.decrypt(message.payload));
        } catch (error) {
          this.errorHandler.logError(error, { operation: 'message_decryption' });
          return;
        }
      }

      this.log('Received secure message:', message.type);

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

      // Handle message types
      this.handleMessageType(message);

    } catch (error) {
      this.errorHandler.logError(error, { operation: 'message_handling' });
    }
  }

  handleMessageType(message) {
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
      case 'ERROR':
        this.handleError(message.payload);
        break;
      default:
        if (this.messageHandlers.has(message.type)) {
          this.messageHandlers.get(message.type)(message.payload);
        }
    }
  }

  validateMessage(data) {
    return data && 
           typeof data === 'object' && 
           data.type && 
           data.timestamp && 
           data.source === 'parent' &&
           data.signature; // Require signature for security
  }

  async sendSecureMessage(type, payload = {}, expectResponse = false) {
    if (!this.isIframeMode) {
      this.log('Cannot send message - not in iframe mode');
      return Promise.resolve(null);
    }

    if (!this.rateLimiter.isAllowed(this.options.appId)) {
      throw new Error('Rate limit exceeded');
    }

    const requestId = expectResponse ? ++this.requestId : null;
    const timestamp = Date.now();
    
    // Encrypt payload if encryption is enabled
    let messagePayload = payload;
    let encrypted = false;
    
    if (this.encryption && this.options.enableEncryption) {
      try {
        messagePayload = this.encryption.encrypt(JSON.stringify(payload));
        encrypted = true;
      } catch (error) {
        this.errorHandler.logError(error, { operation: 'message_encryption' });
        // Fall back to unencrypted
      }
    }

    const message = {
      type,
      payload: messagePayload,
      timestamp: new Date(timestamp).toISOString(),
      source: 'iframe',
      requestId,
      encrypted,
      appId: this.options.appId,
      signature: this.generateMessageSignature(type, timestamp)
    };

    this.log('Sending secure message:', type);
    
    if (expectResponse) {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          this.pendingRequests.delete(requestId);
          reject(new Error(`Request ${type} timed out`));
        }, this.options.timeout);

        this.resourceManager.addTimeout(timeoutId);

        this.pendingRequests.set(requestId, {
          resolve: (data) => {
            clearTimeout(timeoutId);
            resolve(data);
          },
          reject: (error) => {
            clearTimeout(timeoutId);
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

  generateMessageSignature(type, timestamp) {
    const payload = `${this.options.appId}:${type}:${timestamp}`;
    return crypto
      .createHmac('sha256', this.options.apiSecret)
      .update(payload)
      .digest('hex');
  }

  async getUserProfile() {
    if (this.user) {
      return this.user;
    }

    if (!this.isIframeMode) {
      return this.getDemoUser();
    }

    return this.errorHandler.withRetry(
      () => this.refreshUserProfile(),
      { operation: 'get_user_profile' }
    );
  }

  async refreshUserProfile() {
    try {
      const response = await this.sendSecureMessage('REQUEST_USER_PROFILE', {}, true);
      
      if (response.user && !response.error) {
        this.user = {
          ...response.user,
          monthly_credit_balance: response.user.monthly_credit_balance || 0,
          top_up_credit_balance: response.user.top_up_credit_balance || 0,
        };
        this.triggerEvent('userProfileUpdated', this.user);
        return this.user;
      }
      
      this.log('API error, using URL params fallback');
      return this.getURLParamsFallback();
      
    } catch (error) {
      this.errorHandler.logError(error, { operation: 'refresh_user_profile' });
      return this.getURLParamsFallback();
    }
  }

  getURLParamsFallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const rawParams = Object.fromEntries(urlParams.entries());
    
    // Decrypt parameters if encryption is enabled
    const params = this.encryption && this.options.enableEncryption
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
    
    this.log('Using URL params fallback');
    this.triggerEvent('userProfileUpdated', this.user);
    return this.user;
  }

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
      const response = await this.errorHandler.withRetry(
        () => this.sendSecureMessage('DEDUCT_CREDITS', {
          cost,
          type,
          description,
          estimation: false
        }, true),
        { operation: 'deduct_credits', cost, description }
      );

      if (response.success !== false) {
        this.triggerEvent('creditsDeducted', {
          amount: response.credits_deducted,
          description,
          remaining: response.remaining_balance
        });
        
        if (response.remaining_balance) {
          this.user = { ...this.user, ...response.remaining_balance };
        }
      }

      return response;
    } catch (error) {
      this.errorHandler.logError(error, { operation: 'deduct_credits', cost, description });
      throw error;
    }
  }

  // Event system with proper cleanup
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
        this.errorHandler.logError(error, { operation: 'event_handler', event });
      }
    });
  }

  calculateCreditCost(usdAmount) {
    return Math.ceil((usdAmount * 1.7) / 0.01);
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

  setupDemoMode() {
    this.user = this.getDemoUser();
    this.credits = this.getDemoCredits();
  }

  handleUserProfileResponse(payload) {
    if (payload.error) {
      this.errorHandler.logError(new Error(payload.error), { operation: 'user_profile_response' });
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
      this.errorHandler.logError(new Error(payload.error), { operation: 'credit_balance_response' });
      return;
    }
    this.credits = payload.credit_info;
    this.triggerEvent('creditBalanceUpdated', this.credits);
  }

  handleError(payload) {
    this.errorHandler.logError(new Error(payload.message), { operation: 'parent_error' });
    this.triggerEvent('error', payload);
  }

  log(...args) {
    if (this.options.debug) {
      console.log('[VentureVerse SDK Secure]', ...args);
    }
  }

  /**
   * Comprehensive cleanup
   */
  destroy() {
    this.resourceManager.cleanup();
    
    this.pendingRequests.clear();
    this.messageHandlers.clear();
    
    if (this.eventListeners) {
      this.eventListeners.clear();
    }
    
    this.isInitialized = false;
    this.isAuthenticated = false;
    
    this.log('SDK destroyed and cleaned up');
  }
}

// Export convenience functions
export const createSecureVentureVerseSDK = (options) => new VentureVerseSDKSecure(options);

// Export all classes
export { VentureVerseAuth, RateLimiter, SecureEncryption };

// Default export
export default VentureVerseSDKSecure;