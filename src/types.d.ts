/**
 * VentureVerse SDK Type Definitions
 * TypeScript definitions for seamless integration
 */

export interface VentureVerseSDKOptions {
  appId?: string;
  debug?: boolean;
  timeout?: number;
  retryAttempts?: number;
  encryptionKey?: string;
  enableEncryption?: boolean;
}

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  nick_name?: string;
  monthly_credit_balance: number;
  top_up_credit_balance: number;
  tier_id?: number;
  user_roles: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CreditInfo {
  monthly_credit_balance: number;
  topup_credit_balance: number;
  remaining_ratio: number;
  tier: {
    id: number;
    name: string;
    monthly_credit: number;
  };
}

export interface CreditDeductionResponse {
  success: boolean;
  credits_deducted: number;
  remaining_balance?: {
    monthly_credit_balance: number;
    top_up_credit_balance: number;
  };
  error?: string;
}

export interface ActivityData {
  app_id: string | number;
  activity_type: string;
  metadata: {
    action: string;
    timestamp: string;
    [key: string]: any;
  };
}

export interface IFrameMessage {
  type: string;
  payload: any;
  timestamp: string;
  source: 'parent' | 'iframe';
  requestId?: number;
}

export interface CreditEstimation {
  credits: number;
  cost: number;
}

export class VentureVerseEncryption {
  constructor(key?: string);
  encrypt(text: string): string;
  decrypt(encryptedText: string): string;
  encryptUrlParams(params: Record<string, any>): Record<string, any>;
  decryptUrlParams(params: Record<string, any>): Record<string, any>;
  shouldEncrypt(paramName: string): boolean;
}

export class VentureVerseSDK {
  constructor(options?: VentureVerseSDKOptions);
  
  // Core methods
  initialize(): Promise<void>;
  destroy(): void;
  
  // User management
  getUserProfile(): Promise<User>;
  refreshUserProfile(): Promise<User>;
  isAuthenticated(): boolean;
  getUserRoles(): string[];
  hasRole(role: string): boolean;
  
  // Credit management
  getCreditBalance(): Promise<CreditInfo>;
  refreshCreditBalance(): Promise<CreditInfo>;
  deductCredits(cost: number, description?: string, type?: string): Promise<CreditDeductionResponse>;
  estimateCredits(cost: number, description?: string): Promise<CreditEstimation>;
  calculateCreditCost(usdAmount: number): number;
  hasEnoughCredits(requiredCredits: number): boolean;
  
  // Activity tracking
  trackActivity(action: string, metadata?: Record<string, any>): Promise<{ success: boolean; error?: string }>;
  
  // Permission management
  requestPermission(action: string, appName?: string): Promise<boolean>;
  
  // Message handling
  onMessage(type: string, handler: (payload: any) => void): void;
  offMessage(type: string): void;
  sendMessage(type: string, payload?: any, expectResponse?: boolean): Promise<any>;
  
  // Event system
  addEventListener(event: string, handler: (data: any) => void): void;
  removeEventListener(event: string, handler: (data: any) => void): void;
  
  // Encryption utilities
  encryptData(data: string): string;
  decryptData(encryptedData: string): string;
  encryptUrlParams(params: Record<string, any>): Record<string, any>;
  decryptUrlParams(params: Record<string, any>): Record<string, any>;
  createSecureIframeUrl(baseUrl: string, userContext?: User): string;
  
  // Properties
  readonly isInitialized: boolean;
  readonly isIframeMode: boolean;
  readonly user: User | null;
  readonly credits: CreditInfo | null;
}

// Convenience functions
export function createVentureVerseSDK(options?: VentureVerseSDKOptions): VentureVerseSDK;

// Default export
export default VentureVerseSDK;