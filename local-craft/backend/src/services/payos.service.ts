import payos from '../config/payos';
import { env } from '../config/env';

export interface CreatePaymentLinkParams {
  orderCode: number;
  amount: number;
  description: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  returnUrl?: string;
  cancelUrl?: string;
}

export interface PayOSPaymentLinkResult {
  checkoutUrl: string;
  paymentLinkId: string;
  qrCode: string;
  raw: any;
}

export class PayOSService {
  /**
   * Tạo payment link payOS
   * SDK v2: payos.paymentRequests.create()
   */
  static async createPaymentLink(params: CreatePaymentLinkParams): Promise<PayOSPaymentLinkResult> {
    const result = await payos.paymentRequests.create({
      orderCode: params.orderCode,
      amount: params.amount,
      description: params.description.slice(0, 25), // payOS limit 25 chars
      items: params.items,
      returnUrl: params.returnUrl || env.PAYOS_RETURN_URL,
      cancelUrl: params.cancelUrl || env.PAYOS_CANCEL_URL,
    });

    return {
      checkoutUrl: (result as any).checkoutUrl,
      paymentLinkId: (result as any).paymentLinkId,
      qrCode: (result as any).qrCode || '',
      raw: result,
    };
  }

  /**
   * Verify webhook data từ payOS
   * SDK v2: payos.webhooks.verify()
   */
  static verifyWebhookData(webhookBody: any) {
    return payos.webhooks.verify(webhookBody);
  }

  /**
   * Lấy thông tin payment từ payOS theo orderCode
   * SDK v2: payos.paymentRequests.get()
   */
  static async getPaymentInfo(orderCode: number | string) {
    return payos.paymentRequests.get(String(orderCode));
  }

  /**
   * Hủy payment link
   * SDK v2: payos.paymentRequests.cancel()
   */
  static async cancelPaymentLink(orderCode: number | string, reason?: string) {
    return payos.paymentRequests.cancel(String(orderCode), reason);
  }

  /**
   * Tạo orderCode unique dạng number
   * Dùng timestamp + random để tránh trùng
   */
  static generateOrderCode(): number {
    // Lấy 8 chữ số cuối của timestamp + 4 chữ số random
    const timestamp = Date.now() % 100000000; // 8 digits
    const random = Math.floor(Math.random() * 10000); // 4 digits
    return timestamp * 10000 + random;
  }
}
