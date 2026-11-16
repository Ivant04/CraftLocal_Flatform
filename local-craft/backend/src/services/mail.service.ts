import nodemailer from 'nodemailer';
import { env } from '../config/env';

interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (transporter) return transporter;
  if (!env.MAIL_USER || !env.MAIL_PASS) {
    return null;
  }
  transporter = nodemailer.createTransport({
    host: env.MAIL_HOST || 'smtp.gmail.com',
    port: env.MAIL_PORT || 587,
    secure: env.MAIL_PORT === 465,
    auth: {
      user: env.MAIL_USER,
      pass: env.MAIL_PASS,
    },
  });
  return transporter;
}

/**
 * Modern Heritage Email Layout cho CraftLocal
 */
function renderEmailLayout(title: string, contentHtml: string): string {
  const currentYear = new Date().getFullYear();
  const clientUrl = env.CLIENT_URL || 'https://craftlocal-frontend-vq6q.onrender.com';

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background-color: #faf6f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #2d2621; }
    .email-container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(74, 55, 40, 0.08); border: 1px solid #ebd9c8; }
    .email-header { background: linear-gradient(135deg, #964824 0%, #b85c32 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
    .email-header h1 { margin: 0 0 6px; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
    .email-header p { margin: 0; font-size: 13px; opacity: 0.9; text-transform: uppercase; letter-spacing: 1.5px; }
    .email-body { padding: 32px 28px; line-height: 1.6; font-size: 15px; }
    .greeting { font-size: 18px; font-weight: 600; color: #964824; margin-bottom: 16px; }
    .highlight-card { background: #faf4ed; border: 1px solid #e7d5c2; border-radius: 12px; padding: 18px 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #e3cfbd; font-size: 14px; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #705847; font-weight: 500; }
    .detail-value { color: #2d2621; font-weight: 600; text-align: right; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #e8f5e9; color: #2e7d32; }
    .btn { display: inline-block; background: #964824; color: #ffffff !important; text-decoration: none; padding: 13px 28px; border-radius: 10px; font-weight: 600; font-size: 15px; text-align: center; margin: 22px 0 10px; }
    .btn:hover { background: #7c3a1c; }
    .email-footer { background: #f5ece2; padding: 22px 24px; text-align: center; font-size: 12px; color: #7c6858; line-height: 1.6; border-top: 1px solid #ecd8c7; }
    .email-footer a { color: #964824; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>CraftLocal</h1>
      <p>Trải nghiệm làng nghề thủ công Việt Nam</p>
    </div>
    <div class="email-body">
      ${contentHtml}
    </div>
    <div class="email-footer">
      <p>Email này được gửi tự động từ nền tảng <strong>CraftLocal</strong>.<br>Mọi thắc mắc vui lòng liên hệ <a href="mailto:support@craftlocal.vn">support@craftlocal.vn</a> hoặc hotline <strong>1900 6868</strong>.</p>
      <p style="margin-top: 8px; font-size: 11px; opacity: 0.8;">© ${currentYear} CraftLocal. Bản quyền thuộc về Dự án Làng nghề Văn hóa Việt Nam.</p>
      <p style="margin-top: 4px;"><a href="${clientUrl}">Truy cập website CraftLocal</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export class MailService {
  /**
   * Hàm gửi mail gốc
   */
  static async sendMail(options: SendMailOptions): Promise<boolean> {
    const { to, subject, html } = options;

    if (!to || !to.includes('@')) {
      console.warn(`[MailService] Bỏ qua gửi email vì địa chỉ không hợp lệ: "${to}"`);
      return false;
    }

    // 1. Ưu tiên gửi qua Brevo HTTP REST API (Cổng 443 - Cho phép gửi tới mọi người nhận không cần domain riêng)
    const brevoApiKey = process.env.BREVO_API_KEY;
    if (brevoApiKey) {
      try {
        const senderEmail = process.env.BREVO_SENDER_EMAIL || env.MAIL_USER || 'vaductai2905@gmail.com';
        const response = await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': brevoApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'CraftLocal Vietnam', email: senderEmail },
            to: [{ email: to }],
            subject,
            htmlContent: html,
          }),
        });

        const resData: any = await response.json();
        if (!response.ok) {
          throw new Error(resData?.message || JSON.stringify(resData));
        }

        console.log(`✅ [MailService - Brevo API] Đã gửi email thành công tới: ${to} (ID: ${resData.messageId})`);
        return true;
      } catch (err: any) {
        console.error(`❌ [MailService - Brevo API] Lỗi gửi tới ${to}:`, err.message);
      }
    }

    // 2. Tiếp theo: Resend HTTP REST API (Cổng 443)
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        const fromEmail = process.env.RESEND_FROM || 'CraftLocal <onboarding@resend.dev>';
        let response = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: fromEmail,
            to: [to],
            subject,
            html,
          }),
        });

        let resData: any = await response.json();

        // Xử lý tự động khi dính chính sách tài khoản thử nghiệm của Resend (chỉ cho gửi tới email chính chủ tài khoản):
        if (!response.ok && (resData?.message?.includes('testing emails') || resData?.message?.includes('own email address'))) {
          const matchEmail = resData.message.match(/\(([^)]+@gmail\.com|[^)]+@[^)]+)\)/);
          const ownerEmail = matchEmail ? matchEmail[1] : (env.MAIL_USER || 'vaductai2905@gmail.com');

          console.warn(`[MailService - Resend Test Mode] Tài khoản Resend chưa gắn domain riêng, tự động chuyển tiếp tới hòm thư chủ tài khoản: ${ownerEmail} (người nhận gốc: ${to})`);

          const forwardNotice = `
            <div style="background: #fff3cd; color: #856404; padding: 14px 18px; border-radius: 10px; margin-bottom: 22px; font-size: 13px; border: 1px solid #ffeeba; line-height: 1.5;">
              ⚠️ <strong>Chế độ thử nghiệm Resend:</strong> Do tài khoản Resend chưa xác thực tên miền riêng, Resend chỉ cho phép gửi về email chủ tài khoản (<strong>${ownerEmail}</strong>).<br>
              👤 Người nhận thực tế của hệ thống: <strong>${to}</strong>
            </div>
          `;

          response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fromEmail,
              to: [ownerEmail],
              subject: `[Test] ${subject} (Gửi tới: ${to})`,
              html: forwardNotice + html,
            }),
          });

          resData = await response.json();
        }

        if (!response.ok) {
          throw new Error(resData?.message || JSON.stringify(resData));
        }

        console.log(`✅ [MailService - Resend API] Đã gửi email thành công tới: ${to} (ID: ${resData.id})`);
        return true;
      } catch (err: any) {
        console.error(`❌ [MailService - Resend API] Lỗi gửi tới ${to}:`, err.message);
      }
    }

    // 3. Fallback: SMTP Nodemailer (Hoạt động trên Localhost hoặc Render có mở cổng)
    const mailer = getTransporter();
    if (!mailer) {
      console.log(`📧 [Mock Mail] Chưa cấu hình RESEND_API_KEY, BREVO_API_KEY hoặc MAIL_USER/MAIL_PASS`);
      console.log(`   ➡️ TO: ${to}`);
      console.log(`   ➡️ SUBJECT: ${subject}`);
      return true;
    }

    try {
      const fromAddress = env.MAIL_USER ? `"CraftLocal Vietnam" <${env.MAIL_USER}>` : undefined;
      await mailer.sendMail({
        from: fromAddress,
        to,
        subject,
        html,
      });
      console.log(`✅ [MailService - SMTP] Đã gửi email thành công tới: ${to} (Subject: ${subject})`);
      return true;
    } catch (error: any) {
      console.error(`❌ [MailService - SMTP] Lỗi khi gửi email tới ${to}:`, error.message);
      return false;
    }
  }

  // =========================================================================
  // 1. THÔNG BÁO ĐẶT WORKSHOP THÀNH CÔNG (GỬI DU KHÁCH & CHỦ XƯỞNG)
  // =========================================================================

  /**
   * Gửi email xác nhận đặt vé trải nghiệm thành công cho du khách
   */
  static async sendBookingConfirmationToTourist(params: {
    touristEmail: string;
    touristName: string;
    bookingCode: string;
    ticketCode?: string;
    workshopTitle: string;
    workshopAddress: string;
    timeslotDate: string;
    timeslotTime: string;
    guests: number;
    totalAmount: number;
    bookingId: string;
  }) {
    const clientUrl = env.CLIENT_URL || 'https://craftlocal-frontend-vq6q.onrender.com';
    const ticketUrl = `${clientUrl}/my-bookings`;
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.totalAmount);

    const contentHtml = `
      <div class="greeting">Xin chào ${params.touristName},</div>
      <p>Chúc mừng bạn đã đặt chỗ thành công cho buổi trải nghiệm thủ công tại <strong>${params.workshopTitle}</strong>! Vé điện tử của bạn đã sẵn sàng.</p>
      
      <div class="highlight-card">
        <div class="detail-row">
          <span class="detail-label">Mã đặt chỗ:</span>
          <span class="detail-value">${params.bookingCode}</span>
        </div>
        ${params.ticketCode ? `
        <div class="detail-row">
          <span class="detail-label">Mã vé (Ticket):</span>
          <span class="detail-value" style="color: #964824;">${params.ticketCode}</span>
        </div>` : ''}
        <div class="detail-row">
          <span class="detail-label">Trải nghiệm:</span>
          <span class="detail-value">${params.workshopTitle}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Thời gian:</span>
          <span class="detail-value">${params.timeslotTime} • Ngày ${params.timeslotDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Số lượng khách:</span>
          <span class="detail-value">${params.guests} khách</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Địa chỉ xưởng:</span>
          <span class="detail-value">${params.workshopAddress}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tổng thanh toán:</span>
          <span class="detail-value" style="color: #2e7d32; font-size: 16px;">${formattedPrice}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Trạng thái:</span>
          <span class="detail-value"><span class="badge">ĐÃ THANH TOÁN</span></span>
        </div>
      </div>

      <p style="font-size: 13px; color: #6b5749; margin-top: 10px;">
        💡 <strong>Hướng dẫn check-in:</strong> Khi đến xưởng, vui lòng xuất trình mã QR trên vé điện tử cho chủ xưởng hoặc hướng dẫn viên để được quét mã tham gia nhanh chóng.
      </p>

      <div style="text-align: center;">
        <a href="${ticketUrl}" class="btn">Xem vé điện tử & Mã QR</a>
      </div>
    `;

    const html = renderEmailLayout('Xác nhận đặt vé workshop thành công - CraftLocal', contentHtml);
    return this.sendMail({
      to: params.touristEmail,
      subject: `[CraftLocal] Xác nhận đặt vé thành công: ${params.workshopTitle} (#${params.bookingCode})`,
      html,
    });
  }

  /**
   * Gửi email thông báo có khách đặt trải nghiệm mới cho chủ xưởng (Host)
   */
  static async sendNewBookingAlertToHost(params: {
    hostEmail: string;
    hostName: string;
    workshopTitle: string;
    bookingCode: string;
    touristName: string;
    touristPhone: string;
    touristEmail: string;
    timeslotDate: string;
    timeslotTime: string;
    guests: number;
    totalAmount: number;
  }) {
    const clientUrl = env.CLIENT_URL || 'https://craftlocal-frontend-vq6q.onrender.com';
    const manageUrl = `${clientUrl}/host/bookings`;
    const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(params.totalAmount);

    const contentHtml = `
      <div class="greeting">Kính gửi Nghệ nhân / Chủ xưởng ${params.hostName},</div>
      <p>Xưởng của bạn vừa nhận được một đơn đặt lịch trải nghiệm mới cho workshop <strong>${params.workshopTitle}</strong>!</p>

      <div class="highlight-card">
        <div class="detail-row">
          <span class="detail-label">Mã đặt chỗ:</span>
          <span class="detail-value">${params.bookingCode}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Họ tên du khách:</span>
          <span class="detail-value">${params.touristName}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Số điện thoại liên hệ:</span>
          <span class="detail-value">${params.touristPhone || 'Chưa cung cấp'}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Email khách:</span>
          <span class="detail-value">${params.touristEmail}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Khung giờ trải nghiệm:</span>
          <span class="detail-value" style="color: #964824;">${params.timeslotTime} • Ngày ${params.timeslotDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Số khách tham gia:</span>
          <span class="detail-value">${params.guests} khách</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Doanh thu tạm tính:</span>
          <span class="detail-value" style="color: #2e7d32;">${formattedPrice}</span>
        </div>
      </div>

      <p style="font-size: 13px; color: #6b5749;">
        🛠️ Quý xưởng vui lòng chuẩn bị sẵn sàng nguyên vật liệu và không gian thực hành để tiếp đón du khách chu đáo nhất!
      </p>

      <div style="text-align: center;">
        <a href="${manageUrl}" class="btn">Quản lý lịch đặt xưởng</a>
      </div>
    `;

    const html = renderEmailLayout('Có khách mới đặt trải nghiệm - CraftLocal Host', contentHtml);
    return this.sendMail({
      to: params.hostEmail,
      subject: `[CraftLocal] Có khách đặt trải nghiệm mới: ${params.workshopTitle} (${params.guests} khách)`,
      html,
    });
  }

  // =========================================================================
  // 2. THÔNG BÁO CHECK-IN THÀNH CÔNG (GỬI DU KHÁCH)
  // =========================================================================

  /**
   * Gửi email xác nhận check-in thành công cho du khách
   */
  static async sendCheckInConfirmationToTourist(params: {
    touristEmail: string;
    touristName: string;
    workshopTitle: string;
    checkedInTime: string;
    bookingCode: string;
  }) {
    const clientUrl = env.CLIENT_URL || 'https://craftlocal-frontend-vq6q.onrender.com';
    const reviewUrl = `${clientUrl}/my-bookings`;

    const contentHtml = `
      <div class="greeting">Xin chào ${params.touristName},</div>
      <p>Vé trải nghiệm của bạn cho buổi thực hành <strong>${params.workshopTitle}</strong> đã được <strong>check-in thành công</strong> vào lúc <strong>${params.checkedInTime}</strong>!</p>

      <div class="highlight-card" style="text-align: center;">
        <p style="font-size: 32px; margin: 0 0 10px;">🎨 ✨</p>
        <p style="font-size: 16px; font-weight: 600; color: #964824; margin: 0 0 6px;">Chúc bạn có một buổi trải nghiệm thủ công tuyệt vời!</p>
        <p style="margin: 0; font-size: 13px; color: #705847;">Hãy hòa mình vào câu chuyện văn hóa, tự tay tạo tác thành phẩm và lưu giữ những kỷ niệm đẹp cùng nghệ nhân làng nghề.</p>
      </div>

      <p style="font-size: 13px; color: #6b5749;">
        Sau khi kết thúc buổi trải nghiệm, đừng quên chia sẻ cảm nhận và hình ảnh thành phẩm của bạn để nhận thêm điểm thưởng từ CraftLocal nhé!
      </p>

      <div style="text-align: center;">
        <a href="${reviewUrl}" class="btn">Xem thông tin đặt chỗ</a>
      </div>
    `;

    const html = renderEmailLayout('Check-in thành công - CraftLocal', contentHtml);
    return this.sendMail({
      to: params.touristEmail,
      subject: `[CraftLocal] Check-in thành công tại ${params.workshopTitle}`,
      html,
    });
  }

  // =========================================================================
  // 3. THÔNG BÁO ĐÁNH GIÁ MỚI (GỬI CHỦ XƯỞNG)
  // =========================================================================

  /**
   * Gửi email thông báo có đánh giá mới cho chủ xưởng
   */
  static async sendNewReviewAlertToHost(params: {
    hostEmail: string;
    hostName: string;
    workshopTitle: string;
    touristName: string;
    rating: number;
    comment: string;
  }) {
    const clientUrl = env.CLIENT_URL || 'https://craftlocal-frontend-vq6q.onrender.com';
    const manageUrl = `${clientUrl}/host/workshops`;
    const stars = '⭐'.repeat(Math.min(Math.max(params.rating, 1), 5));

    const contentHtml = `
      <div class="greeting">Kính gửi ${params.hostName},</div>
      <p>Workshop <strong>${params.workshopTitle}</strong> của bạn vừa nhận được đánh giá mới từ du khách <strong>${params.touristName}</strong>!</p>

      <div class="highlight-card">
        <div class="detail-row">
          <span class="detail-label">Đánh giá sao:</span>
          <span class="detail-value" style="font-size: 18px;">${stars} (${params.rating}/5)</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Người đánh giá:</span>
          <span class="detail-value">${params.touristName}</span>
        </div>
        <div style="margin-top: 12px; padding-top: 8px; border-top: 1px dashed #ebd9c8;">
          <span class="detail-label" style="display: block; margin-bottom: 6px;">Nội dung cảm nhận:</span>
          <blockquote style="margin: 0; padding: 10px 14px; background: #ffffff; border-left: 3px solid #964824; font-style: italic; border-radius: 6px; color: #433328;">
            "${params.comment || 'Không có lời nhắn bổ sung.'}"
          </blockquote>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${manageUrl}" class="btn">Xem & Phản hồi đánh giá</a>
      </div>
    `;

    const html = renderEmailLayout('Đánh giá mới từ du khách - CraftLocal', contentHtml);
    return this.sendMail({
      to: params.hostEmail,
      subject: `[CraftLocal] Du khách vừa đánh giá ${params.rating}⭐ cho workshop ${params.workshopTitle}`,
      html,
    });
  }

  // =========================================================================
  // 4. THÔNG BÁO ĐẶT HÀNG THÀNH CÔNG (GỬI DU KHÁCH & SHOP/CHỦ XƯỞNG)
  // =========================================================================

  /**
   * Gửi email xác nhận đơn hàng sản phẩm cho du khách
   */
  static async sendOrderConfirmationToTourist(params: {
    touristEmail: string;
    touristName: string;
    orderCode: string;
    items: Array<{ name: string; quantity: number; price: number; subtotal: number }>;
    shippingAddress: string;
    shippingFee: number;
    totalAmount: number;
  }) {
    const clientUrl = env.CLIENT_URL || 'https://craftlocal-frontend-vq6q.onrender.com';
    const orderUrl = `${clientUrl}/my-orders`;
    const formatMoney = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const itemsRows = params.items.map((item) => `
      <div class="detail-row">
        <span class="detail-label">${item.name} × ${item.quantity}</span>
        <span class="detail-value">${formatMoney(item.subtotal)}</span>
      </div>
    `).join('');

    const contentHtml = `
      <div class="greeting">Xin chào ${params.touristName},</div>
      <p>Cảm ơn bạn đã đặt mua sản phẩm thủ công truyền thống trên <strong>CraftLocal</strong>! Đơn hàng của bạn đã được thanh toán và chuyển tới chủ xưởng để chuẩn bị giao hàng.</p>

      <div class="highlight-card">
        <div class="detail-row">
          <span class="detail-label">Mã đơn hàng:</span>
          <span class="detail-value">${params.orderCode}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Địa chỉ nhận hàng:</span>
          <span class="detail-value">${params.shippingAddress}</span>
        </div>
        <div style="margin: 12px 0 6px; font-weight: 600; color: #964824; font-size: 13px; text-transform: uppercase;">Chi tiết sản phẩm:</div>
        ${itemsRows}
        <div class="detail-row">
          <span class="detail-label">Phí vận chuyển:</span>
          <span class="detail-value">${formatMoney(params.shippingFee)}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Tổng thanh toán:</span>
          <span class="detail-value" style="color: #2e7d32; font-size: 16px;">${formatMoney(params.totalAmount)}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${orderUrl}" class="btn">Theo dõi đơn hàng của tôi</a>
      </div>
    `;

    const html = renderEmailLayout('Xác nhận đặt hàng thành công - CraftLocal', contentHtml);
    return this.sendMail({
      to: params.touristEmail,
      subject: `[CraftLocal] Xác nhận đơn hàng sản phẩm thành công (#${params.orderCode})`,
      html,
    });
  }

  /**
   * Gửi email thông báo có đơn hàng sản phẩm mới cho chủ xưởng
   */
  static async sendNewOrderAlertToHost(params: {
    hostEmail: string;
    hostName: string;
    orderCode: string;
    touristName: string;
    touristPhone: string;
    shippingAddress: string;
    items: Array<{ name: string; quantity: number; price: number; subtotal: number }>;
    totalAmount: number;
  }) {
    const clientUrl = env.CLIENT_URL || 'https://craftlocal-frontend-vq6q.onrender.com';
    const manageUrl = `${clientUrl}/host/orders`;
    const formatMoney = (amount: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

    const itemsRows = params.items.map((item) => `
      <div class="detail-row">
        <span class="detail-label">${item.name} × ${item.quantity}</span>
        <span class="detail-value">${formatMoney(item.subtotal)}</span>
      </div>
    `).join('');

    const contentHtml = `
      <div class="greeting">Kính gửi ${params.hostName},</div>
      <p>Cửa hàng của bạn vừa nhận được một đơn đặt mua sản phẩm thủ công mới (#<strong>${params.orderCode}</strong>)!</p>

      <div class="highlight-card">
        <div class="detail-row">
          <span class="detail-label">Mã đơn hàng:</span>
          <span class="detail-value">${params.orderCode}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Khách nhận:</span>
          <span class="detail-value">${params.touristName} (${params.touristPhone || 'SĐT chưa có'})</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Địa chỉ giao:</span>
          <span class="detail-value">${params.shippingAddress}</span>
        </div>
        <div style="margin: 12px 0 6px; font-weight: 600; color: #964824; font-size: 13px; text-transform: uppercase;">Sản phẩm cần đóng gói:</div>
        ${itemsRows}
        <div class="detail-row">
          <span class="detail-label">Tổng giá trị đơn:</span>
          <span class="detail-value" style="color: #2e7d32;">${formatMoney(params.totalAmount)}</span>
        </div>
      </div>

      <div style="text-align: center;">
        <a href="${manageUrl}" class="btn">Xử lý & Cập nhật đơn hàng</a>
      </div>
    `;

    const html = renderEmailLayout('Đơn đặt hàng sản phẩm mới - CraftLocal Host', contentHtml);
    return this.sendMail({
      to: params.hostEmail,
      subject: `[CraftLocal] Có đơn đặt mua sản phẩm mới (#${params.orderCode})`,
      html,
    });
  }

  // =========================================================================
  // 5. THÔNG BÁO CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG (GỬI DU KHÁCH)
  // =========================================================================

  /**
   * Gửi email cập nhật tiến độ đơn hàng cho du khách (Đang đóng gói, Đang giao, Đã giao)
   */
  static async sendOrderStatusUpdateEmail(params: {
    touristEmail: string;
    touristName: string;
    orderCode: string;
    status: 'CONFIRMED' | 'PACKING' | 'SHIPPING' | 'COMPLETED' | 'CANCELLED';
    note?: string;
  }) {
    const clientUrl = env.CLIENT_URL || 'https://craftlocal-frontend-vq6q.onrender.com';
    const orderUrl = `${clientUrl}/my-orders`;

    const statusMap: Record<string, { label: string; desc: string; icon: string }> = {
      CONFIRMED: { label: 'Đã xác nhận đơn hàng', desc: 'Chủ xưởng đã tiếp nhận đơn và đang chuẩn bị sản phẩm.', icon: '📋' },
      PACKING: { label: 'Đang đóng gói', desc: 'Sản phẩm của bạn đang được cẩn thận đóng gói theo tiêu chuẩn an toàn.', icon: '📦' },
      SHIPPING: { label: 'Đang vận chuyển', desc: 'Kiện hàng đã được bàn giao cho đối tác vận chuyển để chuyển tới địa chỉ của bạn.', icon: '🚚' },
      COMPLETED: { label: 'Giao hàng thành công', desc: 'Đơn hàng đã được giao thành công. Chúc bạn có trải nghiệm tuyệt vời cùng tác phẩm thủ công!', icon: '🎉' },
      CANCELLED: { label: 'Đơn hàng đã bị hủy', desc: 'Đơn hàng của bạn đã bị hủy. Vui lòng liên hệ hỗ trợ nếu cần thêm thông tin hoàn tiền.', icon: '❌' },
    };

    const statusInfo = statusMap[params.status] || { label: params.status, desc: 'Trạng thái đơn hàng đã được cập nhật.', icon: '🔔' };

    const contentHtml = `
      <div class="greeting">Xin chào ${params.touristName},</div>
      <p>Đơn hàng <strong>#${params.orderCode}</strong> của bạn đã có cập nhật trạng thái mới nhất từ chủ xưởng:</p>

      <div class="highlight-card" style="text-align: center; padding: 24px;">
        <div style="font-size: 38px; margin-bottom: 8px;">${statusInfo.icon}</div>
        <div style="font-size: 18px; font-weight: 700; color: #964824; margin-bottom: 6px;">${statusInfo.label}</div>
        <p style="margin: 0; font-size: 14px; color: #5a473b;">${statusInfo.desc}</p>
        ${params.note ? `<p style="margin-top: 10px; font-size: 13px; color: #8d7564; font-style: italic;">Ghi chú: ${params.note}</p>` : ''}
      </div>

      <div style="text-align: center;">
        <a href="${orderUrl}" class="btn">Kiểm tra chi tiết đơn hàng</a>
      </div>
    `;

    const html = renderEmailLayout(`Cập nhật đơn hàng #${params.orderCode} - CraftLocal`, contentHtml);
    return this.sendMail({
      to: params.touristEmail,
      subject: `[CraftLocal] Đơn hàng #${params.orderCode} cập nhật: ${statusInfo.label}`,
      html,
    });
  }
}
