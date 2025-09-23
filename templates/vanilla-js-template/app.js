/**
 * VentureVerse Vanilla JS Template
 * 
 * 🔑 STEP 1: Replace these credentials with your own
 */
const APP_CONFIG = {
    appId: 'YOUR_APP_ID_HERE',              // 🔄 Replace with your app ID
    encryptionKey: 'YOUR_ENCRYPTION_KEY_HERE', // 🔄 Replace with your encryption key
    debug: true // Set to false in production
};

class VentureVerseApp {
    constructor() {
        this.sdk = null;
        this.user = null;
        this.credits = null;
        this.isInitialized = false;
    }

    async initialize() {
        try {
            this.log('🚀 Initializing VentureVerse SDK...');
            
            // Import SDK (assuming it's available globally or via npm)
            if (typeof VentureVerseSDK === 'undefined') {
                throw new Error('VentureVerse SDK not loaded. Please include the SDK script.');
            }

            // Create SDK instance
            this.sdk = new VentureVerseSDK(APP_CONFIG);

            // Set up event listeners
            this.setupEventListeners();

            // Initialize SDK
            await this.sdk.initialize();

            // Load initial data
            await this.loadUserData();
            await this.loadCreditData();

            this.isInitialized = true;
            this.showMainContent();
            this.updateStatus('✅ App initialized successfully!', 'success');
            this.log('✅ VentureVerse app ready!');

        } catch (error) {
            this.log(`❌ Initialization failed: ${error.message}`, 'error');
            this.updateStatus(`❌ Failed to initialize: ${error.message}`, 'error');
        }
    }

    setupEventListeners() {
        // User profile updates
        this.sdk.addEventListener('userProfileUpdated', (user) => {
            this.user = user;
            this.updateUserDisplay();
            this.log('👤 User profile updated');
        });

        // Credit balance updates
        this.sdk.addEventListener('creditBalanceUpdated', (credits) => {
            this.credits = credits;
            this.updateCreditDisplay();
            this.log('💰 Credit balance updated');
        });

        // Credit deductions
        this.sdk.addEventListener('creditsDeducted', (data) => {
            this.log(`💸 Credits deducted: ${data.amount} (${data.description})`);
            this.refreshData();
        });

        // Errors
        this.sdk.addEventListener('error', (error) => {
            this.log(`🚨 SDK Error: ${error.message}`, 'error');
        });

        // Activity tracking responses
        this.sdk.addEventListener('activityTracked', (data) => {
            this.log(`📊 Activity tracked: ${data.action}`);
        });
    }

    async loadUserData() {
        try {
            this.user = await this.sdk.getUserProfile();
            this.updateUserDisplay();
            this.log('👤 User profile loaded');
        } catch (error) {
            this.log(`❌ Failed to load user: ${error.message}`, 'error');
        }
    }

    async loadCreditData() {
        try {
            this.credits = await this.sdk.getCreditBalance();
            this.updateCreditDisplay();
            this.log('💰 Credit balance loaded');
        } catch (error) {
            this.log(`❌ Failed to load credits: ${error.message}`, 'error');
        }
    }

    updateUserDisplay() {
        const userInfo = document.getElementById('user-info');
        if (!this.user) {
            userInfo.innerHTML = '<p>User data not available</p>';
            return;
        }

        userInfo.innerHTML = `
            <div class="user-details">
                <h3>${this.user.first_name} ${this.user.last_name}</h3>
                <p><strong>Email:</strong> ${this.user.email}</p>
                <p><strong>ID:</strong> ${this.user.id}</p>
                <p><strong>Roles:</strong> ${this.user.user_roles?.join(', ') || 'None'}</p>
                ${this.user.tier_id ? `<p><strong>Tier:</strong> ${this.user.tier_id}</p>` : ''}
            </div>
        `;
    }

    updateCreditDisplay() {
        const creditInfo = document.getElementById('credit-info');
        if (!this.credits) {
            creditInfo.innerHTML = '<p>Credit data not available</p>';
            return;
        }

        const monthly = this.credits.monthly_credit_balance || 0;
        const topup = this.credits.topup_credit_balance || this.credits.top_up_credit_balance || 0;
        const total = monthly + topup;

        creditInfo.innerHTML = `
            <div class="credit-breakdown">
                <div class="credit-item">
                    <span class="credit-label">Monthly Credits:</span>
                    <span class="credit-value">${monthly}</span>
                </div>
                <div class="credit-item">
                    <span class="credit-label">Top-up Credits:</span>
                    <span class="credit-value">${topup}</span>
                </div>
                <div class="credit-item total">
                    <span class="credit-label">Total Available:</span>
                    <span class="credit-value">${total}</span>
                </div>
                ${this.credits.tier ? `
                <div class="tier-info">
                    <span class="tier-label">Tier:</span>
                    <span class="tier-value">${this.credits.tier.name} (${this.credits.tier.monthly_credit} monthly)</span>
                </div>
                ` : ''}
            </div>
        `;
    }

    updateStatus(message, type = 'info') {
        const statusElement = document.getElementById('status');
        statusElement.textContent = message;
        statusElement.className = `status ${type}`;
    }

    showMainContent() {
        document.getElementById('main-content').style.display = 'block';
    }

    log(message, type = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const logContainer = document.getElementById('activity-log');
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        logEntry.innerHTML = `
            <span class="log-time">[${timestamp}]</span>
            <span class="log-message">${message}</span>
        `;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // Also log to console
        console.log(`[${type.toUpperCase()}] ${message}`);
    }

    // 🎯 YOUR FEATURE FUNCTIONS - Customize these!

    async useFeature() {
        if (!this.isInitialized) {
            this.log('❌ App not initialized yet', 'error');
            return;
        }

        try {
            this.log('🔄 Using feature...');
            
            // Example: Deduct $0.50 for a feature
            const result = await this.sdk.deductCredits(0.50, 'Custom Feature Usage');
            
            if (result.success !== false) {
                this.log(`✅ Feature used successfully! Credits deducted: ${result.credits_deducted}`, 'success');
                
                // 🔄 Add your actual feature logic here
                await this.performActualFeature();
                
            } else {
                this.log(`❌ Feature failed: ${result.error || 'Unknown error'}`, 'error');
            }
        } catch (error) {
            this.log(`❌ Feature error: ${error.message}`, 'error');
        }
    }

    async performActualFeature() {
        // 🔄 Replace this with your actual feature implementation
        this.log('⚡ Performing your custom feature...');
        
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        this.log('✨ Custom feature completed!', 'success');
    }

    async trackUserAction() {
        if (!this.isInitialized) {
            this.log('❌ App not initialized yet', 'error');
            return;
        }

        try {
            await this.sdk.trackActivity('custom_action', {
                action_type: 'button_click',
                feature: 'track_activity',
                timestamp: new Date().toISOString(),
                user_agent: navigator.userAgent.substring(0, 100) // Truncate for privacy
            });
            
            this.log('📊 User action tracked successfully', 'success');
        } catch (error) {
            this.log(`❌ Activity tracking failed: ${error.message}`, 'error');
        }
    }

    async refreshData() {
        if (!this.isInitialized) {
            this.log('❌ App not initialized yet', 'error');
            return;
        }

        try {
            this.log('🔄 Refreshing data...');
            await Promise.all([
                this.loadUserData(),
                this.loadCreditData()
            ]);
            this.log('✅ Data refreshed successfully', 'success');
        } catch (error) {
            this.log(`❌ Refresh failed: ${error.message}`, 'error');
        }
    }

    // 🔄 Add more custom methods here for your app's specific functionality
}

// Global app instance
let app;

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    app = new VentureVerseApp();
    await app.initialize();
});

// Make functions globally available for onclick handlers
window.useFeature = () => app?.useFeature();
window.trackUserAction = () => app?.trackUserAction();
window.refreshData = () => app?.refreshData();

// Debug helper
window.getAppInstance = () => app;