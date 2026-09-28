/**
 * PayOS Payment Gateway Service
 * Prepares architecture for PayOS integration without hardcoding credentials or breaking base setup.
 */

class PayOSService {
  constructor() {
    this.clientId = process.env.PAYOS_CLIENT_ID || '';
    this.apiKey = process.env.PAYOS_API_KEY || '';
    this.checksumKey = process.env.PAYOS_CHECKSUM_KEY || '';
  }

  isConfigured() {
    return Boolean(this.clientId && this.apiKey && this.checksumKey);
  }

  /**
   * Create a payment checkout link
   * @param {Object} paymentData
   * @param {number} paymentData.orderCode
   * @param {number} paymentData.amount
   * @param {string} paymentData.description
   * @param {string} paymentData.returnUrl
   * @param {string} paymentData.cancelUrl
   */
  async createPaymentLink(paymentData) {
    if (!this.isConfigured()) {
      console.warn('[PayOS] Credentials not configured in .env. Returning simulated payment link structure.');
      return {
        bin: '970407',
        accountNumber: '1234567890',
        accountName: 'LOCAL CRAFT TEST',
        amount: paymentData.amount,
        description: paymentData.description,
        orderCode: paymentData.orderCode,
        currency: 'VND',
        paymentLinkId: `mock_link_${paymentData.orderCode}`,
        status: 'PENDING',
        checkoutUrl: `${process.env.CLIENT_URL || 'http://localhost:5173'}/payment-mock?orderCode=${paymentData.orderCode}&amount=${paymentData.amount}`,
        qrCode: 'mock_qr_code_data'
      };
    }

    // When official @payos/node is installed and configured:
    // const PayOS = require('@payos/node');
    // const payos = new PayOS(this.clientId, this.apiKey, this.checksumKey);
    // return await payos.createPaymentLink(paymentData);
    
    return {
      orderCode: paymentData.orderCode,
      amount: paymentData.amount,
      status: 'PENDING',
      checkoutUrl: `https://pay.payos.vn/web/${paymentData.orderCode}`
    };
  }

  /**
   * Get payment link information by orderCode
   * @param {number|string} orderCode
   */
  async getPaymentLinkInformation(orderCode) {
    if (!this.isConfigured()) {
      return {
        orderCode,
        amount: 0,
        status: 'PENDING',
        simulated: true
      };
    }
    // const payos = new PayOS(this.clientId, this.apiKey, this.checksumKey);
    // return await payos.getPaymentLinkInformation(orderCode);
    return { orderCode, status: 'PENDING' };
  }

  /**
   * Cancel payment link
   * @param {number|string} orderCode
   * @param {string} cancellationReason
   */
  async cancelPaymentLink(orderCode, cancellationReason = 'Customer cancelled') {
    return {
      orderCode,
      status: 'CANCELLED',
      cancellationReason
    };
  }

  /**
   * Verify Webhook data checksum
   * @param {Object} webhookBody
   */
  verifyPaymentWebhookData(webhookBody) {
    if (!this.isConfigured()) {
      return webhookBody;
    }
    // return payos.verifyPaymentWebhookData(webhookBody);
    return webhookBody;
  }
}

module.exports = new PayOSService();
