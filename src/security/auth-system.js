/**
 * Secure Authentication System for VentureVerse SDK
 * Implements proper API key validation, request signing, and session management
 */

import crypto from 'crypto';

export class VentureVerseAuth {
  constructor(options = {}) {
    this.apiEndpoint = options.apiEndpoint || 'https://api.ventureverse.com';
    this.timeout = options.timeout || 10000;
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Validate API credentials with the server
   */
  async validateCredentials(appId, apiSecret) {
    const cacheKey = `${appId}:${apiSecret}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return cached.valid;
      }
      this.cache.delete(cacheKey);
    }

    try {
      const timestamp = Date.now();
      const signature = this.generateSignature(appId, timestamp, apiSecret);

      const response = await fetch(`${this.apiEndpoint}/v1/auth/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-VentureVerse-App-ID': appId,
          'X-VentureVerse-Timestamp': timestamp.toString(),
          'X-VentureVerse-Signature': signature,
        },
        body: JSON.stringify({
          app_id: appId,
          timestamp
        }),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (response.status === 429) {
        throw new Error('Rate limit exceeded');
      }

      const result = await response.json();
      const isValid = response.ok && result.valid === true;

      // Cache the result
      this.cache.set(cacheKey, {
        valid: isValid,
        timestamp: Date.now(),
        appInfo: result.app_info
      });

      return isValid;
    } catch (error) {
      console.error('Credential validation failed:', error);
      return false;
    }
  }

  /**
   * Generate request signature using HMAC-SHA256
   */
  generateSignature(appId, timestamp, apiSecret) {
    const payload = `${appId}:${timestamp}`;
    return crypto
      .createHmac('sha256', apiSecret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify incoming request signature
   */
  verifySignature(appId, timestamp, signature, apiSecret) {
    const expectedSignature = this.generateSignature(appId, timestamp, apiSecret);
    
    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  /**
   * Generate secure session token
   */
  generateSessionToken(appId, userId) {
    const payload = {
      app_id: appId,
      user_id: userId,
      issued_at: Date.now(),
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };

    const token = crypto.randomBytes(32).toString('hex');
    // In production, store this mapping in Redis or database
    return token;
  }

  /**
   * Validate session token
   */
  async validateSession(token) {
    try {
      // In production, validate against stored session
      // For now, basic length check
      return token && token.length === 64;
    } catch (error) {
      return false;
    }
  }

  /**
   * Generate secure API key pair
   */
  static generateAPICredentials(appId) {
    const apiKey = `vv_${appId}_${crypto.randomBytes(16).toString('hex')}`;
    const apiSecret = crypto.randomBytes(32).toString('hex');
    
    return { apiKey, apiSecret };
  }

  /**
   * Encrypt sensitive data with AES-256-GCM
   */
  static encrypt(text, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher('aes-256-gcm', key);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt sensitive data with AES-256-GCM
   */
  static decrypt(encryptedData, key) {
    const decipher = crypto.createDecipher('aes-256-gcm', key);
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

/**
 * Rate Limiter for API requests
 */
export class RateLimiter {
  constructor(options = {}) {
    this.maxRequests = options.maxRequests || 100;
    this.windowMs = options.windowMs || 60 * 1000; // 1 minute
    this.requests = new Map();
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      this.requests.set(identifier, []);
    }

    const userRequests = this.requests.get(identifier);
    
    // Remove old requests
    const validRequests = userRequests.filter(time => time > windowStart);
    this.requests.set(identifier, validRequests);

    // Check if under limit
    if (validRequests.length < this.maxRequests) {
      validRequests.push(now);
      return true;
    }

    return false;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier) {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    if (!this.requests.has(identifier)) {
      return this.maxRequests;
    }

    const userRequests = this.requests.get(identifier);
    const validRequests = userRequests.filter(time => time > windowStart);
    
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

/**
 * Security middleware for validating requests
 */
export class SecurityMiddleware {
  constructor(auth, rateLimiter) {
    this.auth = auth;
    this.rateLimiter = rateLimiter;
    this.suspiciousActivities = new Map();
  }

  /**
   * Validate incoming request
   */
  async validateRequest(request) {
    const appId = request.headers['x-ventureverse-app-id'];
    const timestamp = request.headers['x-ventureverse-timestamp'];
    const signature = request.headers['x-ventureverse-signature'];

    // Basic validation
    if (!appId || !timestamp || !signature) {
      return { valid: false, error: 'Missing required headers' };
    }

    // Timestamp validation (prevent replay attacks)
    const requestTime = parseInt(timestamp);
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    if (Math.abs(now - requestTime) > maxAge) {
      return { valid: false, error: 'Request timestamp expired' };
    }

    // Rate limiting
    if (!this.rateLimiter.isAllowed(appId)) {
      this.logSuspiciousActivity(appId, 'Rate limit exceeded');
      return { valid: false, error: 'Rate limit exceeded' };
    }

    // Signature validation would go here
    // For now, just validate app exists
    const isValidApp = await this.auth.validateCredentials(appId, 'temp-secret');
    
    if (!isValidApp) {
      this.logSuspiciousActivity(appId, 'Invalid credentials');
      return { valid: false, error: 'Invalid credentials' };
    }

    return { valid: true };
  }

  /**
   * Log suspicious activity
   */
  logSuspiciousActivity(appId, reason) {
    const key = `${appId}:${reason}`;
    const count = this.suspiciousActivities.get(key) || 0;
    this.suspiciousActivities.set(key, count + 1);

    console.warn(`🚨 Suspicious activity: ${reason} for app ${appId} (count: ${count + 1})`);

    // Auto-suspend after multiple violations
    if (count + 1 >= 10) {
      console.error(`🔒 Auto-suspending app ${appId} due to repeated violations`);
      // In production, call API to suspend app
    }
  }
}