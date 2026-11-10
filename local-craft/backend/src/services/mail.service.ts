// Placeholder - sẽ implement khi có SMTP credentials
export class MailService {
  static async sendMail(_to: string, _subject: string, _html: string) {
    console.log(`📧 [Mock Mail] To: ${_to}, Subject: ${_subject}`);
    // Khi cần gửi mail thật, uncomment code bên dưới:
    // import nodemailer from 'nodemailer';
    // const transporter = nodemailer.createTransport({
    //   host: env.MAIL_HOST,
    //   port: env.MAIL_PORT,
    //   auth: { user: env.MAIL_USER, pass: env.MAIL_PASS },
    // });
    // await transporter.sendMail({ from: env.MAIL_USER, to, subject, html });
  }
}
