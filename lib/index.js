const axios = require('axios');
const crypto = require('crypto');

/**
 * FakePay SDK - Official Node.js SDK
 * Inspired by Razorpay SDK structure
 */
class FakePay {
  /**
   * Initialize FakePay SDK
   * @param {Object} options - Configuration options
   * @param {string} options.key_id - API Key ID
   * @param {string} options.key_secret - API Key Secret
   * @param {string} options.baseUrl - Base URL (default: http://localhost:4000)
   */
  constructor(options = {}) {
    if (!options.key_id || !options.key_secret) {
      throw new Error('key_id and key_secret are required');
    }

    this.keyId = options.key_id;
    this.keySecret = options.key_secret;
    this.baseUrl = options.baseUrl || 'http://localhost:4000';

    // Initialize API client
    this.client = axios.create({
      baseURL: `${this.baseUrl}/api/v1`,
      headers: {
        'Content-Type': 'application/json'
      },
      auth: {
        username: this.keyId,
        password: this.keySecret
      }
    });

    // Initialize resource modules
    this.payments = new Payments(this.client);
    this.upi = new UPI(this.client);
    this.wallets = new Wallets(this.client);
    this.webhooks = new Webhooks(this.keySecret);
  }
}

/**
 * Payments Resource
 */
class Payments {
  constructor(client) {
    this.client = client;
  }

  /**
   * Create a payment
   * @param {Object} params - Payment parameters
   * @param {string} params.merchantId - Merchant ID
   * @param {number} params.amount - Amount in smallest currency unit (paise)
   * @param {string} params.orderId - Order ID
   * @param {string} params.callbackUrl - Callback URL for webhooks
   * @param {Object} params.metadata - Additional metadata
   * @returns {Promise<Object>} Payment object
   */
  async create(params) {
    const { merchantId, amount, orderId, callbackUrl, recipientId, metadata } = params;

    if (!merchantId || !amount || !orderId) {
      throw new Error('merchantId, amount, and orderId are required');
    }

    try {
      const response = await this.client.post('/payments', {
        merchantId,
        amount,
        orderId,
        callbackUrl,
        recipientId,
        metadata
      });

      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Fetch payment details
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} Payment object
   */
  async fetch(paymentId) {
    try {
      const response = await this.client.get(`/payments/${paymentId}`);
      return response.data.payment;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * List all payments
   * @param {Object} options - Filter options
   * @param {string} options.merchantId - Filter by merchant ID
   * @param {string} options.status - Filter by status
   * @param {number} options.limit - Number of records (default: 50)
   * @param {number} options.offset - Offset for pagination
   * @returns {Promise<Object>} List of payments
   */
  async list(options = {}) {
    try {
      const response = await this.client.get('/payments', { params: options });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Refund a payment
   * @param {string} paymentId - Payment ID
   * @param {Object} params - Refund parameters
   * @param {number} params.amount - Refund amount (optional, full refund if not specified)
   * @param {string} params.reason - Refund reason
   * @returns {Promise<Object>} Refund object
   */
  async refund(paymentId, params = {}) {
    try {
      const response = await this.client.post(`/payments/${paymentId}/refund`, params);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  _handleError(error) {
    if (error.response) {
      const err = new Error(error.response.data.error || 'API Error');
      err.statusCode = error.response.status;
      err.response = error.response.data;
      return err;
    }
    return error;
  }
}

/**
 * UPI Resource
 */
class UPI {
  constructor(client) {
    this.client = client;
  }

  /**
   * Create UPI VPA
   * @param {Object} params - VPA parameters
   * @param {string} params.userId - User ID
   * @param {string} params.vpa - VPA address (e.g., user@fakepay)
   * @returns {Promise<Object>} VPA object
   */
  async createVpa(params) {
    try {
      const response = await this.client.post('/upi/vpa', params);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Get user's VPAs
   * @param {string} userId - User ID
   * @returns {Promise<Array>} List of VPAs
   */
  async getVpas(userId) {
    try {
      const response = await this.client.get(`/upi/vpa/${userId}`);
      return response.data.vpas;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Initiate UPI payment
   * @param {Object} params - UPI payment parameters
   * @param {string} params.paymentId - Payment ID
   * @param {string} params.payerVpa - Payer's VPA
   * @returns {Promise<Object>} UPI transaction object
   */
  async initiate(params) {
    try {
      const response = await this.client.post('/upi/initiate', params);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Confirm UPI payment
   * @param {Object} params - Confirmation parameters
   * @param {string} params.txnId - Transaction ID
   * @param {string} params.pin - UPI PIN (for demo purposes)
   * @returns {Promise<Object>} Transaction result
   */
  async confirm(params) {
    try {
      const response = await this.client.post('/upi/confirm', params);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Get UPI transaction details
   * @param {string} txnId - Transaction ID
   * @returns {Promise<Object>} Transaction object
   */
  async getTransaction(txnId) {
    try {
      const response = await this.client.get(`/upi/transaction/${txnId}`);
      return response.data.transaction;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Generate UPI QR code
   * @param {string} paymentId - Payment ID
   * @returns {Promise<Object>} QR code data and UPI intent
   */
  async generateQr(paymentId) {
    try {
      const response = await this.client.get(`/upi/qr/${paymentId}`);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Get UPI transaction history
   * @param {string} userId - User ID
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Transaction history
   */
  async getHistory(userId, options = {}) {
    try {
      const response = await this.client.get(`/upi/history/${userId}`, { params: options });
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  _handleError(error) {
    if (error.response) {
      const err = new Error(error.response.data.error || 'API Error');
      err.statusCode = error.response.status;
      err.response = error.response.data;
      return err;
    }
    return error;
  }
}

/**
 * Wallets Resource
 */
class Wallets {
  constructor(client) {
    this.client = client;
  }

  /**
   * Get wallet balance
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Wallet object
   */
  async getBalance(userId) {
    try {
      const response = await this.client.get(`/wallets/${userId}`);
      return response.data.wallet;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Top up wallet
   * @param {Object} params - Top-up parameters
   * @param {string} params.userId - User ID
   * @param {number} params.amount - Amount to add
   * @returns {Promise<Object>} Updated wallet
   */
  async topup(params) {
    try {
      const response = await this.client.post('/wallets/topup', params);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Transfer between wallets
   * @param {Object} params - Transfer parameters
   * @param {string} params.from - Sender user ID
   * @param {string} params.to - Receiver user ID
   * @param {number} params.amount - Amount to transfer
   * @returns {Promise<Object>} Transfer result
   */
  async transfer(params) {
    try {
      const response = await this.client.post('/wallets/transfer', params);
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  _handleError(error) {
    if (error.response) {
      const err = new Error(error.response.data.error || 'API Error');
      err.statusCode = error.response.status;
      err.response = error.response.data;
      return err;
    }
    return error;
  }
}

/**
 * Webhooks Utility
 */
class Webhooks {
  constructor(keySecret) {
    this.keySecret = keySecret;
  }

  /**
   * Verify webhook signature
   * @param {Object} body - Webhook payload
   * @param {string} signature - Signature from X-FakePay-Signature header
   * @returns {boolean} True if signature is valid
   */
  verify(body, signature) {
    const payloadString = typeof body === 'string' ? body : JSON.stringify(body);
    
    const expectedSignature = crypto
      .createHmac('sha256', this.keySecret)
      .update(payloadString)
      .digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }

  /**
   * Generate signature for testing
   * @param {Object} payload - Webhook payload
   * @returns {string} HMAC SHA256 signature
   */
  generateSignature(payload) {
    const payloadString = typeof payload === 'string' ? payload : JSON.stringify(payload);
    
    return crypto
      .createHmac('sha256', this.keySecret)
      .update(payloadString)
      .digest('hex');
  }
}

module.exports = FakePay;
